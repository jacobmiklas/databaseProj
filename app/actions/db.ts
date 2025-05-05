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
        INSERT INTO match (date, location, league_id, home_team_id, away_team_id, referee_id)
        VALUES (${match.date}, ${match.location}, ${match.league_id}, 
                ${match.home_team_id}, ${match.away_team_id}, ${match.referee_id})
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
                r.first_name as referee_first_name,
                r.last_name as referee_last_name,
                r.experience as referee_experience
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
        SET date = ${match.date}, 
            location = ${match.location},
            league_id = ${match.league_id},
            home_team_id = ${match.home_team_id}, 
            away_team_id = ${match.away_team_id},
            referee_id = ${match.referee_id}
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
        INSERT INTO match_stats (
            match_id, possession_home, possession_away,
            fouls_home, fouls_away, corners_home, corners_away
        )
        VALUES (
            ${stats.match_id}, ${stats.possession_home}, ${stats.possession_away},
            ${stats.fouls_home}, ${stats.fouls_away}, ${stats.corners_home}, ${stats.corners_away}
        )
        RETURNING *
    `;
    return result[0];
}

export async function getMatchStats(matchId: number) {
    const sql = getDbConnection();
    return await sql`
        SELECT * FROM match_stats WHERE match_id = ${matchId}
    `;
}

export async function updateMatchStats(matchId: number, stats: Partial<MatchStats>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE match_stats
        SET possession_home = ${stats.possession_home},
            possession_away = ${stats.possession_away},
            fouls_home = ${stats.fouls_home},
            fouls_away = ${stats.fouls_away},
            corners_home = ${stats.corners_home},
            corners_away = ${stats.corners_away}
        WHERE match_id = ${matchId}
        RETURNING *
    `;
    return result[0];
}

// Player Match Stats operations
export async function createPlayerMatchStats(stats: PlayerMatchStats) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO player_match_stats (
            match_id, player_id, shots, shots_on_target,
            assists, minutes_played, yellow_cards, red_cards
        )
        VALUES (
            ${stats.match_id}, ${stats.player_id}, ${stats.shots}, ${stats.shots_on_target},
            ${stats.assists}, ${stats.minutes_played}, ${stats.yellow_cards}, ${stats.red_cards}
        )
        RETURNING *
    `;
    return result[0];
}

export async function getPlayerMatchStats(matchId: number, playerId: number) {
    const sql = getDbConnection();
    return await sql`
        SELECT pms.*, p.first_name, p.last_name, p.jersey_number
        FROM player_match_stats pms
        JOIN player p ON pms.player_id = p.player_id
        WHERE pms.match_id = ${matchId} AND pms.player_id = ${playerId}
    `;
}

export async function updatePlayerMatchStats(matchId: number, playerId: number, stats: Partial<PlayerMatchStats>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE player_match_stats
        SET shots = ${stats.shots},
            shots_on_target = ${stats.shots_on_target},
            assists = ${stats.assists},
            minutes_played = ${stats.minutes_played},
            yellow_cards = ${stats.yellow_cards},
            red_cards = ${stats.red_cards}
        WHERE match_id = ${matchId} AND player_id = ${playerId}
        RETURNING *
    `;
    return result[0];
}

// Referee operations
export async function createReferee(referee: Omit<Referee, 'referee_id'>) {
    const sql = getDbConnection();
    const result = await sql`
        INSERT INTO referee (first_name, last_name, experience)
        VALUES (${referee.first_name}, ${referee.last_name}, ${referee.experience})
        RETURNING *
    `;
    return result[0];
}

export async function getReferees() {
    try {
        const sql = getDbConnection();
        return await sql`SELECT * FROM referee ORDER BY last_name, first_name`;
    } catch (error) {
        console.error('Error in getReferees:', error);
        throw error;
    }
}

export async function updateReferee(refereeId: number, referee: Partial<Referee>) {
    const sql = getDbConnection();
    const result = await sql`
        UPDATE referee
        SET first_name = ${referee.first_name}, 
            last_name = ${referee.last_name}, 
            experience = ${referee.experience}
        WHERE referee_id = ${refereeId}
        RETURNING *
    `;
    return result[0];
}

export async function deleteReferee(refereeId: number) {
    const sql = getDbConnection();
    await sql`DELETE FROM referee WHERE referee_id = ${refereeId}`;
} 