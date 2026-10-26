-- Officer: photo, super admin, deactivate, forced password change, sign-in lockout
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "failedLogins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Officer" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- Notes keep their byline when an officer is removed
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "authorName" TEXT NOT NULL DEFAULT '';
UPDATE "Note" n SET "authorName" = o."name" FROM "Officer" o WHERE n."authorId" = o."id" AND n."authorName" = '';
ALTER TABLE "Note" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "Note" DROP CONSTRAINT IF EXISTS "Note_authorId_fkey";
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Application" DROP CONSTRAINT IF EXISTS "Application_reviewedById_fkey";
ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PageContent" DROP CONSTRAINT IF EXISTS "PageContent_updatedById_fkey";
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Editable home-page numbers, hero caption, contact details
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "statMembers" TEXT NOT NULL DEFAULT '60+';
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "statSpeakers" TEXT NOT NULL DEFAULT '12+';
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "statSessions" TEXT NOT NULL DEFAULT '24+';
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "heroCaption" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT;

-- Uploaded photos
CREATE TABLE IF NOT EXISTS "Photo" (
  "id" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "data" BYTEA NOT NULL,
  "size" INTEGER NOT NULL,
  "label" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- Officer invitations
CREATE TABLE IF NOT EXISTS "Invitation" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL DEFAULT '',
  "role" "OfficerRole" NOT NULL,
  "classYear" TEXT,
  "tokenHash" TEXT NOT NULL,
  "invitedById" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_tokenHash_key" ON "Invitation"("tokenHash");
CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email");
ALTER TABLE "Invitation" DROP CONSTRAINT IF EXISTS "Invitation_invitedById_fkey";
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Officer access requests (public sign-up page)
DO $$ BEGIN
  CREATE TYPE "AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "AccessRequest" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "classYear" TEXT,
  "roleWanted" TEXT NOT NULL DEFAULT '',
  "message" TEXT NOT NULL DEFAULT '',
  "status" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING',
  "decidedBy" TEXT,
  "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AccessRequest_status_idx" ON "AccessRequest"("status");
CREATE INDEX IF NOT EXISTS "AccessRequest_email_idx" ON "AccessRequest"("email");
