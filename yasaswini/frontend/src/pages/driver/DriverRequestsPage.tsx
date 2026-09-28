import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { rideApi } from '../../api/rideApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { Ride } from '../../types';
import { Navigation, MapPin, Car, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';

export const DriverRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableRides();
    const interval = setInterval(fetchAvailableRides, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableRides = async () => {
    try {
      const data = await rideApi.getAvailableRides();
      setAvailableRides(data.rides || []);
    } catch (e) {
      console.error('Failed to load available rides', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setAcceptingId(rideId);
    try {
      const driverId = user?.id || 'd1';
      await rideApi.acceptRide(rideId, driverId);
      showToast('success', 'Ride Accepted!', 'Ride successfully assigned to you.');
      navigate(`/driver/active-ride?id=${rideId}`);
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        showToast('warning', 'Ride Already Accepted', 'Another driver accepted this ride first.');
      } else {
        showToast('error', 'Acceptance Failed', err.response?.data?.error || 'Unable to accept ride request');
      }
      fetchAvailableRides();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Navigation className="w-6 h-6 text-cyan-600" />
              Incoming Ride Requests
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time driver assignment with atomic concurrency lock protection.</p>
          </div>

          <button
            onClick={fetchAvailableRides}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Scanning for ride requests...</div>
        ) : availableRides.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Ride Requests Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Keep your driver console online. New passenger bookings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-3xl p-6 border-2 border-cyan-200 shadow-xl space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-extrabold">
                      {ride.rideType} CLASS
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: {ride.rideNumber || ride.id.slice(0, 8)}</span>
                  </div>
                  <span className="text-xl font-extrabold text-emerald-600">₹{ride.fare?.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                        <p className="font-extrabold text-slate-900">{ride.pickupAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Destination</span>
                        <p className="font-extrabold text-slate-900">{ride.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleAcceptRide(ride.id)}
                    disabled={acceptingId === ride.id}
                    className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {acceptingId === ride.id ? (
                      'Accepting Lock...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> ACCEPT RIDE REQUEST
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};
