CREATE TABLE IF NOT EXISTS vibe_votes (
  id SERIAL PRIMARY KEY,
  day VARCHAR(10) NOT NULL CHECK (day IN ('fri', 'sat', 'sun', 'thu')),
  voter_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS vibe_votes_voter_unique ON vibe_votes(voter_id);
