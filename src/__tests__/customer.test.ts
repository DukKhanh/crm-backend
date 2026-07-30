import request from 'supertest';

jest.mock('expo-server-sdk', () => {
  class MockExpo {
    static isExpoPushToken() { return true; }
    sendPushNotificationsAsync() { return Promise.resolve(); }
  }
  return { Expo: MockExpo };
});

import app from '../app';

describe('CRM Backend API Tests', () => {
  it('returns 404 with a request ID for an unknown endpoint', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.requestId).toBeTruthy();
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('blocks customer access without an access token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Không có access token');
  });

  it('exposes a liveness endpoint without requiring the database', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
