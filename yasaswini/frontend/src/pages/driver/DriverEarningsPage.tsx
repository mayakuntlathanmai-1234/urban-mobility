import React from 'react';
import { DollarSign } from 'lucide-react';

export const DriverEarningsPage: React.FC = () => {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <DollarSign className="w-7 h-7 text-emerald-600" />
          Driver Earnings & Payout Statements
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Real-time daily earnings summary and automated OpenFeign payment settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Today's Earnings</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">₹1,240.00</p>
          <p className="text-xs font-bold text-emerald-600 mt-1">8 Completed Trips</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Weekly Total</span>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">₹8,650.00</p>
          <p className="text-xs text-slate-400 mt-1">42 Completed Trips</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase">Lifetime Net Payout</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">₹48,920.00</p>
          <p className="text-xs text-slate-400 mt-1">0% Commission Promotion</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
          Recent Trip Settlements
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-slate-900">MG Road → Koramangala 5th Block</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ride #URM-95744 • Method: CASH</p>
            </div>
            <span className="text-base font-extrabold text-emerald-600">+₹250.00</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-extrabold text-slate-900">Indiranagar 100ft Road → HSR Layout</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ride #URM-88412 • Method: UPI</p>
            </div>
            <span className="text-base font-extrabold text-emerald-600">+₹180.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

