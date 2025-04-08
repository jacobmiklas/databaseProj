'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()

  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const isLongEnough = password.length >= 8

    return hasLetter && hasNumber && isLongEnough
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side password validation
    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long, contain at least one letter and one number.'
      )
      return
    }

    setPasswordError('') // Clear any previous errors

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      setMessage(data.message)
      setUsername('')
      setPassword('')
    } else {
      setMessage(data.message || 'Registration failed')
      setSuccess(false)
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
        <br />
        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}

      {success && (
        <button onClick={() => router.push('/login')}>
          Go to Login
        </button>
      )}
    </main>
  )
}
