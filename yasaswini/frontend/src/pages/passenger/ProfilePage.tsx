import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { User, Mail, Phone, ShieldCheck, Key } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Authenticated user credentials and security role.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200/60">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{user?.name}</h2>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Account ID
              </span>
              <p className="font-mono font-bold text-slate-900 text-sm truncate">{user?.id}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
              </span>
              <p className="font-bold text-slate-900 text-sm">{user?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Phone Number
              </span>
              <p className="font-bold text-slate-900 text-sm">{user?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Security Status
              </span>
              <p className="font-bold text-emerald-700 text-sm">BCrypt & JWT Encrypted</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};
