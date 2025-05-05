import { neon } from '@neondatabase/serverless';
import { League, Team, Player, Match, MatchStats, PlayerMatchStats, Referee } from '../types';

// Debug the environment variable
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');

function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// League operations
export async function createLeague(league: Omit<League, 'league_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO league (name, city, country)
        VALUES (${league.name}, ${league.city}, ${league.country})
        RETURNING *
    `;
    return result[0];
}

export async function getLeagues() {
    try {
        const sql = getDbConnection();
        console.log('Attempting to fetch leagues...');
        const result = await sql`SELECT * FROM league ORDER BY name`;
        console.log('Leagues fetched successfully:', result.length, 'leagues found');
        return result;
    } catch (error) {
        console.error('Error in getLeagues:', error);
        throw error;
    }
}

export async function updateLeague(leagueId: number, league: Partial<League>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE league
        SET name = ${league.name}, city = ${league.city}, country = ${league.country}
        WHERE league_id = ${leagueId}
        RETURNING *
    `;
    return result[0];
}

export async function deleteLeague(leagueId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM league WHERE league_id = ${leagueId}`;
}

// Team operations
export async function createTeam(team: Omit<Team, 'team_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO team (team_name, coach_name, wins, losses, draws, league_id)
        VALUES (${team.team_name}, ${team.coach_name}, ${team.wins}, ${team.losses}, ${team.draws}, ${team.league_id})
        RETURNING *
    `;
    return result[0];
}

export async function getTeams() {
    try {
        const sql = getDbConnection();
        return await sql`SELECT * FROM team ORDER BY team_name`;
    } catch (error) {
        console.error('Error in getTeams:', error);
        throw error;
    }
}

export async function getTeamsByLeague(leagueId: number) {
    const sql = getDbConnection();
    return await sql`SELECT * FROM team WHERE league_id = ${leagueId} ORDER BY team_name`;
}

export async function updateTeam(teamId: number, team: Partial<Team>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE team
        SET team_name = ${team.team_name}, coach_name = ${team.coach_name},
            wins = ${team.wins}, losses = ${team.losses}, draws = ${team.draws},
            league_id = ${team.league_id}
        WHERE team_id = ${teamId}
        RETURNING *
    `;
    return result[0];
}

export async function deleteTeam(teamId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM team WHERE team_id = ${teamId}`;
}

// Player operations
export async function createPlayer(player: Omit<Player, 'player_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO player (player_name, position, team_id)
        VALUES (${player.player_name}, ${player.position}, ${player.team_id})
        RETURNING *
    `;
    return result[0];
}

export async function getPlayers() {
    try {
        const sql = getDbConnection();
        return await sql`SELECT * FROM player ORDER BY player_name`;
    } catch (error) {
        console.error('Error in getPlayers:', error);
        throw error;
    }
}

export async function getPlayersByTeam(teamId: number) {
    const sql = getDbConnection();
    return await sql`SELECT * FROM player WHERE team_id = ${teamId} ORDER BY player_name`;
}

export async function updatePlayer(playerId: number, player: Partial<Player>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE player
        SET player_name = ${player.player_name}, position = ${player.position},
            team_id = ${player.team_id}
        WHERE player_id = ${playerId}
        RETURNING *
    `;
    return result[0];
}

export async function deletePlayer(playerId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM player WHERE player_id = ${playerId}`;
}

// Match operations
export async function createMatch(match: Omit<Match, 'match_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO match (date, location, home_team_id, away_team_id, league_id, referee_id)
        VALUES (${match.date}, ${match.location}, ${match.home_team_id}, 
                ${match.away_team_id}, ${match.league_id}, ${match.referee_id})
        RETURNING *
    `;
    return result[0];
}

export async function getMatches() {
    try {
        const sql = getDbConnection();
        return await sql`
            SELECT 
                m.*,
                ht.team_name as home_team_name,
                at.team_name as away_team_name,
                r.referee_name
            FROM match m
            LEFT JOIN team ht ON m.home_team_id = ht.team_id
            LEFT JOIN team at ON m.away_team_id = at.team_id
            LEFT JOIN referee r ON m.referee_id = r.referee_id
            ORDER BY m.date DESC
        `;
    } catch (error) {
        console.error('Error in getMatches:', error);
        throw error;
    }
}

export async function getMatchesByLeague(leagueId: number) {
    const sql = getDbConnection();
    return await sql`
        SELECT m.*, 
               ht.team_name as home_team_name,
               at.team_name as away_team_name,
               r.referee_name
        FROM match m
        LEFT JOIN team ht ON m.home_team_id = ht.team_id
        LEFT JOIN team at ON m.away_team_id = at.team_id
        LEFT JOIN referee r ON m.referee_id = r.referee_id
        WHERE m.league_id = ${leagueId}
        ORDER BY m.date DESC
    `;
}

export async function updateMatch(matchId: number, match: Partial<Match>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE match
        SET date = ${match.date}, location = ${match.location},
            home_team_id = ${match.home_team_id}, away_team_id = ${match.away_team_id},
            league_id = ${match.league_id}, referee_id = ${match.referee_id}
        WHERE match_id = ${matchId}
        RETURNING *
    `;
    return result[0];
}

export async function deleteMatch(matchId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM match WHERE match_id = ${matchId}`;
}

// Match Stats operations
export async function createMatchStats(stats: MatchStats) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO match_stats (match_id, home_team_score, away_team_score)
        VALUES (${stats.match_id}, ${stats.home_team_score}, ${stats.away_team_score})
        RETURNING *
    `;
    return result[0];
}

export async function createPlayerMatchStats(stats: PlayerMatchStats) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO player_match_stats (player_id, match_id, goals_scored, assists, yellow_cards, red_cards)
        VALUES (${stats.player_id}, ${stats.match_id}, ${stats.goals_scored}, 
                ${stats.assists}, ${stats.yellow_cards}, ${stats.red_cards})
        RETURNING *
    `;
    return result[0];
}

export async function getPlayerStats(playerId: number) {
    const sql = getDbConnection();
    return await sql`
        SELECT pms.*, m.date, m.location,
               ht.team_name as home_team_name,
               at.team_name as away_team_name
        FROM player_match_stats pms
        JOIN match m ON pms.match_id = m.match_id
        JOIN team ht ON m.home_team_id = ht.team_id
        JOIN team at ON m.away_team_id = at.team_id
        WHERE pms.player_id = ${playerId}
        ORDER BY m.date DESC
    `;
}

// Referee operations
export async function createReferee(referee: Omit<Referee, 'referee_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO referee (referee_name, experience_years)
        VALUES (${referee.referee_name}, ${referee.experience_years})
        RETURNING *
    `;
    return result[0];
}

export async function getReferees() {
    try {
        const sql = getDbConnection();
        return await sql`SELECT * FROM referee ORDER BY referee_name`;
    } catch (error) {
        console.error('Error in getReferees:', error);
        throw error;
    }
}

export async function updateReferee(refereeId: number, referee: Partial<Referee>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE referee
        SET referee_name = ${referee.referee_name}, experience_years = ${referee.experience_years}
        WHERE referee_id = ${refereeId}
        RETURNING *
    `;
    return result[0];
}

export async function deleteReferee(refereeId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM referee WHERE referee_id = ${refereeId}`;
} 