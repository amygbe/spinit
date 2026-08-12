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

-- One community rating per person per recipe. "Person" is an anonymous
-- per-device id the client generates once and keeps — no accounts, no PII.
-- Re-rating replaces the old row (upsert on the primary key).
CREATE TABLE IF NOT EXISTS ratings (
  recipe_id  TEXT NOT NULL,
  rater_id   TEXT NOT NULL,               -- anonymous device id (uuid)
  -- Half-star steps: 0.5, 1, 1.5 … 5. The CHECK enforces the step so no
  -- client can write 3.7 even if the validator ever regresses.
  stars      REAL NOT NULL CHECK (stars >= 0.5 AND stars <= 5 AND (stars * 2) = CAST(stars * 2 AS INTEGER)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_hash    TEXT,                        -- salted, for rate limiting only
  PRIMARY KEY (recipe_id, rater_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_recipe ON ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ratings_iphash ON ratings(ip_hash, updated_at DESC);

-- Small site settings, one JSON value per key. Currently just 'tips'.
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
