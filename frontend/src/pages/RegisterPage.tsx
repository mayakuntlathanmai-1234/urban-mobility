import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../services/api';
import { Role, User as UserType } from '../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [role, setRole] = useState<Role>('PASSENGER');

  // Driver vehicle registration fields
  const [vehicleMake, setVehicleMake] = useState<string>('Hyundai');
  const [vehicleModel, setVehicleModel] = useState<string>('i20');
  const [vehiclePlate, setVehiclePlate] = useState<string>('AP 39 AB 1234');
  const [vehicleType, setVehicleType] = useState<string>('SEDAN');

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetchApi<{ token: string; user: UserType }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role,
          vehicleMake,
          vehicleModel,
          vehiclePlate,
          vehicleType
        })
      });

      login(res.token, res.user);

      if (res.user.role === 'PASSENGER') navigate('/passenger');
      else if (res.user.role === 'DRIVER') navigate('/driver');
      else if (res.user.role === 'ADMIN') navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Car className="w-7 h-7 text-gray-950 font-bold" />
          </div>
          <h2 className="text-2xl font-black text-white">Create New Account</h2>
          <p className="text-xs text-gray-400">Join Urban Ride Mobility as a Passenger or Driver.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ravi Teja"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="ravi.teja@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="+91 98765..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">Select Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('PASSENGER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  role === 'PASSENGER'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500'
                    : 'bg-gray-950 text-gray-400 border-gray-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('DRIVER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  role === 'DRIVER'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-500'
                    : 'bg-gray-950 text-gray-400 border-gray-800'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Driver</span>
              </button>
            </div>
          </div>

          {/* Vehicle fields if Driver */}
          {role === 'DRIVER' && (
            <div className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 block">Vehicle Specification</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Make (e.g. Hyundai)"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. i20)"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Plate Number"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="BIKE">Bike</option>
                  <option value="AUTO">Auto</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 font-bold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
