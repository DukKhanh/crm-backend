CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS','LOGIN_FAILURE','TOKEN_ROTATED','REFRESH_REUSE_DETECTED','LOGOUT','SESSION_REVOKED','PASSWORD_RESET');

ALTER TABLE "RefreshSession"
  ADD COLUMN "familyId" TEXT,
  ADD COLUMN "parentSessionId" TEXT,
  ADD COLUMN "replacedById" TEXT,
  ADD COLUMN "revokeReason" TEXT,
  ADD COLUMN "lastUsedAt" TIMESTAMP(3),
  ADD COLUMN "deviceId" TEXT,
  ADD COLUMN "deviceName" TEXT,
  ADD COLUMN "userAgent" TEXT,
  ADD COLUMN "ipAddress" TEXT;

UPDATE "RefreshSession" SET "familyId" = "id" WHERE "familyId" IS NULL;
ALTER TABLE "RefreshSession" ALTER COLUMN "familyId" SET NOT NULL;
CREATE INDEX "RefreshSession_familyId_revokedAt_idx" ON "RefreshSession"("familyId", "revokedAt");

CREATE TABLE "SecurityEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "type" "SecurityEventType" NOT NULL,
  "sessionId" TEXT,
  "familyId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");
CREATE INDEX "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");
CREATE INDEX "SecurityEvent_familyId_idx" ON "SecurityEvent"("familyId");
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
