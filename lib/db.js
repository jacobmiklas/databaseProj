import mysql from 'mysql2/promise'

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // ✅ make sure it's a number
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,          // ✅ optional: helps pool stability
  connectionLimit: 10,               // ✅ optional: limits open connections
  queueLimit: 0                      // ✅ optional: unlimited queue
})
