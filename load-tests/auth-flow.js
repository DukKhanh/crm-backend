import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramp_auth: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<750', 'p(99)<1500'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const email = __ENV.TEST_EMAIL;
const password = __ENV.TEST_PASSWORD;

export default function () {
  const login = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json', 'x-device-id': `k6-${__VU}`, 'x-device-name': 'k6-load-test' },
  });
  check(login, { 'login status 200': (response) => response.status === 200 });
  if (login.status !== 200) return;

  const payload = login.json();
  const customers = http.get(`${baseUrl}/api/customers`, { headers: { Authorization: `Bearer ${payload.token}` } });
  check(customers, { 'customers status 200': (response) => response.status === 200 });

  const refresh = http.post(`${baseUrl}/api/auth/refresh`, JSON.stringify({ refreshToken: payload.refreshToken }), {
    headers: { 'Content-Type': 'application/json', 'x-device-id': `k6-${__VU}`, 'x-device-name': 'k6-load-test' },
  });
  check(refresh, { 'refresh status 200': (response) => response.status === 200 });
  sleep(1);
}
