-- Optional structured career story for a speaker (timeline + strengths). Safe to re-run.
ALTER TABLE "Speaker" ADD COLUMN IF NOT EXISTS "highlights" JSONB;
