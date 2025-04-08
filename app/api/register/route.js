import { db } from '../../../lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ message: 'Missing username or password' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ])
    return NextResponse.json({ message: 'User registered successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Username already taken' }, { status: 409 })
    }

    console.error('Registration error:', error)
    return NextResponse.json({ message: 'Server error during registration' }, { status: 500 })
  }
}
