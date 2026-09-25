import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, User as UserIcon, Shield, LogOut, History, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const Header: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: Role) => {
    await switchRole(role);
    if (role === 'PASSENGER') navigate('/passenger');
    if (role === 'DRIVER') navigate('/driver');
    if (role === 'ADMIN') navigate('/admin');
  };

  return (
    <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-gray-950 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center">
              Urban Ride <span className="text-emerald-400 ml-1 font-semibold">Mobility</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono leading-none">Smart Dispatch & Real-Time Tracking</p>
          </div>
        </Link>

        {/* Quick Demo Role Preset Switcher */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-gray-950 p-1.5 rounded-xl border border-gray-800">
          <span className="text-[10px] text-gray-500 font-mono px-2">Demo Switcher:</span>
          <button
            onClick={() => handleRoleSwitch('PASSENGER')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              user?.role === 'PASSENGER'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Passenger
          </button>
          <button
            onClick={() => handleRoleSwitch('DRIVER')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              user?.role === 'DRIVER'
                ? 'bg-emerald-500 text-gray-950 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Driver
          </button>
          <button
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Admin
          </button>
        </div>

        {/* User Status & Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Link
                to="/history"
                className="p-2 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-300 hover:text-white border border-gray-700/60 transition-all"
                title="Ride History"
              >
                <History className="w-4 h-4" />
              </Link>

              <div className="flex items-center space-x-2.5 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                  user.role === 'DRIVER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 hover:border-rose-500/40 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-750 text-white border border-gray-700 transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
