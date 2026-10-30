
const request = require('supertest');
const app = require('../server');

describe('Task Management API Tests', () => {
  test('GET /tasks/test-error returns 500 Internal Server Error', async () => {
    const response = await request(app).get('/tasks/test-error');

expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(false);
  });

  test('GET /invalid-route returns 404 Not Found', async () => {
    const response = await request(app).get('/invalid-route');

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
