/**
 * Automated Verification Script for Practical 7: Authentication & Middleware Pipeline
 * Tests:
 * - Password Hashing via bcryptjs (pre-save hook, salt generation)
 * - User Registration (POST /auth/register - 201 Created & 400 Bad Request)
 * - User Login & JWT Token Signing (POST /auth/login - 200 OK & 401 Unauthorized)
 * - Authenticated User Profile (GET /auth/me - 200 OK & 401 Unauthorized)
 * - Protected Task Endpoints with JWT Auth Middleware (Authorization: Bearer <token>)
 * - Missing & Malformed Token Rejection (401 Unauthorized)
 * - Server-Side Input Validation Middleware for Tasks (400 Bad Request)
 * - Level 3 HATEOAS & Full-Stack CRUD with JWT Auth
 */
const http = require('http');
const mongoose = require('mongoose');

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Practical 7 Authentication & Middleware Suite');
  console.log('----------------------------------------------------\n');

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

  // Clear Users collection for deterministic test runs
  const User = require('./src/models/User');
  const Task = require('./src/models/Task');
  await User.deleteMany({});
  await Task.deleteMany({});

  const app = require('./server.js');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}`;

  function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: { ...headers }
      };

      let dataString = '';
      if (body !== null) {
        dataString = typeof body === 'string' ? body : JSON.stringify(body);
        if (!headers['Content-Type'] && !headers['content-type'] && headers['Content-Type'] !== null) {
          options.headers['Content-Type'] = 'application/json';
        }
        options.headers['Content-Length'] = Buffer.byteLength(dataString);
      }

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, rawBody: responseBody });
          }
        });
      });

      req.on('error', err => reject(err));
      if (body !== null) req.write(dataString);
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  let authToken = null;
  let createdTaskId = null;
  const testEmail = `student_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  console.log('📌 Section 1: Authentication & User Registration (bcrypt + JWT)');
  console.log('--------------------------------------------------------------');

  // Test 1: Register with valid details
  await assertTest('POST /auth/register should hash password, save user, and return 201 Created with JWT', async () => {
    const res = await makeRequest('/auth/register', 'POST', {
      name: 'Practical Student',
      email: testEmail,
      password: testPassword
    });

    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    if (!res.body.success || !res.body.token) throw new Error('Response missing success boolean or token');
    if (!res.body.user || res.body.user.password) throw new Error('Response should contain user and never expose password hash');
    if (res.body.user.email !== testEmail.toLowerCase()) throw new Error('User email was not normalized to lowercase');
    authToken = res.body.token;
  });

  // Test 2: Reject duplicate registration
  await assertTest('POST /auth/register with existing email should return 400 Bad Request', async () => {
    const res = await makeRequest('/auth/register', 'POST', {
      name: 'Duplicate Student',
      email: testEmail,
      password: testPassword
    });

    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    if (res.body.error !== 'User already exists with this email address') {
      throw new Error(`Unexpected error message: ${res.body.error}`);
    }
  });

  // Test 3: Reject registration with short password
  await assertTest('POST /auth/register with short password (<6 chars) should return 400 Bad Request', async () => {
    const res = await makeRequest('/auth/register', 'POST', {
      email: 'shortpass@example.com',
      password: '123'
    });

    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // Test 4: Successful login
  await assertTest('POST /auth/login with valid credentials should return 200 OK and JWT token', async () => {
    const res = await makeRequest('/auth/login', 'POST', {
      email: testEmail,
      password: testPassword
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (!res.body.token) throw new Error('Login response missing JWT token');
    authToken = res.body.token;
  });

  // Test 5: Reject invalid login password
  await assertTest('POST /auth/login with incorrect password should return 401 Unauthorized', async () => {
    const res = await makeRequest('/auth/login', 'POST', {
      email: testEmail,
      password: 'WrongPassword456!'
    });

    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
    if (res.body.token) throw new Error('Invalid login must not return token');
  });

  // Test 6: GET /auth/me with valid Bearer token
  await assertTest('GET /auth/me with Bearer token should return 200 OK and current user profile', async () => {
    const res = await makeRequest('/auth/me', 'GET', null, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (!res.body.user || res.body.user.email !== testEmail.toLowerCase()) {
      throw new Error('User profile did not match authenticated user');
    }
    if (res.body.user.password) throw new Error('User profile must not leak password');
  });

  // Test 7: GET /auth/me without token
  await assertTest('GET /auth/me without token should return 401 Unauthorized', async () => {
    const res = await makeRequest('/auth/me', 'GET');
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  console.log('\n📌 Section 2: Protected Task Routes & Input Validation Middleware');
  console.log('-----------------------------------------------------------------');

  // Test 8: Protected GET /tasks rejects unauthenticated access
  await assertTest('GET /tasks without Authorization header should return 401 Unauthorized', async () => {
    const res = await makeRequest('/tasks');
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  // Test 9: Protected GET /tasks rejects invalid/tampered token
  await assertTest('GET /tasks with invalid token string should return 401 Unauthorized', async () => {
    const res = await makeRequest('/tasks', 'GET', null, {
      Authorization: 'Bearer invalid.token.payload'
    });
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  // Test 10: Server-side validation middleware rejects missing title on POST /tasks
  await assertTest('POST /tasks without title should be rejected by validation middleware with 400 Bad Request', async () => {
    const res = await makeRequest('/tasks', 'POST', { description: 'Missing title' }, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    if (res.body.error !== 'Validation Error' || !Array.isArray(res.body.details)) {
      throw new Error('Response is not structured JSON validation error');
    }
  });

  // Test 11: Server-side validation middleware rejects invalid enum priority
  await assertTest('POST /tasks with invalid priority should be rejected by validation middleware with 400 Bad Request', async () => {
    const res = await makeRequest('/tasks', 'POST', { title: 'Test Task', priority: 'extreme' }, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
  });

  // Test 12: Authenticated POST /tasks creates task and returns HATEOAS links
  await assertTest('POST /tasks with valid Bearer token creates task and returns 201 Created with HATEOAS links', async () => {
    const res = await makeRequest('/tasks', 'POST', {
      title: 'Protected Task Implementation',
      description: 'Testing protected endpoint with JWT',
      priority: 'high',
      status: 'pending'
    }, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    if (!res.body.data || !res.body.data._id) throw new Error('Missing created task ID');
    if (!res.body._links || !res.body._links.self) throw new Error('Missing HATEOAS links');
    createdTaskId = res.body.data._id;
  });

  // Test 13: Authenticated GET /tasks returns task collection
  await assertTest('GET /tasks with Bearer token should return 200 OK with data array', async () => {
    const res = await makeRequest('/tasks', 'GET', null, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (!Array.isArray(res.body.data) || res.body.data.length === 0) {
      throw new Error('Expected tasks array with at least 1 task');
    }
  });

  // Test 14: Authenticated GET /tasks/:id returns single task
  await assertTest('GET /tasks/:id with Bearer token returns single task with HATEOAS links', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'GET', null, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.data._id !== createdTaskId) throw new Error('Task ID mismatch');
  });

  // Test 15: Authenticated PATCH /tasks/:id transitions status
  await assertTest('PATCH /tasks/:id with Bearer token updates status to in-progress', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'PATCH', { status: 'in-progress' }, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.data.status !== 'in-progress') throw new Error('Task status was not updated');
    if (!res.body._links.complete) throw new Error('In-progress task should expose complete link');
  });

  // Test 16: Authenticated PUT /tasks/:id updates task
  await assertTest('PUT /tasks/:id with Bearer token updates task title', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'PUT', {
      title: 'Updated Protected Task Title',
      status: 'completed'
    }, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    if (res.body.data.title !== 'Updated Protected Task Title') throw new Error('Task title was not updated');
    if (res.body.data.status !== 'completed') throw new Error('Task status was not updated to completed');
  });

  // Test 17: Authenticated DELETE /tasks/:id removes task
  await assertTest('DELETE /tasks/:id with Bearer token removes task from MongoDB', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'DELETE', null, {
      Authorization: `Bearer ${authToken}`
    });

    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);

    const verifyRes = await makeRequest(`/tasks/${createdTaskId}`, 'GET', null, {
      Authorization: `Bearer ${authToken}`
    });
    if (verifyRes.status !== 404) throw new Error('Deleted task should return 404 Not Found');
  });

  // Test 18: Global Error Handler simulation
  await assertTest('GET /tasks/test-error triggers Global Error Handler with 500 status', async () => {
    const res = await makeRequest('/tasks/test-error');
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
  });

  console.log('\n----------------------------------------------------');
  console.log(`📊 Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------');

  server.close();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
