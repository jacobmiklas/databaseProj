import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser } from '@/app/actions'

export async function POST(req) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ message: 'Missing username or password' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await createUser(username, hashedPassword)

  if (result.success) {
    return NextResponse.json({ message: 'User registered successfully!' })
  } else if (
    result.error &&
    result.error.includes('duplicate key value violates unique constraint')
  ) {
    return NextResponse.json({ message: 'Username already taken' }, { status: 409 })
  } else {
    console.error('Registration error:', result.error)
    return NextResponse.json({ message: 'Server error during registration' }, { status: 500 })
  }
}
