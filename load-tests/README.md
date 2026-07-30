# k6 load tests

Run only against a dedicated test environment and test database.

```bash
k6 run -e BASE_URL=https://your-test-api.example.com \
  -e TEST_EMAIL=loadtest@example.com \
  -e TEST_PASSWORD='strong-password' \
  load-tests/auth-flow.js
```

The included profile ramps to 500 virtual users. Increase gradually only after reviewing p95/p99 latency, error rate, PostgreSQL connections, CPU, memory and slow queries. A claim of 100,000 concurrent users requires distributed load generators and measured results; this repository does not claim that capacity without such evidence.
