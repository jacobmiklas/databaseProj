// app/login/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      // store the username so Dashboard can read it
      localStorage.setItem('username', username);
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
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
          Login Page
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

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-[120px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </form>

      {/* Registration prompt */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-700">
          Not registered?{' '}
          <a
            href="/register"
            className="underline text-blue-600 hover:text-blue-800"
          >
            Register here!
          </a>
        </p>
      </div>
    </main>
  );
}
