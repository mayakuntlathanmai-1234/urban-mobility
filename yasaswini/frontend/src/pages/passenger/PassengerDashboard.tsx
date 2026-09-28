import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MapView } from '../../components/map/MapView';
import { StatusBadge } from '../../components/common/Badge';
import { rideApi } from '../../api/rideApi';
import { Ride } from '../../types';
import { Navigation, Car, History, CreditCard, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState('MG Road Metro Station, Bengaluru');
  const [destination, setDestination] = useState('Koramangala 5th Block, Bengaluru');
  const [rides, setRides] = useState<Ride[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchPassengerRides();
  }, []);

  const fetchPassengerRides = async () => {
    try {
      const data = await rideApi.listRides();
      setRides(data.rides || []);
    } catch (err) {
      console.error('Failed to fetch rides', err);
    } finally {
      setLoading(false);
    }
  };

  const completedRides = rides.filter((r) => r.status === 'RIDE_COMPLETED' || r.status === 'COMPLETED');
  const activeRide = rides.find((r) =>
    ['WAITING_FOR_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'RIDE_STARTED'].includes(r.status)
  );
  const totalSpent = completedRides.reduce((acc, r) => acc + (r.finalFare || r.fare || r.estimatedFare || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Greeting & Active Ride Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good day, <span className="text-blue-600">{user?.name || 'Passenger'}</span> 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Where would you like to travel today? Real-time drivers available near you.
            </p>
          </div>

          {activeRide && (
            <Link
              to="/passenger/book"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105 self-start sm:self-auto"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              Active Trip in Progress ({activeRide.status.replace(/_/g, ' ')})
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        {/* Quick Booking Card & Live Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Booking Card */}
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl shadow-xl border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                Where are you going?
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 uppercase">
                Instant Dispatch
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pickup Point
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter dropoff location..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Quick Ride Type Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Select Vehicle Class
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl border-2 border-blue-600 bg-blue-50/50 text-center cursor-pointer">
                  <Car className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">Sedan</p>
                  <p className="text-[10px] text-slate-500">₹250.00</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-center cursor-pointer transition-all">
                  <Car className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">SUV</p>
                  <p className="text-[10px] text-slate-500">₹320.00</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-center cursor-pointer transition-all">
                  <Car className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-900">Auto</p>
                  <p className="text-[10px] text-slate-500">₹140.00</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/passenger/book')}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <span>Continue to Ride Options</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Leaflet Map Overview */}
          <div className="lg:col-span-7">
            <MapView
              pickupLat={12.9716}
              pickupLng={77.5946}
              dropoffLat={12.9352}
              dropoffLng={77.6245}
              driverLat={12.96}
              driverLng={77.6}
              pickupAddress={pickup}
              dropoffAddress={destination}
              className="h-[380px] sm:h-[450px]"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Rides</span>
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{rides.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Lifetime bookings</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{completedRides.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Successful trips</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Active Ride</span>
              <Navigation className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{activeRide ? '1' : '0'}</p>
            <p className="text-[10px] text-slate-400 mt-1">{activeRide ? 'In Progress' : 'No active trip'}</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
              <CreditCard className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">₹{totalSpent.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-1">Verified payments</p>
          </div>
        </div>

        {/* Recent Rides Table/List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recent Rides</h3>
              <p className="text-xs text-slate-500">Your recent travel requests and completed trips.</p>
            </div>
            <Link to="/passenger/history" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All Rides <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {rides.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700">No rides booked yet!</p>
              <p>Book your first ride using the form above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.slice(0, 5).map((ride) => {
                const fare = ride.finalFare ?? ride.fare ?? ride.estimatedFare ?? 0;
                return (
                  <div
                    key={ride.id}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{ride.pickupAddress}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-extrabold text-slate-900">{ride.destAddress || ride.dropoffAddress}</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">
                          ID: {ride.rideNumber || ride.id.slice(0, 8)} • Type: {ride.rideType} •{' '}
                          {new Date(ride.requestedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                      <span className="text-sm font-extrabold text-slate-900">₹{fare.toFixed(2)}</span>
                      <StatusBadge status={ride.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
