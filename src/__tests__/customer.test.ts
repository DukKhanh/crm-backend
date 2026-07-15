import request from 'supertest';

// Mock expo-server-sdk to avoid native module issues in test environment
jest.mock('expo-server-sdk', () => {
  class MockExpo {
    static isExpoPushToken() {
      return true;
    }
    sendPushNotificationsAsync() {
      return Promise.resolve();
    }
  }
  return { Expo: MockExpo };
});

import app from '../app';

describe('CRM Backend — Integration Tests', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
  });

  it('returns 401 when accessing /api/customers without a token', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided, access denied');
  });
});