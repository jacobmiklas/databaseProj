-- Drop existing tables and triggers if they exist
DROP TRIGGER IF EXISTS update_scores_on_player_stats ON player_match_stats;
DROP TRIGGER IF EXISTS update_records_on_match_stats ON match_stats;
DROP FUNCTION IF EXISTS update_match_scores();
DROP FUNCTION IF EXISTS update_team_records();

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS player_match_stats;
DROP TABLE IF EXISTS match_stats;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS referees;
DROP TABLE IF EXISTS leagues;
DROP TABLE IF EXISTS users;

-- Create leagues table
CREATE TABLE IF NOT EXISTS leagues (
    league_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    coach_name VARCHAR(100) NOT NULL,
    league_id INTEGER REFERENCES leagues(league_id) ON DELETE CASCADE,
    UNIQUE(team_name, league_id)
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
    player_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    jersey_number INTEGER NOT NULL,
    team_id INTEGER REFERENCES teams(team_id) ON DELETE CASCADE,
    UNIQUE(jersey_number, team_id)
);

-- Create referees table
CREATE TABLE IF NOT EXISTS referees (
    referee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    experience VARCHAR(100) NOT NULL
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
    match_id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    location VARCHAR(100) NOT NULL,
    league_id INTEGER REFERENCES leagues(league_id) ON DELETE CASCADE,
    home_team_id INTEGER REFERENCES teams(team_id) ON DELETE CASCADE,
    away_team_id INTEGER REFERENCES teams(team_id) ON DELETE CASCADE,
    referee_id INTEGER REFERENCES referees(referee_id) ON DELETE SET NULL,
    CHECK (home_team_id != away_team_id)
);

-- Create match_stats table
CREATE TABLE IF NOT EXISTS match_stats (
    match_id INTEGER PRIMARY KEY REFERENCES matches(match_id) ON DELETE CASCADE,
    possession_home INTEGER NOT NULL CHECK (possession_home BETWEEN 0 AND 100),
    possession_away INTEGER NOT NULL CHECK (possession_away BETWEEN 0 AND 100),
    fouls_home INTEGER NOT NULL DEFAULT 0,
    fouls_away INTEGER NOT NULL DEFAULT 0,
    corners_home INTEGER NOT NULL DEFAULT 0,
    corners_away INTEGER NOT NULL DEFAULT 0,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    CHECK (possession_home + possession_away = 100)
);

-- Create player_match_stats table
CREATE TABLE IF NOT EXISTS player_match_stats (
    match_id INTEGER REFERENCES matches(match_id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(player_id) ON DELETE CASCADE,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    PRIMARY KEY (match_id, player_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

