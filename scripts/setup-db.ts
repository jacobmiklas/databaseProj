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