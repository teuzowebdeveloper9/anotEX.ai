-- Add segments column to transcriptions table
-- Each segment: { start: number, end: number, text: string }
ALTER TABLE transcriptions ADD COLUMN IF NOT EXISTS segments JSONB;
