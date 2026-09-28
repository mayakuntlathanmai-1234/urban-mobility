import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MapView } from '../../components/map/MapView';
import { StatusBadge } from '../../components/common/Badge';
import { rideApi } from '../../api/rideApi';
import { useToast } from '../../components/common/Toast';
import { Ride } from '../../types';
import { MapPin, Navigation, CheckCircle2, Play, Flag, Phone } from 'lucide-react';

export const ActiveRidePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get('id');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
    }
  }, [rideId]);

  const fetchRideDetails = async () => {
    if (!rideId) return;
    try {
      const data = await rideApi.getRideById(rideId);
      setRide(data.ride);
    } catch (e) {
      showToast('error', 'Fetch Error', 'Unable to fetch ride details');
    }
  };

  const handleArrive = async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      const res = await rideApi.markArrived(rideId);
      setRide(res.ride);
      showToast('info', 'Status Updated', 'Marked as Arrived at Pickup Location');
    } catch (e: any) {
      showToast('error', 'Action Failed', e.response?.data?.error || 'Unable to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      const res = await rideApi.startRide(rideId);
      setRide(res.ride);
      showToast('info', 'Status Updated', 'Passenger Picked Up - Trip Started!');
    } catch (e: any) {
      showToast('error', 'Action Failed', e.response?.data?.error || 'Unable to start ride');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      const res = await rideApi.completeRide(rideId);
      setRide(res.ride);
      showToast('success', 'Ride Completed!', 'Payment settled automatically via OpenFeign.');
      setTimeout(() => navigate('/driver/earnings'), 2000);
    } catch (e: any) {
      showToast('error', 'Completion Failed', e.response?.data?.error || 'Unable to complete ride');
    } finally {
      setLoading(false);
    }
  };

  if (!ride) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
          Loading active trip details...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Trip Lifecycle</h1>
            <p className="text-xs text-slate-500">Manage step-by-step ride progression from pickup to completion.</p>
          </div>
          <StatusBadge status={ride.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Action Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Passenger Details</p>
                <h3 className="text-base font-extrabold text-slate-900">Passenger #{ride.passengerId}</h3>
              </div>
              <span className="text-lg font-extrabold text-slate-900">₹{ride.fare?.toFixed(2)}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</span>
                  <p className="font-extrabold text-slate-900">{ride.pickupAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dropoff Destination</span>
                  <p className="font-extrabold text-slate-900">{ride.dropoffAddress}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons based on current state */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {ride.status === 'DRIVER_ASSIGNED' && (
                <button
                  onClick={handleArrive}
                  disabled={loading}
                  className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> MARK ARRIVED AT PICKUP
                </button>
              )}

              {ride.status === 'DRIVER_ARRIVED' && (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> START TRIP (PASSENGER ONBOARD)
                </button>
              )}

              {ride.status === 'RIDE_STARTED' && (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <Flag className="w-4 h-4" /> COMPLETE TRIP & SETTLE FARE
                </button>
              )}

              {ride.status === 'RIDE_COMPLETED' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center">
                  ✅ Trip Completed Successfully!
                </div>
              )}
            </div>

          </div>

          {/* Map View */}
          <div className="lg:col-span-7">
            <MapView
              pickupLat={ride.pickupLat}
              pickupLng={ride.pickupLng}
              dropoffLat={ride.dropoffLat}
              dropoffLng={ride.dropoffLng}
              driverLat={12.9650}
              driverLng={77.6000}
              className="h-[420px] sm:h-[480px]"
            />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
