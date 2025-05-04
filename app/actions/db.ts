import { neon } from '@neondatabase/serverless';
import { League, Team, Player, Match, MatchStats, PlayerMatchStats, Referee } from '../types';

const sql = neon(process.env.DATABASE_URL);

// League operations
export async function createLeague(league: Omit<League, 'league_id'>) {
    const result = await sql`
        INSERT INTO league (name, city, country)
        VALUES (${league.name}, ${league.city}, ${league.country})
        RETURNING *
    `;
    return result[0];
}

export async function getLeagues() {
    return await sql`SELECT * FROM league ORDER BY name`;
}

// Team operations
export async function createTeam(team: Omit<Team, 'team_id'>) {
    const result = await sql`
        INSERT INTO team (team_name, coach_name, wins, losses, draws, league_id)
        VALUES (${team.team_name}, ${team.coach_name}, ${team.wins}, ${team.losses}, ${team.draws}, ${team.league_id})
        RETURNING *
    `;
    return result[0];
}

export async function getTeamsByLeague(leagueId: number) {
    return await sql`
        SELECT * FROM team 
        WHERE league_id = ${leagueId}
        ORDER BY wins DESC, draws DESC
    `;
}

// Player operations
export async function createPlayer(player: Omit<Player, 'player_id'>) {
    const result = await sql`
        INSERT INTO player (first_name, last_name, age, jersey_number, team_id)
        VALUES (${player.first_name}, ${player.last_name}, ${player.age}, ${player.jersey_number}, ${player.team_id})
        RETURNING *
    `;
    return result[0];
}

export async function getPlayersByTeam(teamId: number) {
    return await sql`
        SELECT * FROM player 
        WHERE team_id = ${teamId}
        ORDER BY jersey_number
    `;
}

// Match operations
export async function createMatch(match: Omit<Match, 'match_id'>) {
    const result = await sql`
        INSERT INTO match (date, location, league_id, home_team_id, away_team_id, referee_id)
        VALUES (${match.date}, ${match.location}, ${match.league_id}, ${match.home_team_id}, ${match.away_team_id}, ${match.referee_id})
        RETURNING *
    `;
    return result[0];
}

export async function getMatchesByLeague(leagueId: number) {
    return await sql`
        SELECT m.*, 
               ht.team_name as home_team_name,
               at.team_name as away_team_name,
               r.first_name as referee_first_name,
               r.last_name as referee_last_name
        FROM match m
        JOIN team ht ON m.home_team_id = ht.team_id
        JOIN team at ON m.away_team_id = at.team_id
        JOIN referee r ON m.referee_id = r.referee_id
        WHERE m.league_id = ${leagueId}
        ORDER BY m.date DESC
    `;
}

// Match Stats operations
export async function createMatchStats(stats: MatchStats) {
    const result = await sql`
        INSERT INTO match_stats (match_id, possession_home, possession_away, fouls_home, fouls_away, corners_home, corners_away)
        VALUES (${stats.match_id}, ${stats.possession_home}, ${stats.possession_away}, ${stats.fouls_home}, ${stats.fouls_away}, ${stats.corners_home}, ${stats.corners_away})
        RETURNING *
    `;
    return result[0];
}

// Player Match Stats operations
export async function createPlayerMatchStats(stats: PlayerMatchStats) {
    const result = await sql`
        INSERT INTO player_match_stats (match_id, player_id, shots, shots_on_target, assists, minutes_played, yellow_cards, red_cards)
        VALUES (${stats.match_id}, ${stats.player_id}, ${stats.shots}, ${stats.shots_on_target}, ${stats.assists}, ${stats.minutes_played}, ${stats.yellow_cards}, ${stats.red_cards})
        RETURNING *
    `;
    return result[0];
}

export async function getPlayerStats(playerId: number) {
    return await sql`
        SELECT 
            p.first_name,
            p.last_name,
            COUNT(DISTINCT pms.match_id) as matches_played,
            SUM(pms.shots) as total_shots,
            SUM(pms.shots_on_target) as total_shots_on_target,
            SUM(pms.assists) as total_assists,
            SUM(pms.yellow_cards) as total_yellow_cards,
            SUM(pms.red_cards) as total_red_cards
        FROM player p
        LEFT JOIN player_match_stats pms ON p.player_id = pms.player_id
        WHERE p.player_id = ${playerId}
        GROUP BY p.player_id, p.first_name, p.last_name
    `;
} 