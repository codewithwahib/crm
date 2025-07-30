'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import bcrypt from 'bcryptjs';
import { useAuth } from './AuthProvider';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const query = `*[_type == "user" && username == $username][0]`;
      const user = await client.fetch(query, { username });

      if (!user) {
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }

      const userData = {
        username: user.username,
        role: user.role,
        fullName: user.fullName
      };

      login(userData);
      router.push(getDashboardPath(user.role));
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'director': return '/director/dashboard';
      case 'gm_sales': return '/gm-sales/dashboard';
      case 'sales_manager': return '/sales-manager/dashboard';
      case 'execution': return '/execution/dashboard';
      case 'mechanical': return '/mechanical/dashboard';
      case 'store': return '/store/dashboard';
      default: return '/';
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}