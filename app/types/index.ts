export interface League {
    league_id: number;
    name: string;
    city: string;
    country: string;
}

export interface Team {
    team_id: number;
    team_name: string;
    coach_name: string;
    wins: number;
    losses: number;
    draws: number;
    league_id: number;
}

export interface Player {
    player_id: number;
    first_name: string;
    last_name: string;
    age: number;
    jersey_number: number;
    team_id: number;
    team_name?: string;
    league_id?: number;
    goals_scored?: number;
    assists?: number;
    yellow_cards?: number;
    red_cards?: number;
    games_played?: number;
}

export interface Referee {
    referee_id: number;
    first_name: string;
    last_name: string;
    experience: string;
}

export interface Match {
    match_id: number;
    date: Date;
    location: string;
    league_id: number;
    home_team_id: number;
    away_team_id: number;
    referee_id: number;
}

export interface MatchStats {
    match_id: number;
    possession_home: number;
    possession_away: number;
    fouls_home: number;
    fouls_away: number;
    corners_home: number;
    corners_away: number;
    home_score: number;
    away_score: number;
}

export interface PlayerMatchStats {
    match_id: number;
    player_id: number;
    shots: number;
    shots_on_target: number;
    goals: number;
    assists: number;
    minutes_played: number;
    yellow_cards: number;
    red_cards: number;
} 