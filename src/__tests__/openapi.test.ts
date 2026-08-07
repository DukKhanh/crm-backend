import request from 'supertest';

jest.mock('expo-server-sdk', () => {
  class MockExpo {
    static isExpoPushToken() { return true; }
    sendPushNotificationsAsync() { return Promise.resolve(); }
  }
  return { Expo: MockExpo };
});

import app from '../app';

describe('OpenAPI documentation', () => {
  it('publishes a machine-readable specification for all RBAC admin endpoints', async () => {
    const response = await request(app).get('/api/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/api/admin/overview'].get.security).toEqual([{ bearerAuth: [] }]);
    expect(response.body.paths['/api/users/{id}/role'].patch).toBeDefined();
    expect(response.body.paths['/api/security-events'].get).toBeDefined();
  });

  it('serves the interactive Swagger UI', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('CRM Connect API');
  });
});
