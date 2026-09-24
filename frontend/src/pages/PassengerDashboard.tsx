import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Search, Car, AlertCircle, RefreshCw, Play, Zap, CheckCircle2 } from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { RideTypeCard } from '../components/ride/RideTypeCard';
import { DriverInfoCard } from '../components/ride/DriverInfoCard';
import { RideStatusStepper } from '../components/ride/RideStatusStepper';
import { ReceiptModal } from '../components/ride/ReceiptModal';
import { RatingModal } from '../components/ride/RatingModal';
import { fetchApi } from '../services/api';
import { socket } from '../services/socket';
import { Ride, FareEstimate, Driver, RideType } from '../types';

export const PassengerDashboard: React.FC = () => {
  // Address State (Default Vijayawada Regional Locations)
  const [pickupAddress, setPickupAddress] = useState<string>('Vijayawada Railway Station');
  const [pickupLat, setPickupLat] = useState<number>(16.5062);
  const [pickupLng, setPickupLng] = useState<number>(80.6480);

  const [destAddress, setDestAddress] = useState<string>('KL University (KLU), Vaddeswaram');
  const [destLat, setDestLat] = useState<number>(16.4419);
  const [destLng, setDestLng] = useState<number>(80.6226);

  const [selectionMode, setSelectionMode] = useState<'pickup' | 'dest' | null>(null);

  // Estimates & Vehicle Selection State
  const [estimates, setEstimates] = useState<FareEstimate[]>([]);
  const [selectedType, setSelectedType] = useState<RideType>('SEDAN');
  const [calculating, setCalculating] = useState<boolean>(false);

  // Active Ride & Telemetry State
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [assignedDriverLoc, setAssignedDriverLoc] = useState<{ lat: number; lng: number } | null>(null);

  // Modals State
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch Nearby Drivers and Calculate Initial Fare Estimate
  useEffect(() => {
    fetchNearbyDrivers();
    handleEstimateFare();
  }, [pickupLat, pickupLng, destLat, destLng]);

  // Listen for Real-Time Socket.IO Updates
  useEffect(() => {
    if (!activeRide) return;

    socket.emit('join:ride', activeRide.id);

    const handleStatusChange = (data: { rideId: string; status: any; ride: Ride }) => {
      if (data.rideId === activeRide.id) {
        setActiveRide(data.ride);
        if (data.status === 'COMPLETED') {
          setShowReceipt(true);
        }
      }
    };

    const handleLocationUpdate = (data: { driverId: string; latitude: number; longitude: number }) => {
      if (activeRide?.driver?.id === data.driverId) {
        setAssignedDriverLoc({ lat: data.latitude, lng: data.longitude });
      }
    };

    socket.on('ride:status:change', handleStatusChange);
    socket.on('driver:location:update', handleLocationUpdate);

    return () => {
      socket.off('ride:status:change', handleStatusChange);
      socket.off('driver:location:update', handleLocationUpdate);
      socket.emit('leave:ride', activeRide.id);
    };
  }, [activeRide?.id]);

  const fetchNearbyDrivers = async () => {
    try {
      const res = await fetchApi<{ drivers: Driver[] }>('/drivers/nearby');
      setNearbyDrivers(res.drivers);
    } catch (err) {
      console.error('Failed to fetch nearby drivers:', err);
    }
  };

  const handleEstimateFare = async () => {
    setCalculating(true);
    setError('');
    try {
      const res = await fetchApi<{ distanceKm: number; estimatedTimeMin: number; estimates: FareEstimate[] }>('/rides/estimate', {
        method: 'POST',
        body: JSON.stringify({ pickupLat, pickupLng, destLat, destLng })
      });
      setEstimates(res.estimates);
    } catch (err: any) {
      setError(err.message || 'Failed to estimate fare');
    } finally {
      setCalculating(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupLat(pos.coords.latitude);
          setPickupLng(pos.coords.longitude);
          setPickupAddress('Current GPS Location');
        },
        () => {
          setError('Location access unavailable. Enter pickup location manually.');
        }
      );
    } else {
      setError('Geolocation not supported by browser.');
    }
  };

  const handleMapClickSelect = (lat: number, lng: number) => {
    if (selectionMode === 'pickup') {
      setPickupLat(lat);
      setPickupLng(lng);
      setPickupAddress(`Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setSelectionMode(null);
    } else if (selectionMode === 'dest') {
      setDestLat(lat);
      setDestLng(lng);
      setDestAddress(`Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setSelectionMode(null);
    }
  };

  const handleRequestRide = async () => {
    setError('');
    try {
      const res = await fetchApi<{ ride: Ride }>('/rides', {
        method: 'POST',
        body: JSON.stringify({
          pickupLat,
          pickupLng,
          pickupAddress,
          destLat,
          destLng,
          destAddress,
          rideType: selectedType,
          paymentMethod: 'CASH'
        })
      });
      setActiveRide(res.ride);

      // Auto accept for demo testing if nearby driver exists
      if (nearbyDrivers.length > 0) {
        setTimeout(async () => {
          try {
            await fetchApi(`/rides/${res.ride.id}/accept`, { method: 'POST' });
          } catch (e) {
            console.warn('Auto accept demo notice:', e);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request ride');
    }
  };

  const handleCancelRide = async () => {
    if (!activeRide) return;
    try {
      await fetchApi(`/rides/${activeRide.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Passenger cancelled' })
      });
      setActiveRide(null);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel ride');
    }
  };

  // Automated 1-Click Simulator Handler
  const handleTriggerSimulation = async () => {
    if (!activeRide || !activeRide.driverId) return;
    socket.emit('simulation:start', {
      rideId: activeRide.id,
      driverId: activeRide.driverId
    });
  };

  const selectedEstimate = estimates.find(e => e.vehicleType === selectedType) || estimates[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notifications / Errors */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs font-bold text-rose-400 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Main Desktop Two-Column / Mobile Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Booking Controls & Status (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {!activeRide ? (
            /* Booking Form & Vehicle Selection */
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h2 className="text-lg font-black text-white flex items-center">
                  <Car className="w-5 h-5 text-emerald-400 mr-2" /> Book Your Ride
                </h2>
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-750 text-emerald-400 text-xs font-bold border border-gray-700 flex items-center space-x-1"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>My Location</span>
                </button>
              </div>

              {/* Location Input Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 flex items-center justify-between">
                    <span className="flex items-center text-emerald-400">
                      <MapPin className="w-3.5 h-3.5 mr-1" /> Pickup Location
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectionMode(selectionMode === 'pickup' ? null : 'pickup')}
                      className={`text-[10px] font-mono hover:underline ${selectionMode === 'pickup' ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}
                    >
                      {selectionMode === 'pickup' ? 'Cancel Click' : 'Select on Map'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Enter pickup address"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1 flex items-center justify-between">
                    <span className="flex items-center text-rose-400">
                      <Navigation className="w-3.5 h-3.5 mr-1" /> Destination
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectionMode(selectionMode === 'dest' ? null : 'dest')}
                      className={`text-[10px] font-mono hover:underline ${selectionMode === 'dest' ? 'text-rose-400 font-bold' : 'text-gray-500'}`}
                    >
                      {selectionMode === 'dest' ? 'Cancel Click' : 'Select on Map'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="Enter destination address"
                  />
                </div>
              </div>

              {/* Ride Types Selection Cards */}
              <div className="space-y-2.5">
                <label className="text-xs font-extrabold text-gray-300 block uppercase tracking-wider">
                  Select Ride Category
                </label>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {estimates.map((est) => (
                    <RideTypeCard
                      key={est.vehicleType}
                      estimate={est}
                      isSelected={selectedType === est.vehicleType}
                      onSelect={(t) => setSelectedType(t)}
                    />
                  ))}
                </div>
              </div>

              {/* Request Ride Action Button */}
              {selectedEstimate && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleRequestRide}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Request {selectedType} Ride &bull; ₹{selectedEstimate.estimatedFare}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Active Ride Panel */
            <div className="space-y-4">
              {/* Ride Progress Stepper */}
              <RideStatusStepper status={activeRide.status} cancelReason={activeRide.cancelReason} />

              {/* Searching for Driver Loader */}
              {activeRide.status === 'SEARCHING_DRIVER' && (
                <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 shadow-2xl">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
                  <h4 className="font-extrabold text-white text-base">Finding Nearby Drivers...</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Searching for suitable {activeRide.rideType} drivers near {activeRide.pickupAddress}.
                  </p>
                  <button
                    onClick={handleCancelRide}
                    className="mt-2 text-xs font-bold text-rose-400 hover:underline"
                  >
                    Cancel Request
                  </button>
                </div>
              )}

              {/* Assigned Driver Information */}
              {activeRide.driver && (
                <DriverInfoCard
                  driver={activeRide.driver as Driver}
                  status={activeRide.status}
                  onCancelRide={handleCancelRide}
                />
              )}

              {/* Automated Simulator Control Button for instant demo testing */}
              {activeRide.driver && activeRide.status !== 'COMPLETED' && (
                <button
                  onClick={handleTriggerSimulation}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>⚡ Run Automated Live GPS Driver Simulation</span>
                </button>
              )}

              <button
                onClick={() => setActiveRide(null)}
                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-300 font-bold text-xs border border-gray-700"
              >
                + Request Another Ride
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map (7 cols) */}
        <div className="lg:col-span-7">
          <MapView
            pickup={{ lat: pickupLat, lng: pickupLng, address: pickupAddress }}
            destination={{ lat: destLat, lng: destLng, address: destAddress }}
            drivers={nearbyDrivers}
            assignedDriver={activeRide?.driver as Driver | null}
            assignedDriverLoc={assignedDriverLoc}
            onSelectLocation={handleMapClickSelect}
            selectionMode={selectionMode}
            height="580px"
          />
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && activeRide && (
        <ReceiptModal
          ride={activeRide}
          onClose={() => setShowReceipt(false)}
          onRateRide={() => {
            setShowReceipt(false);
            setShowRating(true);
          }}
        />
      )}

      {/* Rating Modal */}
      {showRating && activeRide && (
        <RatingModal
          rideId={activeRide.id}
          driverName={activeRide.driver?.user?.name}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
};
