import React, { useState, useEffect } from 'react';
import { History, Calendar, MapPin, Navigation, Car, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { fetchApi } from '../services/api';
import { Ride } from '../types';

export const RideHistoryPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ rides: Ride[] }>('/rides');
      setRides(res.rides);
    } catch (err) {
      console.error('Failed to fetch ride history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Ride History & Activity Log</h2>
          <p className="text-xs text-gray-400">View past completed and cancelled trip records.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading ride history...</div>
      ) : rides.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-white">No Ride History Found</p>
          <p className="text-xs text-gray-400">Your completed rides will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <div
              key={ride.id}
              onClick={() => setSelectedRide(ride)}
              className="bg-gray-900 border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-4 shadow-xl transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-xs font-mono">#{ride.rideNumber}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(ride.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    ride.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    {ride.status}
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">
                    ₹{ride.finalFare || ride.estimatedFare}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-start">
                  <span className="text-emerald-400 font-bold mr-2 shrink-0">🟢 Pickup:</span>
                  <span className="text-gray-300 truncate">{ride.pickupAddress}</span>
                </div>
                <div className="flex items-start">
                  <span className="text-rose-400 font-bold mr-2 shrink-0">🔴 Dropoff:</span>
                  <span className="text-gray-300 truncate">{ride.destAddress}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800/60 font-mono">
                <span>Distance: {ride.distanceKm} km</span>
                <span>Type: {ride.rideType}</span>
                <span>Payment: {ride.paymentMethod}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
