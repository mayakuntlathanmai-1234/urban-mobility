import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation, Mail, Lock, User as UserIcon, Phone, Car, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'driver' ? 'ROLE_DRIVER' : 'ROLE_PASSENGER';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ROLE_PASSENGER' | 'ROLE_DRIVER'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await register({ name, email, password, phone, role });
      navigate('/login?registered=true');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Try a different email.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-slate-200/80 my-8">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Navigation className="w-5 h-5 fill-white/20 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              URBAN <span className="text-blue-600">RIDE</span>
            </span>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Join the Mobility Platform</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Account</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Select your account type and fill in your registration details.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('ROLE_PASSENGER')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ROLE_PASSENGER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Passenger
          </button>
          <button
            type="button"
            onClick={() => setRole('ROLE_DRIVER')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'ROLE_DRIVER'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            Driver Partner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Thanmai Kumar"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="thanmai@urbanride.com"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength >= 3 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                  <div className={`h-full flex-1 ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-6 text-xs font-semibold text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
