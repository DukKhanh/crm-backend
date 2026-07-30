"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
jest.mock('expo-server-sdk', () => {
    class MockExpo {
        static isExpoPushToken() { return true; }
        sendPushNotificationsAsync() { return Promise.resolve(); }
    }
    return { Expo: MockExpo };
});
const app_1 = __importDefault(require("../app"));
describe('CRM Backend API Tests', () => {
    it('returns 404 with a request ID for an unknown endpoint', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/unknown');
        expect(res.status).toBe(404);
        expect(res.body.requestId).toBeTruthy();
        expect(res.headers['x-request-id']).toBeTruthy();
    });
    it('blocks customer access without an access token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/customers');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Không có access token');
    });
    it('exposes a liveness endpoint without requiring the database', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/health/live');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });
});
