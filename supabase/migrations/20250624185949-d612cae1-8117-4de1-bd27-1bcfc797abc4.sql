
-- First, let's fix the existing vote counts by manually updating them
UPDATE competition_entries 
SET votes_count = (
  SELECT COUNT(*) 
  FROM competition_votes 
  WHERE competition_entry_id = competition_entries.id
);

UPDATE challenge_responses 
SET points = (
  SELECT COUNT(*) 
  FROM challenge_votes 
  WHERE challenge_response_id = challenge_responses.id
);

-- Drop and recreate the triggers to ensure they work properly
DROP TRIGGER IF EXISTS update_competition_vote_count_trigger ON competition_votes;
DROP TRIGGER IF EXISTS update_challenge_vote_count_trigger ON challenge_votes;

-- Recreate the competition vote trigger with better error handling
CREATE OR REPLACE FUNCTION update_competition_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE competition_entries 
    SET votes_count = (
      SELECT COUNT(*) 
      FROM competition_votes 
      WHERE competition_entry_id = NEW.competition_entry_id
    )
    WHERE id = NEW.competition_entry_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE competition_entries 
    SET votes_count = (
      SELECT COUNT(*) 
      FROM competition_votes 
      WHERE competition_entry_id = OLD.competition_entry_id
    )
    WHERE id = OLD.competition_entry_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the challenge vote trigger with better error handling
CREATE OR REPLACE FUNCTION update_challenge_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenge_responses 
    SET points = (
      SELECT COUNT(*) 
      FROM challenge_votes 
      WHERE challenge_response_id = NEW.challenge_response_id
    )
    WHERE id = NEW.challenge_response_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenge_responses 
    SET points = (
      SELECT COUNT(*) 
      FROM challenge_votes 
      WHERE challenge_response_id = OLD.challenge_response_id
    )
    WHERE id = OLD.challenge_response_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER update_competition_vote_count_trigger
  AFTER INSERT OR DELETE ON competition_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_competition_vote_count();

CREATE TRIGGER update_challenge_vote_count_trigger
  AFTER INSERT OR DELETE ON challenge_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_vote_count();

-- Enable realtime for the tables to support live updates
ALTER TABLE competition_entries REPLICA IDENTITY FULL;
ALTER TABLE challenge_responses REPLICA IDENTITY FULL;
ALTER TABLE competition_votes REPLICA IDENTITY FULL;
ALTER TABLE challenge_votes REPLICA IDENTITY FULL;
