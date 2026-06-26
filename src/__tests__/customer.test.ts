import request from 'supertest';

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

describe('CRM Backend API Tests', () => {
  it('Trả về 404 khi gọi một đường link không tồn tại', async () => {
    const res = await request(app).get('/api/duong-link-bay-ba');

    expect(res.status).toBe(404);
  });

  it('Chặn người dùng truy cập API Khách hàng nếu KHÔNG CÓ Token', async () => {
    const res = await request(app).get('/api/customers');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Không có token, từ chối truy cập');
  });
});