import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seedData() {
  try {
    // Clear existing data
    await sql`TRUNCATE TABLE match CASCADE`;
    await sql`TRUNCATE TABLE player CASCADE`;
    await sql`TRUNCATE TABLE team CASCADE`;
    await sql`TRUNCATE TABLE referee CASCADE`;
    await sql`TRUNCATE TABLE league CASCADE`;

    // Insert leagues with proper city and country
    const leagues = await sql`
      INSERT INTO league (name, city, country) VALUES
        ('Premier League', 'London', 'England'),
        ('La Liga', 'Madrid', 'Spain'),
        ('Bundesliga', 'Berlin', 'Germany'),
        ('Serie A', 'Rome', 'Italy'),
        ('Ligue 1', 'Paris', 'France')
      RETURNING league_id
    `;

    // Insert teams with proper league assignments
    const teams = await sql`
      INSERT INTO team (team_name, league_id, coach_name, wins, losses, draws) VALUES
        ('Manchester United', ${leagues[0].league_id}, 'Erik ten Hag', 20, 5, 3),
        ('Liverpool', ${leagues[0].league_id}, 'Jurgen Klopp', 18, 7, 3),
        ('Real Madrid', ${leagues[1].league_id}, 'Carlo Ancelotti', 22, 3, 3),
        ('Barcelona', ${leagues[1].league_id}, 'Xavi Hernandez', 19, 6, 3),
        ('Bayern Munich', ${leagues[2].league_id}, 'Thomas Tuchel', 21, 4, 3),
        ('Dortmund', ${leagues[2].league_id}, 'Edin Terzic', 17, 8, 3),
        ('AC Milan', ${leagues[3].league_id}, 'Stefano Pioli', 18, 7, 3),
        ('Inter Milan', ${leagues[3].league_id}, 'Simone Inzaghi', 19, 6, 3),
        ('PSG', ${leagues[4].league_id}, 'Luis Enrique', 20, 5, 3),
        ('Lyon', ${leagues[4].league_id}, 'Pierre Sage', 15, 10, 3)
      RETURNING team_id
    `;

    // Insert referees
    const referees = await sql`
      INSERT INTO referee (first_name, last_name, experience) VALUES
        ('Michael', 'Oliver', 'FIFA Elite'),
        ('Anthony', 'Taylor', 'FIFA Elite'),
        ('Felix', 'Brych', 'FIFA Elite'),
        ('Daniele', 'Orsato', 'FIFA Elite'),
        ('Clement', 'Turpin', 'FIFA Elite')
      RETURNING referee_id
    `;

    // Insert players with proper team assignments
    const players = await sql`
      INSERT INTO player (first_name, last_name, age, jersey_number, team_id) VALUES
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

    // Insert matches with proper team and referee assignments
    await sql`
      INSERT INTO match (date, location, league_id, home_team_id, away_team_id, referee_id) VALUES
        ('2024-05-01 15:00:00', 'Old Trafford', ${leagues[0].league_id}, ${teams[0].team_id}, ${teams[1].team_id}, ${referees[0].referee_id}),
        ('2024-05-02 20:00:00', 'Santiago Bernabeu', ${leagues[1].league_id}, ${teams[2].team_id}, ${teams[3].team_id}, ${referees[1].referee_id}),
        ('2024-05-03 18:30:00', 'Allianz Arena', ${leagues[2].league_id}, ${teams[4].team_id}, ${teams[5].team_id}, ${referees[2].referee_id}),
        ('2024-05-04 20:45:00', 'San Siro', ${leagues[3].league_id}, ${teams[6].team_id}, ${teams[7].team_id}, ${referees[3].referee_id}),
        ('2024-05-05 21:00:00', 'Parc des Princes', ${leagues[4].league_id}, ${teams[8].team_id}, ${teams[9].team_id}, ${referees[4].referee_id}),
        ('2024-05-15 15:00:00', 'Anfield', ${leagues[0].league_id}, ${teams[1].team_id}, ${teams[0].team_id}, ${referees[0].referee_id}),
        ('2024-05-16 20:00:00', 'Camp Nou', ${leagues[1].league_id}, ${teams[3].team_id}, ${teams[2].team_id}, ${referees[1].referee_id}),
        ('2024-05-17 18:30:00', 'Signal Iduna Park', ${leagues[2].league_id}, ${teams[5].team_id}, ${teams[4].team_id}, ${referees[2].referee_id}),
        ('2024-05-18 20:45:00', 'San Siro', ${leagues[3].league_id}, ${teams[7].team_id}, ${teams[6].team_id}, ${referees[3].referee_id}),
        ('2024-05-19 21:00:00', 'Groupama Stadium', ${leagues[4].league_id}, ${teams[9].team_id}, ${teams[8].team_id}, ${referees[4].referee_id})
      RETURNING match_id
    `;

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedData(); 