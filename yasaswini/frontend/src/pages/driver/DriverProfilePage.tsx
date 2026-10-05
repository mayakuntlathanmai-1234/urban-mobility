import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Car, ShieldCheck, Star } from 'lucide-react';

export const DriverProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Driver Partner Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Vehicle documentation and verified driver details.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-soft space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user?.name || 'Rahul Kumar'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 uppercase tracking-wider">
                Driver Partner
              </span>
              <span className="text-xs font-bold text-amber-600">★ 4.95 Rating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vehicle Model</span>
            <p className="font-bold text-slate-900 text-sm">Toyota Etios (2022)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Plate Number</span>
            <p className="font-mono font-bold text-slate-900 text-sm">DL-1420110012345</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">License Number</span>
            <p className="font-mono font-bold text-slate-900 text-sm">KA-01-2021-9876543</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Service Verification</span>
            <p className="font-bold text-emerald-700 text-sm">Verified & Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

