-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS player_match_stats;
DROP TABLE IF EXISTS match_stats;
DROP TABLE IF EXISTS match;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS referee;
DROP TABLE IF EXISTS league;
DROP TABLE IF EXISTS users;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Create League table
CREATE TABLE league (
    league_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

-- Create Team table
CREATE TABLE team (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    coach_name VARCHAR(100) NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    league_id INTEGER REFERENCES league(league_id)
);

-- Create Player table
CREATE TABLE player (
    player_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    jersey_number INTEGER NOT NULL,
    team_id INTEGER REFERENCES team(team_id),
    UNIQUE(team_id, jersey_number)
);

-- Create Referee table
CREATE TABLE referee (
    referee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    experience VARCHAR(100)
);

-- Create Match table
CREATE TABLE match (
    match_id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    location VARCHAR(100) NOT NULL,
    league_id INTEGER REFERENCES league(league_id),
    home_team_id INTEGER REFERENCES team(team_id),
    away_team_id INTEGER REFERENCES team(team_id),
    referee_id INTEGER REFERENCES referee(referee_id),
    CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Create MatchStats table
CREATE TABLE match_stats (
    match_id INTEGER PRIMARY KEY REFERENCES match(match_id),
    possession_home FLOAT CHECK (possession_home BETWEEN 0 AND 100),
    possession_away FLOAT CHECK (possession_away BETWEEN 0 AND 100),
    fouls_home INTEGER DEFAULT 0,
    fouls_away INTEGER DEFAULT 0,
    corners_home INTEGER DEFAULT 0,
    corners_away INTEGER DEFAULT 0,
    CONSTRAINT possession_total CHECK (possession_home + possession_away = 100)
);

-- Create PlayerMatchStats table
CREATE TABLE player_match_stats (
    match_id INTEGER REFERENCES match(match_id),
    player_id INTEGER REFERENCES player(player_id),
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    PRIMARY KEY (match_id, player_id),
    CONSTRAINT valid_shots CHECK (shots_on_target <= shots),
    CONSTRAINT valid_minutes CHECK (minutes_played BETWEEN 0 AND 90),
    CONSTRAINT valid_cards CHECK (red_cards BETWEEN 0 AND 1)
); 