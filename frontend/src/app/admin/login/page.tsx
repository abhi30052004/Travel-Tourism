import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import {adminLogin} from "../../../lib/admin-api";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminLogin(username, password);
      if (response) {
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-800 to-forest-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-forest-700" />
          </div>
          <div className="text-left">
            <div className="text-lg font-bold text-white font-serif">Travel Content</div>
            <div className="text-xs text-forest-300">AI Automation Platform</div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-forest-50 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-forest-600" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-forest-800">Admin Login</h1>
              <p className="text-xs text-gray-500">Sign in to manage content</p>
            </div>
          </div>

          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Username
          </label>
          <input
            value={username}
            onChange={event => setUsername(event.target.value)}
            autoComplete="username"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 mb-4"
            placeholder="Enter your username"
            required
          />

          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Password
          </label>
          <input
            value={password}
            onChange={event => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 px-4 py-3 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Sign In
          </button>

          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 text-center">
            <strong>Demo Mode:</strong> Enter any username and password to explore
          </div>
        </form>
      </div>
    </div>
  );
}
