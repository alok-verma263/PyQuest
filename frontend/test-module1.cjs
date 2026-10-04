// Test Suite for Module 1: Data Cleaning (CommonJS)
const fs = require('fs');
const path = require('path');
const http = require('http');

async function runTests() {
  console.log('=== PYQUEST MODULE 1: DATA CLEANING TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: World data-cleaning.json exists and is valid
  console.log('[Test Group 1: Curriculum Content & Structure]');
  const worldPath = path.resolve(__dirname, '../content/worlds/data-cleaning.json');
  assert(fs.existsSync(worldPath), 'data-cleaning.json file exists on disk');

  const worldData = JSON.parse(fs.readFileSync(worldPath, 'utf8'));
  assert(worldData.id === 'data-cleaning', 'World ID is "data-cleaning"');
  assert(worldData.order === 2, 'World order is 2');
  assert(worldData.levels.length === 7, `World contains exactly 7 quests (found: ${worldData.levels.length})`);

  // Verify all 7 Quests
  const expectedQuests = [
    { id: 'quest-1-meet-the-data', title: 'Meet the Data', boss: false },
    { id: 'quest-2-import-forge', title: 'Data Import Forge', boss: false },
    { id: 'quest-3-export-workshop', title: 'Data Export Workshop', boss: false },
    { id: 'quest-4-missing-value-dungeon', title: 'Missing Value Dungeon', boss: false },
    { id: 'quest-5-category-forge', title: 'Category Forge', boss: false },
    { id: 'quest-6-visualization-tower', title: 'Visualization Tower', boss: false },
    { id: 'quest-7-clean-data-boss', title: 'The Clean Data Trial', boss: true },
  ];

  expectedQuests.forEach((q, idx) => {
    const level = worldData.levels[idx];
    assert(level && level.id === q.id, `Quest ${idx + 1} has ID "${q.id}"`);
    assert(level && level.title.includes(q.title), `Quest ${idx + 1} title contains "${q.title}"`);
    assert(level && level.lessons.length > 0, `Quest ${idx + 1} has structured lessons`);
    assert(level && level.challenges.length > 0, `Quest ${idx + 1} has challenges`);
    assert(level && level.xpReward > 0 && level.coinReward > 0, `Quest ${idx + 1} has XP and Coin rewards`);
    if (q.boss) {
      assert(level && level.boss === true, `Quest 7 is designated as final boss trial`);
      assert(level && level.xpReward >= 100, `Boss quest awards high XP (${level.xpReward})`);
    }
  });

  // TEST 2: Practice Datasets
  console.log('\n[Test Group 2: Practice Datasets]');
  const studentCsvPath = path.resolve(__dirname, '../content/data/student_performance.csv');
  const salesCsvPath = path.resolve(__dirname, '../content/data/sales_data.csv');
  const missingCsvPath = path.resolve(__dirname, '../content/data/missing_values_practice.csv');

  assert(fs.existsSync(studentCsvPath), 'student_performance.csv exists in content/data/');
  assert(fs.existsSync(salesCsvPath), 'sales_data.csv exists in content/data/');
  assert(fs.existsSync(missingCsvPath), 'missing_values_practice.csv exists in content/data/');

  const studentContent = fs.readFileSync(studentCsvPath, 'utf8');
  assert(studentContent.includes('Student_ID,Name,Gender,Age,Course,City,Study_Hours,Attendance,Marks'), 'student_performance.csv has syllabus columns');
  assert(studentContent.split('\n').filter(Boolean).length === 11, 'student_performance.csv has header + 10 student rows');

  // TEST 3: Backend API Integration
  console.log('\n[Test Group 3: Backend FastAPI Integration]');
  function fetchJson(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  try {
    const worlds = await fetchJson('http://127.0.0.1:8000/api/worlds');
    assert(Array.isArray(worlds) && worlds.length === 2, `API /api/worlds returns 2 worlds (found ${worlds.length})`);

    const dcWorld = worlds.find((w) => w.id === 'data-cleaning');
    assert(dcWorld !== undefined, 'API returns data-cleaning world');
    assert(dcWorld.levels.length === 7, `API returns 7 quests for data-cleaning world`);

    const quest1 = await fetchJson('http://127.0.0.1:8000/api/worlds/data-cleaning/levels/quest-1-meet-the-data');
    assert(quest1 && quest1.id === 'quest-1-meet-the-data', 'API /api/worlds/data-cleaning/levels/quest-1-meet-the-data returns Quest 1');

    const bossQuest = await fetchJson('http://127.0.0.1:8000/api/worlds/data-cleaning/levels/quest-7-clean-data-boss');
    assert(bossQuest && bossQuest.boss === true, 'API /api/worlds/data-cleaning/levels/quest-7-clean-data-boss returns Boss Quest');
  } catch (err) {
    assert(false, `Backend API check failed: ${err.message}`);
  }

  // TEST 4: Frontend Distribution Build
  console.log('\n[Test Group 4: Frontend Distribution Build]');
  const distHtmlPath = path.resolve(__dirname, 'dist/index.html');
  assert(fs.existsSync(distHtmlPath), 'Production build dist/index.html exists');

  console.log(`\n==================================================`);
  console.log(`Total Tests Run: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
