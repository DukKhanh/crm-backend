DO $$ BEGIN
  CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS','LOGIN_FAILURE','TOKEN_ROTATED','REFRESH_REUSE_DETECTED','LOGOUT','SESSION_REVOKED','PASSWORD_RESET');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "RefreshSession"
  ADD COLUMN IF NOT EXISTS "familyId" TEXT,
  ADD COLUMN IF NOT EXISTS "parentSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "replacedById" TEXT,
  ADD COLUMN IF NOT EXISTS "revokeReason" TEXT,
  ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT,
  ADD COLUMN IF NOT EXISTS "deviceName" TEXT,
  ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

UPDATE "RefreshSession" SET "familyId" = "id" WHERE "familyId" IS NULL;
ALTER TABLE "RefreshSession" ALTER COLUMN "familyId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "RefreshSession_familyId_revokedAt_idx" ON "RefreshSession"("familyId", "revokedAt");

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
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
CREATE INDEX IF NOT EXISTS "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_familyId_idx" ON "SecurityEvent"("familyId");
DO $$ BEGIN
  ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
