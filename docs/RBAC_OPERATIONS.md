# RBAC operations

## Apply database changes

```bash
npm ci
npm run prisma:generate
npm run migrate:deploy
```

The archive now contains an idempotent baseline migration because the previous source only included a later security migration. Back up an existing database before the first deployment and run the migration in staging first.

## Bootstrap an admin

Set these values locally or in the deployment secret manager:

```dotenv
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-unique-password-with-at-least-12-characters
ADMIN_NAME=CRM Administrator
```

Then run:

```bash
npm run seed:admin
```

The command is idempotent. Running it for an existing user promotes and activates that account, changes its password, increments `tokenVersion`, and therefore invalidates existing access tokens.

## Verify authorization

```bash
npm run typecheck
npm test
```

Minimum manual checks:

1. Register two employees and confirm neither can read the other's customer by ID.
2. Confirm an employee cannot assign a task to another user.
3. Promote one user to manager and confirm the old access token is rejected.
4. Log in again as manager and confirm cross-owner CRM access works.
5. Confirm manager cannot call role/status mutation endpoints.
6. Confirm admin cannot demote or disable the final active admin.
7. Inspect `/api/security-events` for denied access and administrative changes.

## Verify Admin Lite on a mobile device

1. Set `EXPO_PUBLIC_API_URL` to a backend address reachable from the device; do not use `localhost` from a physical phone.
2. Log in through the shared login screen with the seeded Admin account.
3. Confirm the app opens Admin Overview automatically without a role selector.
4. Change a test user's role/status, then confirm that user's existing session is rejected and a new login receives the updated permissions.
5. Confirm a Manager cannot open Admin endpoints even if a client route is invoked manually.

## API documentation

- Interactive documentation: `/api-docs`
- Machine-readable specification: `/api/openapi.json`
- Source: `docs/openapi.yaml`

Run `npm test` to verify that the documented Admin endpoints and Swagger UI are published.
