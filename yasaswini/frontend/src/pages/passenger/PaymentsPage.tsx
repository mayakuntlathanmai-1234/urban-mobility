import React, { useEffect, useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { paymentApi } from '../../api/paymentApi';
import { rideApi } from '../../api/rideApi';
import { Payment, Ride } from '../../types';
import { CreditCard, CheckCircle2, FileText, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentLogs();
  }, []);

  const fetchPaymentLogs = async () => {
    try {
      const data = await rideApi.listRides();
      setRides((data.rides || []).filter((r) => r.status === 'RIDE_COMPLETED'));
    } catch (e) {
      console.error('Failed to load payment history', e);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = rides.reduce((acc, r) => acc + (r.fare || 0), 0);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-7 h-7 text-cyan-600" />
              Payments & Transaction Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Recorded transactions processed via Payment Service & OpenFeign REST Client.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Settled</p>
              <p className="text-lg font-extrabold text-slate-900">₹{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <h3 className="text-base font-extrabold text-slate-900">Completed Transactions</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              OpenFeign Synchronized
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading payment receipts...</div>
          ) : rides.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">No Payment Audit Logs Yet</p>
              <p>Complete a ride to trigger automated Payment Service settlement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{ride.pickupAddress}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-xs font-extrabold text-slate-900">{ride.dropoffAddress}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Ride ID: {ride.id.slice(0, 12)}... • Method: {ride.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-extrabold text-slate-900">₹{ride.fare?.toFixed(2)}</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      SUCCESS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};
