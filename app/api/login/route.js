import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByUsername } from '@/app/actions'

export async function POST(req) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
  }

  try {
    const user = await getUserByUsername(username)

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 })
    }

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
