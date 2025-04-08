import { db } from '../../../lib/db' // get database
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username])

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 })
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect password' }, { status: 401 })
    }

    return NextResponse.json({ message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Server error during login' }, { status: 500 })
  }
}
