// app/register/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [message, setMessage]         = useState('');
  const [success, setSuccess]         = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validatePassword = (pwd) => {
    const hasLetter  = /[a-zA-Z]/.test(pwd);
    const hasNumber  = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return pwd.length >= 8 && hasLetter && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setPasswordError(
        'Password must be at least 8 characters long, contain at least one special character, and one number.'
      );
      return;
    }
    setPasswordError('');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      setMessage(data.message);
      setUsername('');
      setPassword('');
    } else {
      setSuccess(false);
      setMessage(data.message || 'Registration failed');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <div className="flex justify-center">
          <img
            src="/teamLogo.png"
            alt="Team Logo"
            className="h-50 w-50 object-contain mb-2"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Register
        </h2>

        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-[300px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[300px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {passwordError && (
          <p className="text-red-500 text-sm text-center">{passwordError}</p>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[120px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Register
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-700">{message}</p>
        )}

        {success && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-2 text-blue-600 underline hover:text-blue-800 text-sm"
            >
              Go to Login
            </button>
          </div>
        )}
      </form>

      {/* Login prompt */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-700">
          Already registered? Login{' '}
          <a
            href="/login"
            className="underline text-blue-600 hover:text-blue-800"
          >
            here!
          </a>
        </p>
      </div>
    </main>
  );
}
