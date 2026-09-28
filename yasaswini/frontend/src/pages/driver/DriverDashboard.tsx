import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MapView } from '../../components/map/MapView';
import { driverApi } from '../../api/driverApi';
import { rideApi } from '../../api/rideApi';
import { Driver, Ride } from '../../types';
import { useToast } from '../../components/common/Toast';
import { 
  Car, 
  Power, 
  DollarSign, 
  CheckCircle2, 
  Star, 
  Navigation, 
  ArrowRight, 
  Radio, 
  TrendingUp,
  MapPin
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const data = await driverApi.getAllDrivers();
      if (data.drivers && data.drivers.length > 0) {
        setDriver(data.drivers[0]);
        setIsOnline(data.drivers[0].isOnline);
      }

      const ridesData = await rideApi.getAvailableRides();
      setAvailableRides(ridesData.rides || []);
    } catch (e) {
      console.error('Failed to load driver dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      const driverId = driver?.id || 'd1';
      await driverApi.updateStatus(driverId, nextState);
      showToast('info', 'Status Updated', `You are now ${nextState ? 'ONLINE & Available' : 'OFFLINE'}`);
    } catch (e) {
      showToast('error', 'Status Update Failed', 'Unable to toggle availability status');
      setIsOnline(!nextState);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header & Online Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-extrabold uppercase">
                Driver Partner Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, <span className="text-cyan-700">{user?.name || driver?.name || 'Driver'}</span> 🚗
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Toyota Etios • Plate: DL-1420110012345
            </p>
          </div>

          {/* Large Online/Offline Toggle Button */}
          <button
            onClick={handleToggleOnline}
            className={`px-7 py-3.5 rounded-2xl font-extrabold text-xs shadow-xl transition-all flex items-center gap-3 hover:scale-105 ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/25'
            }`}
          >
            <Power className={`w-4 h-4 ${isOnline ? 'animate-pulse' : ''}`} />
            <span>{isOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}</span>
          </button>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Today's Earnings</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">₹1,240.00</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% vs yesterday
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">8 Trips</p>
            <p className="text-[10px] text-slate-400 mt-1">100% Acceptance Rate</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Driver Rating</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">4.95 ★</p>
            <p className="text-[10px] text-slate-400 mt-1">Based on 142 ratings</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Ride Requests</span>
              <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
            </div>
            <p className="text-2xl font-extrabold text-cyan-700">{availableRides.length} Pending</p>
            <p className="text-[10px] text-slate-400 mt-1">Ready for pickup</p>
          </div>
        </div>

        {/* Live Requests & Driver Telemetry Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Nearby Available Requests Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-600" />
                Live Ride Requests
              </h3>
              <Link to="/driver/requests" className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {availableRides.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Radio className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="font-bold text-slate-700">Searching for Nearby Passengers...</p>
                <p>New ride requests will pop up here in real time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableRides.slice(0, 3).map((ride) => (
                  <div key={ride.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {ride.rideType}
                        </span>
                        <p className="text-xs font-extrabold text-slate-900 mt-1">{ride.pickupAddress}</p>
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">₹{ride.fare?.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span className="truncate">{ride.dropoffAddress}</span>
                    </div>

                    <Link
                      to="/driver/requests"
                      className="block w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs text-center rounded-xl shadow-md transition-all"
                    >
                      View & Accept Request
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map View */}
          <div className="lg:col-span-7">
            <MapView
              driverLat={12.9600}
              driverLng={77.6000}
              pickupLat={12.9716}
              pickupLng={77.5946}
              className="h-[380px] sm:h-[450px]"
            />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
