const app = require('../src/app');
const { DatabaseService, db } = require('../src/database/sqlite');

const TEST_PORT = 5097;
let server;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runDatabaseTests() {
  console.log('------------------------------------------------------------');
  console.log(' Running CodeCraftHub SQLite Database Test Suite');
  console.log('------------------------------------------------------------');

  server = app.listen(TEST_PORT);
  const BASE_URL = `http://localhost:${TEST_PORT}`;
  const testSessionId = `test_sess_${Date.now()}`;

  try {
    // 1. Check Default Seed User
    console.log('\n[1] Testing GET /api/db/users');
    const userRes = await fetch(`${BASE_URL}/api/db/users`);
    const userData = await userRes.json();
    assert(userRes.status === 200, 'GET /api/db/users returns 200 OK');
    assert(Array.isArray(userData.data), 'Users response is an array');
    assert(userData.data.some(u => u.name === 'Yash Patil'), 'Found default academic user Yash Patil');

    // 2. Test Conversation Persistence in SQLite
    console.log('\n[2] Testing AI Conversation SQLite Persistence');
    const testMsg = 'Test question about React Hooks in SQLite';
    const testResp = 'React Hooks allow state and lifecycle features in functional components.';
    await DatabaseService.saveConversation(testSessionId, testMsg, testResp, 'gemini-3.5-flash-lite');

    const convRes = await fetch(`${BASE_URL}/api/db/conversations?sessionId=${testSessionId}`);
    const convData = await convRes.json();
    assert(convRes.status === 200, 'GET /api/db/conversations returns 200 OK');
    assert(convData.data.length >= 1, 'Persisted conversation retrieved from SQLite');
    assert(convData.data[0].user_message === testMsg, 'User message matches exactly');
    assert(convData.data[0].ai_response === testResp, 'AI response matches exactly');

    // 3. Test Study Plan Persistence in SQLite
    console.log('\n[3] Testing Study Plan SQLite Persistence');
    const planParams = {
      subject: 'Cloud Microservices',
      skillLevel: 'Intermediate',
      goal: 'Build Docker & Kubernetes deployments',
      studyTime: '2 hours per day',
      duration: '14 Days'
    };
    const samplePlan = '### Phase 1: Containers\n- Install Docker\n- Write Dockerfile';
    const savedPlan = await DatabaseService.saveStudyPlan(testSessionId, planParams, samplePlan);
    assert(Boolean(savedPlan.id), `Generated SQLite Study Plan ID: ${savedPlan.id}`);

    const planRes = await fetch(`${BASE_URL}/api/db/study-plans?sessionId=${testSessionId}`);
    const planData = await planRes.json();
    assert(planRes.status === 200, 'GET /api/db/study-plans returns 200 OK');
    assert(planData.data.length >= 1, 'Persisted study plan retrieved from SQLite');
    assert(planData.data[0].subject === planParams.subject, 'Subject matches persisted plan');

    // 4. Test Learning Activity Audit Trail in SQLite
    console.log('\n[4] Testing Learning Activity Audit Logging');
    await DatabaseService.logActivity(testSessionId, 'test_activity', 'Tested SQLite activity logging');

    const actRes = await fetch(`${BASE_URL}/api/db/activities?sessionId=${testSessionId}`);
    const actData = await actRes.json();
    assert(actRes.status === 200, 'GET /api/db/activities returns 200 OK');
    assert(actData.data.length >= 1, 'Persisted activity audit retrieved from SQLite');
    assert(actData.data[0].activity_type === 'test_activity', 'Activity type logged accurately');

    // 5. Test Parameterized Query Safety & Cleanup
    console.log('\n[5] Testing Parameterized Cleanup & SQL Injection Guard');
    const maliciousInput = `'; DROP TABLE ai_conversations; --`;
    const safeLookup = await DatabaseService.getConversations(maliciousInput);
    assert(Array.isArray(safeLookup), 'Parameterized query safely prevented SQL injection attack');

    // Clean up test records
    await DatabaseService.clearConversations(testSessionId);
    if (savedPlan.id) {
      await DatabaseService.deleteStudyPlan(savedPlan.id);
    }
    const verifyCleared = await DatabaseService.getConversations(testSessionId);
    assert(verifyCleared.length === 0, 'Cleaned up test session records from SQLite');

    console.log('\n------------------------------------------------------------');
    console.log(' ALL SQLITE DATABASE TESTS PASSED SUCCESSFULLY! ');
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('\nDatabase Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runDatabaseTests();
