import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seedData() {
  try {
    // Clear existing data
    await sql`TRUNCATE TABLE player_stats, match_stats, matches, players, teams, referees, leagues CASCADE`;

    // Insert leagues
    const leagues = await sql`
      INSERT INTO leagues (name, city, country) VALUES
        ('Premier League', 'London', 'England'),
        ('La Liga', 'Madrid', 'Spain'),
        ('Bundesliga', 'Berlin', 'Germany'),
        ('Serie A', 'Rome', 'Italy')
      RETURNING league_id
    `;

    // Insert teams
    const teams = await sql`
      INSERT INTO teams (team_name, league_id, coach_name) VALUES
        ('Arsenal', ${leagues[0].league_id}, 'Mikel Arteta'),
        ('Manchester City', ${leagues[0].league_id}, 'Pep Guardiola'),
        ('Liverpool', ${leagues[0].league_id}, 'Jurgen Klopp'),
        ('Manchester United', ${leagues[0].league_id}, 'Erik ten Hag'),
        ('Chelsea', ${leagues[0].league_id}, 'Mauricio Pochettino'),
        ('Tottenham', ${leagues[0].league_id}, 'Ange Postecoglou'),
        ('Newcastle', ${leagues[0].league_id}, 'Eddie Howe'),
        ('Aston Villa', ${leagues[0].league_id}, 'Unai Emery'),
        ('Brighton', ${leagues[0].league_id}, 'Roberto De Zerbi'),
        ('West Ham', ${leagues[0].league_id}, 'David Moyes'),
        ('Real Madrid', ${leagues[1].league_id}, 'Carlo Ancelotti'),
        ('Barcelona', ${leagues[1].league_id}, 'Xavi Hernandez'),
        ('Atletico Madrid', ${leagues[1].league_id}, 'Diego Simeone'),
        ('Sevilla', ${leagues[1].league_id}, 'Quique Sanchez Flores'),
        ('Valencia', ${leagues[1].league_id}, 'Ruben Baraja'),
        ('Bayern Munich', ${leagues[2].league_id}, 'Thomas Tuchel'),
        ('Borussia Dortmund', ${leagues[2].league_id}, 'Edin Terzic'),
        ('RB Leipzig', ${leagues[2].league_id}, 'Marco Rose'),
        ('Bayer Leverkusen', ${leagues[2].league_id}, 'Xabi Alonso'),
        ('Stuttgart', ${leagues[2].league_id}, 'Sebastian Hoeness'),
        ('Inter Milan', ${leagues[3].league_id}, 'Simone Inzaghi'),
        ('AC Milan', ${leagues[3].league_id}, 'Stefano Pioli'),
        ('Juventus', ${leagues[3].league_id}, 'Massimiliano Allegri'),
        ('Napoli', ${leagues[3].league_id}, 'Francesco Calzona'),
        ('Roma', ${leagues[3].league_id}, 'Daniele De Rossi')
      RETURNING team_id
    `;

    // Insert referees
    const referees = await sql`
      INSERT INTO referees (first_name, last_name, experience) VALUES
        ('Michael', 'Oliver', 'FIFA'),
        ('Anthony', 'Taylor', 'FIFA'),
        ('Paul', 'Tierney', 'FIFA'),
        ('Stuart', 'Attwell', 'FIFA'),
        ('Chris', 'Kavanagh', 'FIFA'),
        ('Javier', 'Estrada', 'FIFA'),
        ('Felix', 'Brych', 'FIFA'),
        ('Daniele', 'Orsato', 'FIFA')
      RETURNING referee_id
    `;

    // Insert players
    const players = await sql`
      INSERT INTO players (first_name, last_name, age, jersey_number, team_id) VALUES
        ('Bukayo', 'Saka', 22, 7, ${teams[0].team_id}),
        ('Martin', 'Odegaard', 25, 8, ${teams[0].team_id}),
        ('William', 'Saliba', 23, 2, ${teams[0].team_id}),
        ('Erling', 'Haaland', 23, 9, ${teams[1].team_id}),
        ('Kevin', 'De Bruyne', 32, 17, ${teams[1].team_id}),
        ('Rodri', 'Hernandez', 27, 16, ${teams[1].team_id}),
        ('Mohamed', 'Salah', 31, 11, ${teams[2].team_id}),
        ('Virgil', 'van Dijk', 32, 4, ${teams[2].team_id}),
        ('Marcus', 'Rashford', 26, 10, ${teams[3].team_id}),
        ('Bruno', 'Fernandes', 29, 8, ${teams[3].team_id}),
        ('Cole', 'Palmer', 21, 20, ${teams[4].team_id}),
        ('Enzo', 'Fernandez', 23, 8, ${teams[4].team_id}),
        ('Son', 'Heung-min', 31, 7, ${teams[5].team_id}),
        ('James', 'Maddison', 27, 10, ${teams[5].team_id}),
        ('Alexander', 'Isak', 24, 14, ${teams[6].team_id}),
        ('Bruno', 'Guimaraes', 26, 39, ${teams[6].team_id}),
        ('Ollie', 'Watkins', 28, 11, ${teams[7].team_id}),
        ('Douglas', 'Luiz', 25, 6, ${teams[7].team_id}),
        ('Evan', 'Ferguson', 19, 28, ${teams[8].team_id}),
        ('Kaoru', 'Mitoma', 26, 22, ${teams[8].team_id}),
        ('Jarrod', 'Bowen', 27, 20, ${teams[9].team_id}),
        ('Lucas', 'Paqueta', 26, 10, ${teams[9].team_id}),
        ('Jude', 'Bellingham', 20, 5, ${teams[10].team_id}),
        ('Vinicius', 'Junior', 23, 7, ${teams[10].team_id}),
        ('Robert', 'Lewandowski', 35, 9, ${teams[11].team_id}),
        ('Frenkie', 'de Jong', 26, 21, ${teams[11].team_id}),
        ('Harry', 'Kane', 30, 9, ${teams[15].team_id}),
        ('Jamal', 'Musiala', 21, 42, ${teams[15].team_id}),
        ('Lautaro', 'Martinez', 26, 10, ${teams[20].team_id}),
        ('Marcus', 'Thuram', 26, 9, ${teams[20].team_id})
      RETURNING player_id
    `;

    // Insert matches
    const matches = await sql`
      INSERT INTO matches (date, location, league_id, home_team_id, away_team_id, referee_id) VALUES
        ('2024-03-30 15:00:00', 'Emirates Stadium', ${leagues[0].league_id}, ${teams[0].team_id}, ${teams[1].team_id}, ${referees[0].referee_id}),
        ('2024-03-31 14:00:00', 'Etihad Stadium', ${leagues[0].league_id}, ${teams[1].team_id}, ${teams[2].team_id}, ${referees[1].referee_id}),
        ('2024-04-01 16:30:00', 'Anfield', ${leagues[0].league_id}, ${teams[2].team_id}, ${teams[3].team_id}, ${referees[2].referee_id}),
        ('2024-04-02 20:00:00', 'Old Trafford', ${leagues[0].league_id}, ${teams[3].team_id}, ${teams[4].team_id}, ${referees[3].referee_id}),
        ('2024-04-03 19:45:00', 'Stamford Bridge', ${leagues[0].league_id}, ${teams[4].team_id}, ${teams[5].team_id}, ${referees[4].referee_id}),
        ('2024-04-04 20:00:00', 'Tottenham Hotspur Stadium', ${leagues[0].league_id}, ${teams[5].team_id}, ${teams[6].team_id}, ${referees[0].referee_id}),
        ('2024-04-05 15:00:00', 'St James Park', ${leagues[0].league_id}, ${teams[6].team_id}, ${teams[7].team_id}, ${referees[1].referee_id}),
        ('2024-04-06 17:30:00', 'Villa Park', ${leagues[0].league_id}, ${teams[7].team_id}, ${teams[8].team_id}, ${referees[2].referee_id}),
        ('2024-04-07 14:00:00', 'Amex Stadium', ${leagues[0].league_id}, ${teams[8].team_id}, ${teams[9].team_id}, ${referees[3].referee_id}),
        ('2024-04-08 20:00:00', 'London Stadium', ${leagues[0].league_id}, ${teams[9].team_id}, ${teams[0].team_id}, ${referees[4].referee_id}),
        ('2024-04-09 15:00:00', 'Santiago Bernabeu', ${leagues[1].league_id}, ${teams[10].team_id}, ${teams[11].team_id}, ${referees[5].referee_id}),
        ('2024-04-10 18:00:00', 'Camp Nou', ${leagues[1].league_id}, ${teams[11].team_id}, ${teams[12].team_id}, ${referees[6].referee_id}),
        ('2024-04-11 20:00:00', 'Wanda Metropolitano', ${leagues[1].league_id}, ${teams[12].team_id}, ${teams[13].team_id}, ${referees[7].referee_id}),
        ('2024-04-12 21:00:00', 'Ramon Sanchez Pizjuan', ${leagues[1].league_id}, ${teams[13].team_id}, ${teams[14].team_id}, ${referees[0].referee_id}),
        ('2024-04-13 16:00:00', 'Allianz Arena', ${leagues[2].league_id}, ${teams[15].team_id}, ${teams[16].team_id}, ${referees[1].referee_id}),
        ('2024-04-14 18:30:00', 'Signal Iduna Park', ${leagues[2].league_id}, ${teams[16].team_id}, ${teams[17].team_id}, ${referees[2].referee_id}),
        ('2024-04-15 20:30:00', 'Red Bull Arena', ${leagues[2].league_id}, ${teams[17].team_id}, ${teams[18].team_id}, ${referees[3].referee_id}),
        ('2024-04-16 19:00:00', 'BayArena', ${leagues[2].league_id}, ${teams[18].team_id}, ${teams[19].team_id}, ${referees[4].referee_id}),
        ('2024-04-17 21:00:00', 'San Siro', ${leagues[3].league_id}, ${teams[20].team_id}, ${teams[21].team_id}, ${referees[5].referee_id}),
        ('2024-04-18 20:45:00', 'Allianz Stadium', ${leagues[3].league_id}, ${teams[21].team_id}, ${teams[22].team_id}, ${referees[6].referee_id}),
        ('2024-04-19 18:00:00', 'Stadio Diego Armando Maradona', ${leagues[3].league_id}, ${teams[22].team_id}, ${teams[23].team_id}, ${referees[7].referee_id}),
        ('2024-04-20 20:00:00', 'Stadio Olimpico', ${leagues[3].league_id}, ${teams[23].team_id}, ${teams[24].team_id}, ${referees[0].referee_id})
      RETURNING match_id
    `;

    // Insert match_stats
    for (const match of matches) {
      const possessionHome = Math.floor(Math.random() * 30) + 35; // Random between 35-65
      const possessionAway = 100 - possessionHome; // Ensures sum is 100
      await sql`
        INSERT INTO match_stats (match_id, home_score, away_score, possession_home, possession_away, fouls_home, fouls_away, corners_home, corners_away)
        VALUES (${match.match_id}, 
          ${Math.floor(Math.random() * 4)}, 
          ${Math.floor(Math.random() * 4)}, 
          ${possessionHome}, 
          ${possessionAway}, 
          ${Math.floor(Math.random() * 10) + 5}, 
          ${Math.floor(Math.random() * 10) + 5}, 
          ${Math.floor(Math.random() * 8) + 2}, 
          ${Math.floor(Math.random() * 8) + 2})
      `;
    }

    // Insert player_stats
    for (const player of players) {
      await sql`
        INSERT INTO player_stats (player_id, goals_scored, assists, yellow_cards, red_cards)
        VALUES (${player.player_id}, 
          ${Math.floor(Math.random() * 15)}, 
          ${Math.floor(Math.random() * 10)}, 
          ${Math.floor(Math.random() * 3)}, 
          ${Math.floor(Math.random() * 2)})
      `;
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedData();
