import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
    try {
        // Read the schema file
        const schemaPath = join(process.cwd(), 'scripts', 'schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');

        // Split the schema into individual statements and execute them
        const statements = schema
            .split(';')
            .map(statement => statement.trim())
            .filter(statement => statement.length > 0);

        for (const statement of statements) {
            try {
                await sql.unsafe(statement);
                console.log('Executed statement successfully');
            } catch (error) {
                console.error('Error executing statement:', error);
                console.error('Statement:', statement);
                throw error;
            }
        }
        
        console.log('Database setup completed successfully!');

        // Verify tables were created
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        console.log('\nCreated tables:');
        tables.forEach((table: any) => {
            console.log(`- ${table.table_name}`);
        });

    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setupDatabase(); 