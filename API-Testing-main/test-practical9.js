/**
 * Automated Verification Script for Practical 9: In-Memory Caching & Query Optimization
 * Tests:
 * 1. Cache HIT/MISS on GET /tasks (all tasks)
 * 2. Cache Invalidation after POST /tasks
 * 3. Cache HIT/MISS on GET /tasks/:id (individual task)
 * 4. Cache Invalidation of both list & item cache after PUT & PATCH
 * 5. Cache Invalidation after DELETE /tasks/:id
 * 6. Debug Endpoint (GET /tasks/debug/cache) verifying metrics & keys
 * 7. Verification that route ordering prevents "debug" from being treated as an ObjectId
 */

const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function runPractical9Tests() {
  console.log('================================================================');
  console.log('🚀 Practical 9 Verification Suite: In-Memory Caching (node-cache)');
  console.log('================================================================\n');

  let mongoServer = null;
  const defaultUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';

  try {
    await mongoose.connect(defaultUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Connected to local MongoDB at: ${defaultUri}`);
  } catch (err) {
    console.log('ℹ️ Local MongoDB connection timed out. Initializing MongoMemoryServer...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
    await mongoose.connect(mongoUri);
    console.log(`📦 Connected to In-Memory MongoDB Server at: ${mongoUri}`);
  }

  const User = require('./src/models/User');
  const Task = require('./src/models/Task');
  const cache = require('./src/utils/cache');

  // Clear cache and DB for clean, deterministic test run
  cache.flushAll();
  cache.resetMetrics();
  await Task.deleteMany({});
  await User.deleteMany({});

  // Seed user
  const user = new User({
    name: 'Cache Tester',
    email: 'cachetest@example.com',
    password: 'password123'
  });
  await user.save();

  const secret = process.env.JWT_SECRET || 'adwf_jwt_secret_key_practical_7_2026';
  const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '1h' });

  // Spin up test server instance
  const app = require('./server.js');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}`;

  function request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      if (body) {
        headers['Content-Type'] = 'application/json';
      }

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers
      };

      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      });
      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST A: GET all tasks (MISS -> HIT)
    // -------------------------------------------------------------
    console.log('\n--- TEST A: GET all tasks (HIT/MISS behavior) ---');
    const missCountBeforeA = cache.getCacheMisses();
    const resA1 = await request('/tasks');
    assert(resA1.status === 200, 'First GET /tasks returns 200 OK');
    assert(cache.getCacheMisses() === missCountBeforeA + 1, 'First GET /tasks causes CACHE MISS');
    assert(cache.get('all_tasks') !== undefined, 'all_tasks entry is now stored in cache');

    const hitCountBeforeA = cache.getCacheHits();
    const resA2 = await request('/tasks');
    assert(resA2.status === 200, 'Second GET /tasks returns 200 OK');
    assert(cache.getCacheHits() === hitCountBeforeA + 1, 'Second GET /tasks causes CACHE HIT');

    // -------------------------------------------------------------
    // TEST B: POST new task -> Invalidate all_tasks cache
    // -------------------------------------------------------------
    console.log('\n--- TEST B: POST task invalidates all_tasks cache ---');
    const resBPost = await request('/tasks', 'POST', {
      title: 'Task 1 for Practical 9',
      description: 'Testing cache invalidation on create',
      priority: 'high',
      status: 'pending'
    });
    assert(resBPost.status === 201, 'POST /tasks returns 201 Created');
    assert(cache.get('all_tasks') === undefined, 'all_tasks cache was successfully invalidated after POST');

    const createdTaskId = resBPost.data.data._id;
    const missCountBeforeB = cache.getCacheMisses();
    const resBGet = await request('/tasks');
    assert(resBGet.status === 200, 'GET /tasks after POST returns 200 OK');
    assert(cache.getCacheMisses() === missCountBeforeB + 1, 'GET /tasks after POST causes CACHE MISS');
    assert(
      resBGet.data.data.some((t) => t._id === createdTaskId),
      'Newly created task appears in fresh MongoDB query response'
    );

    // -------------------------------------------------------------
    // TEST C: GET single task by ID (MISS -> HIT)
    // -------------------------------------------------------------
    console.log('\n--- TEST C: GET task by ID (task_<id> caching) ---');
    const taskKey = `task_${createdTaskId}`;
    assert(cache.get(taskKey) === undefined, 'Individual task is not yet cached');

    const missCountBeforeC = cache.getCacheMisses();
    const resC1 = await request(`/tasks/${createdTaskId}`);
    assert(resC1.status === 200, 'First GET /tasks/:id returns 200 OK');
    assert(cache.getCacheMisses() === missCountBeforeC + 1, 'First GET /tasks/:id causes CACHE MISS');
    assert(cache.get(taskKey) !== undefined, `${taskKey} is now stored in cache`);

    const hitCountBeforeC = cache.getCacheHits();
    const resC2 = await request(`/tasks/${createdTaskId}`);
    assert(resC2.status === 200, 'Second GET /tasks/:id returns 200 OK');
    assert(cache.getCacheHits() === hitCountBeforeC + 1, 'Second GET /tasks/:id causes CACHE HIT');

    // -------------------------------------------------------------
    // TEST D: PUT/PATCH task -> Invalidate both all_tasks & task_<id>
    // -------------------------------------------------------------
    console.log('\n--- TEST D: PUT/PATCH invalidates both all_tasks & task_<id> ---');
    // Ensure all_tasks is cached before update
    await request('/tasks');
    assert(cache.get('all_tasks') !== undefined, 'all_tasks is primed in cache before PUT');
    assert(cache.get(taskKey) !== undefined, `${taskKey} is primed in cache before PUT`);

    const resDPut = await request(`/tasks/${createdTaskId}`, 'PUT', {
      title: 'Task 1 (Updated via PUT)',
      description: 'Updated description',
      status: 'in-progress',
      priority: 'medium'
    });
    assert(resDPut.status === 200, 'PUT /tasks/:id returns 200 OK');
    assert(cache.get('all_tasks') === undefined, 'all_tasks cache was invalidated by PUT');
    assert(cache.get(taskKey) === undefined, `${taskKey} cache was invalidated by PUT`);

    // Fetch single task again - verify fresh data & MISS
    const missCountBeforeD = cache.getCacheMisses();
    const resDGet = await request(`/tasks/${createdTaskId}`);
    assert(resDGet.status === 200, 'GET /tasks/:id returns 200 OK');
    assert(cache.getCacheMisses() === missCountBeforeD + 1, 'GET /tasks/:id causes CACHE MISS after PUT');
    assert(resDGet.data.data.title === 'Task 1 (Updated via PUT)', 'Updated title is returned from MongoDB');

    // Test PATCH invalidation
    assert(cache.get(taskKey) !== undefined, `${taskKey} is cached again`);
    const resDPatch = await request(`/tasks/${createdTaskId}`, 'PATCH', {
      status: 'completed'
    });
    assert(resDPatch.status === 200, 'PATCH /tasks/:id returns 200 OK');
    assert(cache.get('all_tasks') === undefined, 'all_tasks cache was invalidated by PATCH');
    assert(cache.get(taskKey) === undefined, `${taskKey} cache was invalidated by PATCH`);

    // -------------------------------------------------------------
    // TEST E: DELETE task -> Invalidate all_tasks & task_<id>
    // -------------------------------------------------------------
    console.log('\n--- TEST E: DELETE invalidates both all_tasks & task_<id> ---');
    await request('/tasks'); // prime all_tasks
    await request(`/tasks/${createdTaskId}`); // prime taskKey
    assert(cache.get('all_tasks') !== undefined, 'all_tasks primed in cache before DELETE');
    assert(cache.get(taskKey) !== undefined, `${taskKey} primed in cache before DELETE`);

    const resEDel = await request(`/tasks/${createdTaskId}`, 'DELETE');
    assert(resEDel.status === 200, 'DELETE /tasks/:id returns 200 OK');
    assert(cache.get('all_tasks') === undefined, 'all_tasks cache was invalidated by DELETE');
    assert(cache.get(taskKey) === undefined, `${taskKey} cache was invalidated by DELETE`);

    // Verify deleted task is gone
    const resEGet = await request('/tasks');
    assert(
      !resEGet.data.data.some((t) => t._id === createdTaskId),
      'Deleted task no longer appears in GET /tasks'
    );

    // -------------------------------------------------------------
    // TEST F: Debug Endpoint (GET /tasks/debug/cache)
    // -------------------------------------------------------------
    console.log('\n--- TEST F: Debug Endpoint (GET /tasks/debug/cache) ---');
    const resDebug = await request('/tasks/debug/cache');
    assert(resDebug.status === 200, 'GET /tasks/debug/cache returns 200 OK (not intercepted by :id)');
    assert(typeof resDebug.data.cacheHits === 'number', 'Response contains cacheHits count');
    assert(typeof resDebug.data.cacheMisses === 'number', 'Response contains cacheMisses count');
    assert(Array.isArray(resDebug.data.keys), 'Response contains array of active cache keys');
    assert(typeof resDebug.data.stats === 'object', 'Response contains node-cache stats object');
    console.log('  📊 Cache Debug Output:', JSON.stringify(resDebug.data, null, 2));

    // Summary
    console.log('\n================================================================');
    console.log(`🏁 Practical 9 Test Results: ${passedTests}/${totalTests} tests passed!`);
    console.log('================================================================\n');

  } finally {
    server.close();
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

runPractical9Tests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
