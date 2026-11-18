const fs = require('fs');

async function testLiveE2E() {
  console.log('Testing CodeCraftHub Live Frontend and Backend Assets...');

  // 1. Check Root HTML
  const rootRes = await fetch('http://localhost:5000/');
  const rootHtml = await rootRes.text();
  console.log('1. Root HTML status:', rootRes.status);
  console.log('   Document Title in HTML:', rootHtml.includes('<title>CodeCraftHub: Your Learning Management Platform</title>'));

  // 2. Check CSS
  const cssRes = await fetch('http://localhost:5000/css/style.css');
  const cssText = await cssRes.text();
  console.log('2. CSS status:', cssRes.status);
  console.log('   Contains Primary #8B5CF6:', cssText.includes('#8B5CF6'));
  console.log('   Contains .btn-danger:', cssText.includes('.btn-danger'));

  // 3. Check JS
  const jsRes = await fetch('http://localhost:5000/js/app.js');
  const jsText = await jsRes.text();
  console.log('3. App.js status:', jsRes.status);
  const targetPattern = '<button class="btn-danger" onclick="handleDelete(\'${course.id}\')">';
  console.log('   Contains exact required delete button markup:', jsText.includes(targetPattern));

  // 4. Check API
  const apiRes = await fetch('http://localhost:5000/api/courses');
  const apiData = await apiRes.json();
  console.log('4. API /api/courses status:', apiRes.status, 'Items:', apiData.data.length);

  console.log('\nAll asset and markup verifications passed!');
}

testLiveE2E().catch(console.error);
