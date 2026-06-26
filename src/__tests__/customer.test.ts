import request from 'supertest';
import app from '../app';// Import app của chúng ta

describe('CRM Backend API Tests', () => {
  
  // Test 1: Kiểm tra xem Server có chạy không (Ví dụ gọi thử 1 API sai)
  it('Trả về 404 khi gọi một đường link không tồn tại', async () => {
    const res = await request(app).get('/api/duong-link-bay-ba');
    expect(res.status).toBe(404);
  });

  // Test 2: Kiểm tra bảo mật (Gọi API Khách hàng khi chưa đăng nhập)
  it('Chặn người dùng truy cập API Khách hàng nếu KHÔNG CÓ Token', async () => {
    const res = await request(app).get('/api/customers');
    
    // Mong đợi kết quả là lỗi 401 (Unauthorized)
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Không có token, từ chối truy cập');
  });

});

jest.mock('expo-server-sdk', () => {
  class MockExpo {
    static isExpoPushToken() { return true; }
    sendPushNotificationsAsync() { return Promise.resolve(); }
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
