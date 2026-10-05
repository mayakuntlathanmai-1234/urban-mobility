import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const user = await login({ email, password });

      // Redirect based on backend role
      if (user.role.includes('DRIVER')) {
        navigate('/driver');
      } else if (user.role.includes('ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/passenger');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center selection:bg-blue-500 selection:text-white max-w-7xl mx-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80">
        {/* Left Section: Branding & Visual */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <Navigation className="w-5 h-5 fill-white/20 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                URBAN <span className="text-cyan-300">RIDE</span>
              </span>
            </Link>
          </div>

          {/* Tagline & Copy */}
          <div className="relative z-10 my-12 space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight">Welcome back to smart urban mobility.</h2>
            <p className="text-xs text-blue-100 leading-relaxed font-medium">
              Access your real-time ride dashboard, view driver telemetry, and manage completed payment transactions.
            </p>

            <div className="pt-4 flex items-center gap-3 text-xs font-semibold text-cyan-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Secured by Auth Service JWT & BCrypt Encryption</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 text-[11px] text-blue-200/70 font-medium">
            © {new Date().getFullYear()} Urban Ride Mobility Platform
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto w-full space-y-6"
          >
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Your Account</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Enter your credentials to access your passenger or driver portal.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="passenger@urbanride.com"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-slate-900 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials helper */}
            <div className="pt-4 border-t border-slate-200/60 text-xs text-slate-500">
              <p className="font-bold text-slate-700 mb-1">Demo Accounts:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('passenger@urbanride.com');
                    setPassword('Password123!');
                  }}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-left font-mono"
                >
                  Passenger Demo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('driver@urbanride.com');
                    setPassword('Password123!');
                  }}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-left font-mono"
                >
                  Driver Demo
                </button>
              </div>
            </div>

            <div className="text-center pt-2 text-xs font-semibold text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-bold">
                Create Account
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
