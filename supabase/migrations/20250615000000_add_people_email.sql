ALTER TABLE people ADD COLUMN IF NOT EXISTS email text;
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
