import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { User as UserType } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('passenger@urbanride.com');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi<{ token: string; user: UserType }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      login(res.token, res.user);

      if (res.user.role === 'PASSENGER') navigate('/passenger');
      else if (res.user.role === 'DRIVER') navigate('/driver');
      else if (res.user.role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (presetEmail: string, targetPath: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    try {
      const res = await fetchApi<{ token: string; user: UserType }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: presetEmail, password: 'password123' })
      });
      login(res.token, res.user);
      navigate(targetPath);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Car className="w-7 h-7 text-gray-950 font-bold" />
          </div>
          <h2 className="text-2xl font-black text-white">Log In to Urban Ride</h2>
          <p className="text-xs text-gray-400">Enter credentials or choose a quick demo account below.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Quick Demo Presets */}
        <div className="space-y-2 bg-gray-950 p-3 rounded-2xl border border-gray-800">
          <span className="text-[10px] text-gray-500 font-mono block text-center uppercase tracking-wider">
            1-Click Demo Quick Sign-In
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('passenger@urbanride.com', '/passenger')}
              className="py-2 px-2 bg-gray-900 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold transition-all text-center"
            >
              Passenger
            </button>
            <button
              onClick={() => handleQuickLogin('driver@urbanride.com', '/driver')}
              className="py-2 px-2 bg-gray-900 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[11px] font-bold transition-all text-center"
            >
              Driver
            </button>
            <button
              onClick={() => handleQuickLogin('admin@urbanride.com', '/admin')}
              className="py-2 px-2 bg-gray-900 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-[11px] font-bold transition-all text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 font-bold hover:underline">
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};
