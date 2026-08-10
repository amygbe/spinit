-- Recipes people have submitted, in every state.
-- The catalogue is only ever the approved rows; nothing is deleted on
-- rejection so a repeat submitter can be recognised.
CREATE TABLE IF NOT EXISTS submissions (
  id           TEXT PRIMARY KEY,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  name         TEXT NOT NULL,
  author       TEXT NOT NULL,
  payload      TEXT NOT NULL,                    -- the recipe, as JSON
  created_at   INTEGER NOT NULL,
  reviewed_at  INTEGER,
  review_note  TEXT,
  ip_hash      TEXT                              -- salted hash, for rate limiting only
);

CREATE INDEX IF NOT EXISTS idx_submissions_status  ON submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_iphash  ON submissions(ip_hash, created_at DESC);
