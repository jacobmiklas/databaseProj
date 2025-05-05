import { neon } from '@neondatabase/serverless';
import { League, Team, Player, Referee, Match, MatchStats, PlayerMatchStats } from '../types';

// Debug the environment variable
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'Missing');

const sql = neon(process.env.DATABASE_URL!);

// League operations
export async function createLeague(league: Omit<League, 'league_id'>) {
    const result = await sql`
        INSERT INTO leagues (name, city, country)
        VALUES (${league.name}, ${league.city}, ${league.country})
        RETURNING league_id
    `;
    return result[0].league_id;
}

export async function getLeagues() {
    return await sql<League[]>`
        SELECT * FROM leagues
        ORDER BY name
    `;
}

export async function updateLeague(league: League) {
    await sql`
        UPDATE leagues
        SET name = ${league.name},
            city = ${league.city},
            country = ${league.country}
        WHERE league_id = ${league.league_id}
    `;
}

export async function deleteLeague(leagueId: number) {
    await sql`
        DELETE FROM leagues
        WHERE league_id = ${leagueId}
    `;
}

// Team operations
export async function createTeam(team: Omit<Team, 'team_id'>) {
    const result = await sql`
        INSERT INTO teams (team_name, coach_name, league_id)
        VALUES (${team.team_name}, ${team.coach_name}, ${team.league_id})
        RETURNING team_id
    `;
    return result[0].team_id;
}

export async function getTeams() {
    return await sql<Team[]>`
        SELECT * FROM teams
        ORDER BY team_name
    `;
}

export async function updateTeam(team: Team) {
    await sql`
        UPDATE teams
        SET team_name = ${team.team_name},
            coach_name = ${team.coach_name},
            league_id = ${team.league_id}
        WHERE team_id = ${team.team_id}
    `;
}

export async function deleteTeam(teamId: number) {
    await sql`
        DELETE FROM teams
        WHERE team_id = ${teamId}
    `;
}

// Player operations
export async function createPlayer(player: Omit<Player, 'player_id'>) {
    const result = await sql`
        INSERT INTO players (first_name, last_name, age, jersey_number, team_id)
        VALUES (${player.first_name}, ${player.last_name}, ${player.age}, ${player.jersey_number}, ${player.team_id})
        RETURNING player_id
    `;
    return result[0].player_id;
}

export async function getPlayers() {
    return await sql<Player[]>`
        SELECT * FROM players
        ORDER BY last_name, first_name
    `;
}

export async function updatePlayer(player: Player) {
    await sql`
        UPDATE players
        SET first_name = ${player.first_name},
            last_name = ${player.last_name},
            age = ${player.age},
            jersey_number = ${player.jersey_number},
            team_id = ${player.team_id}
        WHERE player_id = ${player.player_id}
    `;
}

export async function deletePlayer(playerId: number) {
    await sql`
        DELETE FROM players
        WHERE player_id = ${playerId}
    `;
}

// Referee operations
export async function createReferee(referee: Omit<Referee, 'referee_id'>) {
    const result = await sql`
        INSERT INTO referees (first_name, last_name, experience)
        VALUES (${referee.first_name}, ${referee.last_name}, ${referee.experience})
        RETURNING referee_id
    `;
    return result[0].referee_id;
}

export async function getReferees() {
    return await sql<Referee[]>`
        SELECT * FROM referees
        ORDER BY last_name, first_name
    `;
}

export async function updateReferee(referee: Referee) {
    await sql`
        UPDATE referees
        SET first_name = ${referee.first_name},
            last_name = ${referee.last_name},
            experience = ${referee.experience}
        WHERE referee_id = ${referee.referee_id}
    `;
}

export async function deleteReferee(refereeId: number) {
    await sql`
        DELETE FROM referees
        WHERE referee_id = ${refereeId}
    `;
}

// Match operations
export async function createMatch(match: Omit<Match, 'match_id'>) {
    const result = await sql`
        INSERT INTO matches (date, location, league_id, home_team_id, away_team_id, referee_id)
        VALUES (${match.date}, ${match.location}, ${match.league_id}, ${match.home_team_id}, ${match.away_team_id}, ${match.referee_id})
        RETURNING match_id
    `;
    return result[0].match_id;
}

export async function getMatches() {
    return await sql<Match[]>`
        SELECT m.*, 
               ht.team_name as home_team_name,
               at.team_name as away_team_name,
               r.first_name as referee_first_name,
               r.last_name as referee_last_name
        FROM matches m
        JOIN teams ht ON m.home_team_id = ht.team_id
        JOIN teams at ON m.away_team_id = at.team_id
        LEFT JOIN referees r ON m.referee_id = r.referee_id
        ORDER BY m.date DESC
    `;
}

export async function updateMatch(match: Match) {
    await sql`
        UPDATE matches
        SET date = ${match.date},
            location = ${match.location},
            league_id = ${match.league_id},
            home_team_id = ${match.home_team_id},
            away_team_id = ${match.away_team_id},
            referee_id = ${match.referee_id}
        WHERE match_id = ${match.match_id}
    `;
}

export async function deleteMatch(matchId: number) {
    await sql`
        DELETE FROM matches
        WHERE match_id = ${matchId}
    `;
}

// Match Stats operations
export async function createMatchStats(stats: MatchStats) {
    await sql`
        INSERT INTO match_stats (
            match_id, possession_home, possession_away,
            fouls_home, fouls_away, corners_home, corners_away,
            home_score, away_score
        )
        VALUES (
            ${stats.match_id}, ${stats.possession_home}, ${stats.possession_away},
            ${stats.fouls_home}, ${stats.fouls_away}, ${stats.corners_home}, ${stats.corners_away},
            ${stats.home_score}, ${stats.away_score}
        )
    `;
}

export async function getMatchStats(matchId: number) {
    const result = await sql<MatchStats[]>`
        SELECT * FROM match_stats
        WHERE match_id = ${matchId}
    `;
    return result[0];
}

export async function updateMatchStats(stats: MatchStats) {
    await sql`
        UPDATE match_stats
        SET possession_home = ${stats.possession_home},
            possession_away = ${stats.possession_away},
            fouls_home = ${stats.fouls_home},
            fouls_away = ${stats.fouls_away},
            corners_home = ${stats.corners_home},
            corners_away = ${stats.corners_away},
            home_score = ${stats.home_score},
            away_score = ${stats.away_score}
        WHERE match_id = ${stats.match_id}
    `;
}

// Player Match Stats operations
export async function createPlayerMatchStats(stats: PlayerMatchStats) {
    await sql`
        INSERT INTO player_match_stats (
            match_id, player_id, shots, shots_on_target,
            goals, assists, minutes_played, yellow_cards, red_cards
        )
        VALUES (
            ${stats.match_id}, ${stats.player_id}, ${stats.shots},
            ${stats.shots_on_target}, ${stats.goals}, ${stats.assists},
            ${stats.minutes_played}, ${stats.yellow_cards}, ${stats.red_cards}
        )
    `;
}

export async function getPlayerMatchStats(matchId: number, playerId: number) {
    const result = await sql<PlayerMatchStats[]>`
        SELECT * FROM player_match_stats
        WHERE match_id = ${matchId} AND player_id = ${playerId}
    `;
    return result[0];
}

export async function updatePlayerMatchStats(stats: PlayerMatchStats) {
    await sql`
        UPDATE player_match_stats
        SET shots = ${stats.shots},
            shots_on_target = ${stats.shots_on_target},
            goals = ${stats.goals},
            assists = ${stats.assists},
            minutes_played = ${stats.minutes_played},
            yellow_cards = ${stats.yellow_cards},
            red_cards = ${stats.red_cards}
        WHERE match_id = ${stats.match_id} AND player_id = ${stats.player_id}
    `;
}

export async function getMatchPlayerStats(matchId: number) {
    return await sql<PlayerMatchStats[]>`
        SELECT pms.*, p.first_name, p.last_name, p.jersey_number, t.team_name
        FROM player_match_stats pms
        JOIN players p ON pms.player_id = p.player_id
        JOIN teams t ON p.team_id = t.team_id
        WHERE pms.match_id = ${matchId}
        ORDER BY t.team_name, p.last_name, p.first_name
    `;
}