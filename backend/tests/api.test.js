const http = require('http');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const { CourseModel } = require('../src/models/courseModel');

const TEST_PORT = 5099;
let server;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function runTests() {
  console.log('------------------------------------------------------------');
  console.log(' Running CodeCraftHub Backend API Test Suite ');
  console.log('------------------------------------------------------------');

  server = app.listen(TEST_PORT);
  const BASE_URL = `http://localhost:${TEST_PORT}`;

  try {
    // 0. Test Health Endpoint
    console.log('\n[1] Testing GET /api/health');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthData.status === 'healthy', 'Health check reports "healthy"');

    // 1. Test GET /api/courses
    console.log('\n[2] Testing GET /api/courses');
    const getAllRes = await fetch(`${BASE_URL}/api/courses`);
    const getAllData = await getAllRes.json();
    assert(getAllRes.status === 200, 'GET /api/courses returns 200 OK');
    assert(getAllData.success === true, 'Response contains success: true');
    assert(Array.isArray(getAllData.data), 'Response data is an array');
    assert(getAllData.data.length > 0, `Retrieved ${getAllData.data.length} initial courses`);

    const sampleCourse = getAllData.data[0];

    // 2. Test GET /api/courses/:id
    console.log(`\n[3] Testing GET /api/courses/${sampleCourse.id}`);
    const getOneRes = await fetch(`${BASE_URL}/api/courses/${sampleCourse.id}`);
    const getOneData = await getOneRes.json();
    assert(getOneRes.status === 200, 'GET /api/courses/:id returns 200 OK');
    assert(getOneData.data.id === sampleCourse.id, 'Returned course ID matches requested ID');
    assert(getOneData.data.title === sampleCourse.title, 'Course title matches correctly');

    // 3. Test POST /api/courses (Create)
    console.log('\n[4] Testing POST /api/courses');
    const newCoursePayload = {
      title: 'Automated Test Course: Distributed Systems',
      description: 'Hands-on architectural patterns for high-throughput distributed systems and messaging brokers.',
      instructor: 'Prof. Testing Expert',
      category: 'Cloud Computing',
      status: 'Active',
      duration: '4 Weeks',
      level: 'Advanced',
      enrolledStudents: 50,
      rating: 4.95
    };

    const postRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoursePayload)
    });
    const postData = await postRes.json();
    assert(postRes.status === 201, 'POST /api/courses returns 201 Created');
    assert(postData.success === true, 'Response reports success: true');
    assert(postData.data.title === newCoursePayload.title, 'Created title matches payload');
    assert(Boolean(postData.data.id), `Generated ID: ${postData.data.id}`);
    const createdId = postData.data.id;

    // 4. Test Disk Persistence
    console.log('\n[5] Testing JSON Disk Persistence');
    const coursesOnDisk = CourseModel.readAll();
    const diskCourse = coursesOnDisk.find(c => c.id === createdId);
    assert(Boolean(diskCourse), 'Newly created course is persisted in data/courses.json');
    assert(diskCourse.title === newCoursePayload.title, 'Disk content matches created course');

    // 5. Test PUT /api/courses/:id (Update)
    console.log(`\n[6] Testing PUT /api/courses/${createdId}`);
    const updatePayload = {
      title: 'Updated Test Course: Advanced Distributed Systems',
      status: 'Completed',
      duration: '5 Weeks'
    };
    const putRes = await fetch(`${BASE_URL}/api/courses/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const putData = await putRes.json();
    assert(putRes.status === 200, 'PUT /api/courses/:id returns 200 OK');
    assert(putData.data.title === updatePayload.title, 'Course title was updated successfully');
    assert(putData.data.status === 'Completed', 'Course status was updated to Completed');
    assert(putData.data.duration === '5 Weeks', 'Course duration was updated');

    // 6. Test Filtering
    console.log('\n[7] Testing Query Parameters & Filtering');
    const filterRes = await fetch(`${BASE_URL}/api/courses?status=Completed`);
    const filterData = await filterRes.json();
    assert(filterRes.status === 200, 'Filter by status returns 200');
    assert(filterData.data.every(c => c.status === 'Completed'), 'All filtered items have status Completed');

    // 7. Test Search
    const searchRes = await fetch(`${BASE_URL}/api/courses?search=Distributed`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, 'Search query returns 200');
    assert(searchData.data.some(c => c.id === createdId), 'Search correctly locates newly created item');

    // 8. Test DELETE /api/courses/:id
    console.log(`\n[8] Testing DELETE /api/courses/${createdId}`);
    const deleteRes = await fetch(`${BASE_URL}/api/courses/${createdId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200, 'DELETE /api/courses/:id returns 200 OK');
    assert(deleteData.success === true, 'DELETE response reports success: true');

    // 9. Test Verification of Deletion
    console.log(`\n[9] Verifying Deletion of ${createdId}`);
    const verifyGetRes = await fetch(`${BASE_URL}/api/courses/${createdId}`);
    assert(verifyGetRes.status === 404, 'Fetching deleted course returns 404 Not Found');

    // 10. Test Validation Errors
    console.log('\n[10] Testing Validation and Error Handling');
    const invalidPostRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Missing required title and instructor' })
    });
    const invalidPostData = await invalidPostRes.json();
    assert(invalidPostRes.status === 400, 'Submitting invalid course returns 400 Bad Request');
    assert(invalidPostData.success === false, 'Error response reports success: false');

    const invalidStatusRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Invalid Status Test',
        instructor: 'Test',
        description: 'Test description',
        status: 'NonExistentStatus'
      })
    });
    assert(invalidStatusRes.status === 400, 'Submitting invalid status enumeration returns 400 Bad Request');

    const nonExistentRes = await fetch(`${BASE_URL}/api/courses/NON_EXISTENT_ID_999`);
    assert(nonExistentRes.status === 404, 'Accessing non-existent ID returns 404 Not Found');

    console.log('\n------------------------------------------------------------');
    console.log(' ALL 10 TEST SUITES PASSED SUCCESSFULLY! ');
    console.log('------------------------------------------------------------');
  } catch (err) {
    console.error('\nTest Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
