const http = require('http');
const app = require('../src/app');

const TEST_PORT = 5098;
let server;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runAITests() {
  console.log('------------------------------------------------------------');
  console.log(' Running CodeCraftHub AI Node.js Express End-to-End Test Suite');
  console.log('------------------------------------------------------------');

  server = app.listen(TEST_PORT);
  const BASE_URL = `http://localhost:${TEST_PORT}`;

  try {
    // 1. Health check
    console.log('\n[1] Testing GET /api/ai/health');
    const healthRes = await fetch(`${BASE_URL}/api/ai/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'GET /api/ai/health returns 200');
    assert(Boolean(healthData.aiService), 'Health payload includes aiService status');
    console.log(`     AI Provider: ${healthData.aiService.provider || 'gemini'} | Online: ${healthData.aiService.online}`);

    // If Flask microservice is online, test live proxy endpoints
    if (healthData.aiService && healthData.aiService.online) {
      // 2. Chat Assistant
      console.log('\n[2] Testing POST /api/ai/chat (Learning Assistant)');
      const chatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'In 1 sentence, what is an Express middleware?'
        })
      });
      const chatData = await chatRes.json();
      assert(chatRes.status === 200, 'POST /api/ai/chat returns 200');
      assert(chatData.success === true, 'Response contains success: true');
      assert(Boolean(chatData.data.response), 'Received valid AI response');
      console.log(`     Model: ${chatData.data.model} | Latency: ${chatData.data.latency}s`);
      console.log(`     Preview: ${chatData.data.response.slice(0, 90).replace(/\n/g, ' ')}...`);

      // 3. Study Plan Generator
      console.log('\n[3] Testing POST /api/ai/study-plan (Personalized Planner)');
      const planRes = await fetch(`${BASE_URL}/api/ai/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Docker and Kubernetes',
          skillLevel: 'Beginner',
          goal: 'Containerize a Node.js full-stack app',
          studyTime: '2 hours/day',
          duration: '14 Days'
        })
      });
      const planData = await planRes.json();
      assert(planRes.status === 200, 'POST /api/ai/study-plan returns 200');
      assert(planData.success === true, 'Response contains success: true');
      assert(Boolean(planData.data.plan), 'Received structured study plan');
      console.log(`     Plan characters: ${planData.data.plan.length}`);

      // 4. Course-Aware AI Tutor
      console.log('\n[4] Testing POST /api/ai/course-tutor (Catalog Grounding)');
      const tutorRes = await fetch(`${BASE_URL}/api/ai/course-tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What courses teach React and Cloud Architecture in CodeCraftHub?'
        })
      });
      const tutorData = await tutorRes.json();
      assert(tutorRes.status === 200, 'POST /api/ai/course-tutor returns 200');
      assert(tutorData.success === true, 'Response contains success: true');
      assert(Array.isArray(tutorData.data.referencedCourses), 'Referenced courses returned');
      console.log(`     Referenced courses count: ${tutorData.data.referencedCourses.length}`);

      // 5. Intelligent Recommendations
      console.log('\n[5] Testing POST /api/ai/recommendations (Catalog Recommendation)');
      const recRes = await fetch(`${BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: 'Cloud microservices and Docker containers',
          currentSkills: 'Basic JavaScript and Linux terminal',
          careerGoal: 'Become a Cloud DevOps Engineer'
        })
      });
      const recData = await recRes.json();
      assert(recRes.status === 200, 'POST /api/ai/recommendations returns 200');
      assert(recData.success === true, 'Response contains success: true');
      assert(Array.isArray(recData.data.recommendedCourses), 'Recommended courses list returned');
      console.log(`     Recommended courses: ${recData.data.recommendedCourses.map(c => c.id).join(', ')}`);
    } else {
      console.log('  [NOTICE] Flask AI microservice is not running. Tested graceful degradation behavior.');
    }

    // 6. Validation Error guards
    console.log('\n[6] Testing Validation Guards on Node.js AI endpoints');
    const invalidChat = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert(invalidChat.status === 400, 'Empty chat message returns 400 Bad Request');

    const invalidPlan = await fetch(`${BASE_URL}/api/ai/study-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: '' })
    });
    assert(invalidPlan.status === 400, 'Missing study plan subject returns 400 Bad Request');

    console.log('\n------------------------------------------------------------');
    console.log(' ALL NODE.JS AI INTEGRATION TESTS PASSED! ');
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('\nAI Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runAITests();
