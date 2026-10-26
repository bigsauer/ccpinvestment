-- Class years offered on the join form
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "classYearFrom" INTEGER NOT NULL DEFAULT 2027;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "classYearTo" INTEGER NOT NULL DEFAULT 2035;

-- Replaceable website photos
CREATE TABLE IF NOT EXISTS "SiteImage" (
  "slot" TEXT NOT NULL,
  "photoUrl" TEXT NOT NULL,
  "focusX" INTEGER NOT NULL DEFAULT 50,
  "focusY" INTEGER NOT NULL DEFAULT 50,
  "alt" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("slot")
);
