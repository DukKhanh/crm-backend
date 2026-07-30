# Render deployment and debugging

The repository includes `render.yaml`, a multi-stage non-root Docker image, readiness/liveness endpoints and a Prisma migration command.

## Deployment sequence

1. Run `npm install` and commit the generated `package-lock.json` before the production release so builds are reproducible. The current Dockerfile remains usable before that lockfile is generated.
2. Create the PostgreSQL database and set `DATABASE_URL` with the provider's required TLS parameters.
3. Configure `CORS_ORIGINS`, email credentials and generated JWT secrets in Render.
4. Render executes `npx prisma migrate deploy` as the pre-deploy command.
5. The platform checks `/health/ready`; this endpoint returns 503 until PostgreSQL is reachable.

## Debugging order

Separate build errors from runtime errors. Rebuild the same Docker image locally. For build failures, inspect dependency-lock, Prisma generation and TypeScript output. For startup failures, inspect environment validation, database DNS/TLS, migration output, port binding and readiness. Every response includes `x-request-id`; JSON logs include the same ID, status and duration, allowing a failing request to be traced without logging credentials.
