import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Navigation, 
  Car, 
  History, 
  CreditCard, 
  User, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                URBAN <span className="text-blue-600">RIDE</span>
              </span>
              <p className="text-[10px] font-medium text-slate-500 -mt-1 tracking-wider uppercase">Move smarter. Ride better.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1">
              {role === 'ROLE_PASSENGER' && (
                <>
                  <Link
                    to="/passenger/dashboard"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/passenger/dashboard')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/passenger/book"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/passenger/book')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    Book Ride
                  </Link>
                  <Link
                    to="/passenger/rides"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/passenger/rides')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    My Rides
                  </Link>
                  <Link
                    to="/passenger/payments"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/passenger/payments')
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </Link>
                </>
              )}

              {role === 'ROLE_DRIVER' && (
                <>
                  <Link
                    to="/driver/dashboard"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/driver/dashboard')
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    Driver Console
                  </Link>
                  <Link
                    to="/driver/requests"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/driver/requests')
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    Ride Requests
                  </Link>
                  <Link
                    to="/driver/earnings"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      isActive('/driver/earnings')
                        ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Earnings
                  </Link>
                </>
              )}

              {role === 'ROLE_ADMIN' && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive('/admin/dashboard')
                      ? 'bg-amber-50 text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  System Ops
                </Link>
              )}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Right Action Icons & Profile Dropdown */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              {/* Notification Bell */}
              <button 
                aria-label="Notifications"
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900">{user?.name || 'User'}</span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                    {role === 'ROLE_DRIVER' ? 'Driver' : role === 'ROLE_ADMIN' ? 'Admin' : 'Passenger'}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200 shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-slate-200 px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {role === 'ROLE_PASSENGER' && (
                <>
                  <Link to="/passenger/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Dashboard</Link>
                  <Link to="/passenger/book" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Book Ride</Link>
                  <Link to="/passenger/rides" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600">My Rides</Link>
                  <Link to="/passenger/payments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600">Payments</Link>
                </>
              )}

              {role === 'ROLE_DRIVER' && (
                <>
                  <Link to="/driver/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700">Driver Console</Link>
                  <Link to="/driver/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700">Ride Requests</Link>
                  <Link to="/driver/earnings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700">Earnings</Link>
                </>
              )}

              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-2.5 text-center font-semibold text-slate-700 bg-slate-100 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full py-2.5 text-center font-semibold text-white bg-blue-600 rounded-xl shadow-md">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
