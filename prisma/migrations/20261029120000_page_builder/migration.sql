-- Pages built with the page builder
CREATE TABLE IF NOT EXISTS "CustomPage" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "bannerUrl" TEXT,
  "bannerX" INTEGER NOT NULL DEFAULT 50,
  "bannerY" INTEGER NOT NULL DEFAULT 30,
  "blocks" JSONB NOT NULL DEFAULT '[]',
  "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomPage_slug_key" ON "CustomPage"("slug");
CREATE INDEX IF NOT EXISTS "CustomPage_status_idx" ON "CustomPage"("status");

-- Editable site menu
CREATE TABLE IF NOT EXISTS "NavItem" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "NavItem_position_idx" ON "NavItem"("position");
