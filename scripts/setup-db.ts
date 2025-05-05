import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    try {
        // Clean up the database
        await sql('DROP SCHEMA public CASCADE;');
        await sql('CREATE SCHEMA public;');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split the schema into individual statements, preserving dollar-quoted strings
        const statements: string[] = [];
        let currentStatement = '';
        let inDollarQuote = false;
        let dollarTag = '';
        
        for (const line of schema.split('\n')) {
            if (line.includes('$') && !inDollarQuote) {
                // Start of dollar-quoted string
                const match = line.match(/\$([^\$]*)\$/);
                if (match) {
                    dollarTag = match[1];
                    inDollarQuote = true;
                }
            }
            
            currentStatement += line + '\n';
            
            if (inDollarQuote && line.includes(`$${dollarTag}$`)) {
                // End of dollar-quoted string
                inDollarQuote = false;
                dollarTag = '';
            }
            
            if (!inDollarQuote && line.trim().endsWith(';')) {
                statements.push(currentStatement.trim());
                currentStatement = '';
            }
        }

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await sql(statement);
                    console.log('Executed statement successfully');
                } catch (error) {
                    console.error('Error executing statement:', error);
                }
            }
        }

        // Seed leagues
        await sql(`
            INSERT INTO leagues (name, city, country)
            VALUES 
                ('Premier League', 'London', 'England'),
                ('La Liga', 'Madrid', 'Spain'),
                ('Bundesliga', 'Berlin', 'Germany')
            ON CONFLICT DO NOTHING;
        `);

        // Seed teams
        await sql(`
            INSERT INTO teams (team_name, coach_name, league_id)
            VALUES 
                ('Arsenal', 'Mikel Arteta', 1),
                ('Manchester City', 'Pep Guardiola', 1),
                ('Real Madrid', 'Carlo Ancelotti', 2),
                ('Barcelona', 'Xavi Hernandez', 2),
                ('Bayern Munich', 'Thomas Tuchel', 3),
                ('Borussia Dortmund', 'Edin Terzic', 3)
            ON CONFLICT DO NOTHING;
        `);

        // Seed players
        await sql(`
            INSERT INTO players (first_name, last_name, age, jersey_number, team_id)
            VALUES 
                ('Bukayo', 'Saka', 22, 7, 1),
                ('Erling', 'Haaland', 23, 9, 2),
                ('Vinicius', 'Junior', 23, 20, 3),
                ('Robert', 'Lewandowski', 35, 9, 4),
                ('Harry', 'Kane', 30, 9, 5),
                ('Marco', 'Reus', 34, 11, 6)
            ON CONFLICT DO NOTHING;
        `);

        // Seed referees
        await sql(`
            INSERT INTO referees (first_name, last_name, experience)
            VALUES 
                ('Michael', 'Oliver', '15 years'),
                ('Anthony', 'Taylor', '12 years'),
                ('Felix', 'Zwayer', '10 years')
            ON CONFLICT DO NOTHING;
        `);

        // Seed matches
        await sql(`
            INSERT INTO matches (date, location, league_id, home_team_id, away_team_id, referee_id)
            VALUES 
                (NOW(), 'Emirates Stadium', 1, 1, 2, 1),
                (NOW(), 'Santiago Bernabeu', 2, 3, 4, 2),
                (NOW(), 'Allianz Arena', 3, 5, 6, 3)
            ON CONFLICT DO NOTHING;
        `);

        // Seed match stats
        await sql(`
            INSERT INTO match_stats (match_id, possession_home, possession_away, fouls_home, fouls_away, corners_home, corners_away)
            VALUES 
                (1, 60, 40, 12, 15, 8, 4),
                (2, 55, 45, 10, 13, 6, 5),
                (3, 65, 35, 14, 16, 9, 3)
            ON CONFLICT DO NOTHING;
        `);

        // Seed player match stats
        await sql(`
            INSERT INTO player_match_stats (match_id, player_id, shots, shots_on_target, goals, assists, minutes_played, yellow_cards, red_cards)
            VALUES 
                (1, 1, 4, 2, 1, 1, 90, 0, 0),
                (1, 2, 5, 3, 2, 0, 90, 0, 0),
                (2, 3, 3, 2, 1, 1, 90, 0, 0),
                (2, 4, 4, 3, 2, 0, 90, 0, 0),
                (3, 5, 6, 4, 3, 1, 90, 0, 0),
                (3, 6, 2, 1, 0, 1, 90, 0, 0)
            ON CONFLICT DO NOTHING;
        `);

        console.log('Database setup completed successfully');

        // Verify tables were created
        const tables = await sql(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('\nCreated tables:');
        tables.forEach((table: any) => {
            console.log(`- ${table.table_name}`);
        });

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase(); 