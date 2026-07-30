# Production security design

## Compromised refresh-token response

Each refresh token contains a signed `sessionId` and `familyId`; only its SHA-256 hash is stored. Rotation atomically consumes the active session and creates a child session. Reuse of a revoked, mismatched or concurrently consumed token revokes every active session in that token family and writes a `REFRESH_REUSE_DETECTED` security event.

Clients should delete local credentials and require login after any 403 refresh response. Users can inspect `GET /api/auth/sessions`, revoke one device with `DELETE /api/auth/sessions/:sessionId`, or revoke every session with `DELETE /api/auth/sessions`.

## Remaining production controls

Use managed secrets and rotate signing keys. Never log tokens. Protect the database with TLS and least-privilege credentials. Add retention and alerting for security events, centralized monitoring, dependency scanning, backups, WAF/DDoS protection and a shared rate-limit store when more than one API instance is running.
