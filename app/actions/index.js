'use server';

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Register a new user
export async function createUser(username, hashedPassword) {
  try {
    await sql(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );
    return { success: true };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: error.message };
  }
}

// Get a user by username
export async function getUserByUsername(username) {
  try {
    const result = await sql(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result[0] || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
