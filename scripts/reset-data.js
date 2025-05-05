import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function resetData() {
  try {
    await sql`
      TRUNCATE 
        player_match_stats, 
        match_stats, 
        match, 
        player, 
        team, 
        referee, 
        league 
      CASCADE
    `;
    console.log('✅ All data wiped (except users table).');
  } catch (error) {
    console.error('❌ Failed to wipe data:', error);
  }
}

resetData();
