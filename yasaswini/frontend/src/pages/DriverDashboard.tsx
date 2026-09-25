import React, { useState, useEffect } from 'react';
import { Power, DollarSign, CheckCircle2, Star, Navigation, MapPin, Phone, User, Play, AlertCircle } from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { fetchApi } from '../services/api';
import { socket } from '../services/socket';
import { Driver, Ride } from '../types';

export const DriverDashboard: React.FC = () => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<Ride | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [stats, setStats] = useState({
    todayEarnings: 1240,
    completedToday: 8,
    totalEarnings: 2480,
    totalRides: 12,
    rating: 4.8
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchDriverStats();
  }, []);

  useEffect(() => {
    // Listen for incoming ride requests over Socket.IO
    socket.on('ride:new_request', (data: { ride: Ride }) => {
      if (isOnline && !activeRide) {
        setIncomingRequest(data.ride);
      }
    });

    socket.on('ride:status:change', (data: { rideId: string; status: any; ride: Ride }) => {
      if (driver && data.ride?.driverId === driver.id) {
        if (['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'RIDE_STARTED'].includes(data.status)) {
          setActiveRide(data.ride);
          setIncomingRequest(null);
        } else if (['COMPLETED', 'CANCELLED_BY_RIDER', 'CANCELLED_BY_DRIVER'].includes(data.status)) {
          setActiveRide(null);
          setIncomingRequest(null);
          fetchDriverStats();
        }
      } else if (activeRide && activeRide.id === data.rideId) {
        setActiveRide(data.ride);
        if (['COMPLETED', 'CANCELLED_BY_RIDER', 'CANCELLED_BY_DRIVER'].includes(data.status)) {
          setActiveRide(null);
          fetchDriverStats();
        }
      }
    });

    return () => {
      socket.off('ride:new_request');
      socket.off('ride:status:change');
    };
  }, [isOnline, activeRide, driver]);

  const fetchDriverStats = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ driver?: Driver | null; activeRide?: Ride | null; pendingRequest?: Ride | null; stats?: any }>('/drivers/dashboard');
      if (res.driver) {
        setDriver(res.driver);
        setIsOnline(Boolean(res.driver.isOnline));
      }
      if (res.activeRide) {
        setActiveRide(res.activeRide);
      }
      if (res.pendingRequest && !res.activeRide) {
        setIncomingRequest(res.pendingRequest);
      }
      if (res.stats) {
        setStats({
          todayEarnings: res.stats.todayEarnings ?? 1240,
          completedToday: res.stats.completedToday ?? 8,
          totalEarnings: res.stats.totalEarnings ?? 2480,
          totalRides: res.stats.totalRides ?? 12,
          rating: res.stats.rating ?? 4.8
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch driver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    try {
      await fetchApi('/drivers/status', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline: nextState })
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    setError('');
    try {
      const res = await fetchApi<{ ride: Ride }>(`/rides/${rideId}/accept`, { method: 'POST' });
      setActiveRide(res.ride);
      setIncomingRequest(null);
    } catch (err: any) {
      setError(err.message || 'Failed to accept ride');
    }
  };

  const handleRejectRide = () => {
    setIncomingRequest(null);
  };

  const handleMarkArrived = async () => {
    if (!activeRide) return;
    try {
      const res = await fetchApi<{ ride: Ride }>(`/rides/${activeRide.id}/arrive`, { method: 'POST' });
      setActiveRide(res.ride);
    } catch (err: any) {
      setError(err.message || 'Failed to mark arrived');
    }
  };

  const handleStartRide = async () => {
    if (!activeRide) return;
    try {
      const res = await fetchApi<{ ride: Ride }>(`/rides/${activeRide.id}/start`, { method: 'POST' });
      setActiveRide(res.ride);
    } catch (err: any) {
      setError(err.message || 'Failed to start ride');
    }
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    try {
      const res = await fetchApi<{ ride: Ride }>(`/rides/${activeRide.id}/complete`, { method: 'POST' });
      setActiveRide(null);
      fetchDriverStats();
    } catch (err: any) {
      setError(err.message || 'Failed to complete ride');
    }
  };

  const driverName = driver?.user?.name || 'Rahul Kumar';
  const vehicleMake = driver?.vehicle?.make || 'Hyundai';
  const vehicleModel = driver?.vehicle?.model || 'i20';
  const vehiclePlate = driver?.vehicle?.plateNumber || 'AP 39 AB 1234';

  const driverLat = driver?.currentLat || 16.5062;
  const driverLng = driver?.currentLng || 80.6480;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs font-bold text-rose-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center font-black text-gray-950 text-xl shadow-lg shadow-amber-500/20">
            {driverName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{driverName}</h2>
            <p className="text-xs text-gray-400 font-mono">
              Vehicle: <span className="text-amber-400 font-bold">{vehicleMake} {vehicleModel}</span> ({vehiclePlate})
            </p>
          </div>
        </div>

        {/* Online / Offline Toggle Button */}
        <button
          onClick={handleToggleOnline}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-xl flex items-center space-x-2 transition-all ${
            isOnline
              ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 shadow-emerald-500/20 ring-2 ring-emerald-400/40'
              : 'bg-gray-800 hover:bg-gray-750 text-gray-400 border border-gray-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isOnline ? '[ ONLINE ]' : '[ OFFLINE ]'}</span>
        </button>
      </div>

      {/* Driver Dashboard Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Today's Earnings</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">₹{stats.todayEarnings}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Completed Rides</span>
          <span className="text-2xl font-black text-white font-mono">{stats.completedToday}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Driver Rating</span>
          <span className="text-2xl font-black text-amber-400 font-mono flex items-center">
            {stats.rating} <Star className="w-5 h-5 fill-current ml-1" />
          </span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Total Lifetime Earnings</span>
          <span className="text-2xl font-black text-blue-400 font-mono">₹{stats.totalEarnings}</span>
        </div>
      </div>

      {/* Incoming Ride Request Modal Dialog */}
      {incomingRequest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl space-y-4 animate-pulse">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <span className="text-sm font-black text-amber-400 flex items-center">
              ⚡ INCOMING RIDE REQUEST
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Est. Fare: ₹{incomingRequest.estimatedFare}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block">Passenger</span>
              <span className="font-bold text-white text-sm">{incomingRequest.passenger?.name || 'Rider'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Distance</span>
              <span className="font-bold text-white text-sm">{incomingRequest.distanceKm} km (~{incomingRequest.estimatedTimeMin} mins)</span>
            </div>
          </div>

          <div className="space-y-1 text-xs font-mono bg-gray-950/80 p-3 rounded-xl border border-gray-800">
            <div><span className="text-emerald-400 font-bold">🟢 Pickup:</span> {incomingRequest.pickupAddress}</div>
            <div><span className="text-rose-400 font-bold">🔴 Dropoff:</span> {incomingRequest.destAddress}</div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => handleAcceptRide(incomingRequest.id)}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              [ Accept Ride ]
            </button>
            <button
              onClick={handleRejectRide}
              className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-gray-700 transition-all"
            >
              [ Reject ]
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Active Ride Navigation & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Trip Navigation Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeRide ? (
            <div className="bg-gray-900 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-gray-300">Active Ride Control</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {activeRide.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Passenger Info */}
              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">{activeRide.passenger?.name || 'Rider'}</span>
                  <span className="text-emerald-400 font-black text-sm">₹{activeRide.estimatedFare}</span>
                </div>
                <div className="text-gray-400 font-mono">
                  Phone: {activeRide.passenger?.phone || '+91 98765 43210'}
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-2 text-xs font-mono bg-gray-950 p-3 rounded-xl border border-gray-800">
                <div><span className="text-emerald-400 font-bold">🟢 Pickup:</span> {activeRide.pickupAddress}</div>
                <div><span className="text-rose-400 font-bold">🔴 Dropoff:</span> {activeRide.destAddress}</div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="space-y-2 pt-2">
                {(activeRide.status === 'DRIVER_ASSIGNED' || activeRide.status === 'DRIVER_ARRIVING') && (
                  <button
                    onClick={handleMarkArrived}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all"
                  >
                    Mark "Driver Arrived at Pickup"
                  </button>
                )}

                {activeRide.status === 'DRIVER_ARRIVED' && (
                  <button
                    onClick={handleStartRide}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Start Ride Journey
                  </button>
                )}

                {activeRide.status === 'RIDE_STARTED' && (
                  <button
                    onClick={handleCompleteRide}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 font-black text-xs shadow-xl shadow-emerald-500/25 transition-all"
                  >
                    Complete Ride & Collect ₹{activeRide.estimatedFare}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-white text-base">You Are Online</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Waiting for nearby passenger ride requests. Incoming requests will display automatically above.
              </p>
            </div>
          )}
        </div>

        {/* Map Column (7 cols) */}
        <div className="lg:col-span-7">
          <MapView
            pickup={activeRide ? { lat: activeRide.pickupLat, lng: activeRide.pickupLng, address: activeRide.pickupAddress } : null}
            destination={activeRide ? { lat: activeRide.destLat, lng: activeRide.destLng, address: activeRide.destAddress } : null}
            assignedDriver={driver}
            assignedDriverLoc={{ lat: driverLat, lng: driverLng }}
            height="500px"
          />
        </div>
      </div>
    </div>
  );
};
