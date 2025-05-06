import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedData() {
  try {
    // Clear existing data
    await sql`TRUNCATE TABLE match_stats, matches, players, teams, referees, leagues CASCADE`;

    // Insert leagues
    const leagues = await sql`
      INSERT INTO leagues (name, city, country) VALUES
        ('Premier League', 'London', 'England'),
        ('La Liga', 'Madrid', 'Spain'),
        ('Bundesliga', 'Berlin', 'Germany'),
        ('Serie A', 'Rome', 'Italy'),
        ('Ligue 1', 'Paris', 'France')
      RETURNING league_id
    `;

    // Insert teams
    const teams = await sql`
      INSERT INTO teams (team_name, league_id, coach_name) VALUES
        ('Manchester United', ${leagues[0].league_id}, 'Erik ten Hag'),
        ('Liverpool', ${leagues[0].league_id}, 'Jurgen Klopp'),
        ('Real Madrid', ${leagues[1].league_id}, 'Carlo Ancelotti'),
        ('Barcelona', ${leagues[1].league_id}, 'Xavi Hernandez'),
        ('Bayern Munich', ${leagues[2].league_id}, 'Thomas Tuchel'),
        ('Dortmund', ${leagues[2].league_id}, 'Edin Terzic'),
        ('AC Milan', ${leagues[3].league_id}, 'Stefano Pioli'),
        ('Inter Milan', ${leagues[3].league_id}, 'Simone Inzaghi'),
        ('PSG', ${leagues[4].league_id}, 'Luis Enrique'),
        ('Lyon', ${leagues[4].league_id}, 'Pierre Sage')
      RETURNING team_id
    `;

    // Insert referees
    const referees = await sql`
      INSERT INTO referees (first_name, last_name, experience) VALUES
        ('Michael', 'Oliver', 'FIFA Elite'),
        ('Anthony', 'Taylor', 'FIFA Elite'),
        ('Felix', 'Brych', 'FIFA Elite'),
        ('Daniele', 'Orsato', 'FIFA Elite'),
        ('Clement', 'Turpin', 'FIFA Elite')
      RETURNING referee_id
    `;

    // Insert players
    const players = await sql`
      INSERT INTO players (first_name, last_name, age, jersey_number, team_id) VALUES
        ('Marcus', 'Rashford', 25, 10, ${teams[0].team_id}),
        ('Bruno', 'Fernandes', 28, 8, ${teams[0].team_id}),
        ('Mohamed', 'Salah', 30, 11, ${teams[1].team_id}),
        ('Virgil', 'van Dijk', 31, 4, ${teams[1].team_id}),
        ('Karim', 'Benzema', 35, 9, ${teams[2].team_id}),
        ('Luka', 'Modric', 37, 10, ${teams[2].team_id}),
        ('Robert', 'Lewandowski', 34, 9, ${teams[4].team_id}),
        ('Joshua', 'Kimmich', 28, 6, ${teams[4].team_id}),
        ('Kylian', 'Mbappe', 24, 7, ${teams[8].team_id}),
        ('Lionel', 'Messi', 35, 30, ${teams[8].team_id})
      RETURNING player_id
    `;

    // Insert matches
    const matches = await sql`
      INSERT INTO matches (date, location, league_id, home_team_id, away_team_id, referee_id) VALUES
        ('2024-05-01 15:00:00', 'Old Trafford', ${leagues[0].league_id}, ${teams[0].team_id}, ${teams[1].team_id}, ${referees[0].referee_id}),
        ('2024-05-02 20:00:00', 'Santiago Bernabeu', ${leagues[1].league_id}, ${teams[2].team_id}, ${teams[3].team_id}, ${referees[1].referee_id}),
        ('2024-05-03 18:30:00', 'Allianz Arena', ${leagues[2].league_id}, ${teams[4].team_id}, ${teams[5].team_id}, ${referees[2].referee_id}),
        ('2024-05-04 20:45:00', 'San Siro', ${leagues[3].league_id}, ${teams[6].team_id}, ${teams[7].team_id}, ${referees[3].referee_id}),
        ('2024-05-05 21:00:00', 'Parc des Princes', ${leagues[4].league_id}, ${teams[8].team_id}, ${teams[9].team_id}, ${referees[4].referee_id})
      RETURNING match_id
    `;

    // Insert match_stats
    for (const match of matches) {
      await sql`
        INSERT INTO match_stats (match_id, home_score, away_score, possession_home, possession_away, fouls_home, fouls_away, corners_home, corners_away)
        VALUES (${match.match_id}, 2, 1, 55, 45, 12, 15, 8, 4)
      `;
    }

    // Insert player_stats
    for (const player of players) {
      await sql`
        INSERT INTO player_stats (player_id, goals_scored, assists, yellow_cards, red_cards)
        VALUES (${player.player_id}, 5, 3, 1, 0)
      `;
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedData();
