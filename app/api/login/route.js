import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByUsername } from '../../actions'

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
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
