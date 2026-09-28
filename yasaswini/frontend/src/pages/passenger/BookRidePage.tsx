import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { MapView } from '../../components/map/MapView';
import { StatusBadge } from '../../components/common/Badge';
import { rideApi } from '../../api/rideApi';
import { realtimeService } from '../../services/socket';
import { useToast } from '../../components/common/Toast';
import { Ride, EstimateResponse } from '../../types';
import { 
  Navigation, 
  MapPin, 
  Car, 
  CreditCard, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  AlertTriangle,
  Phone,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BookRidePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [pickupAddress, setPickupAddress] = useState('MG Road Metro Station, Bengaluru');
  const [dropoffAddress, setDropoffAddress] = useState('Koramangala 5th Block, Bengaluru');
  const [pickupLat, setPickupLat] = useState(12.9716);
  const [pickupLng, setPickupLng] = useState(77.5946);
  const [dropoffLat, setDropoffLat] = useState(12.9352);
  const [dropoffLng, setDropoffLng] = useState(77.6245);

  const [selectedType, setSelectedType] = useState<'SEDAN' | 'SUV' | 'AUTO' | 'BIKE'>('SEDAN');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'UPI'>('CREDIT_CARD');
  const [estimates, setEstimates] = useState<EstimateResponse | null>(null);
  
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate fare estimates when reaching Step 3
  const handleCalculateEstimates = async () => {
    setLoading(true);
    try {
      const data = await rideApi.estimateFare({
        pickupLat,
        pickupLng,
        destLat: dropoffLat,
        destLng: dropoffLng,
        rideType: selectedType,
      });
      setEstimates(data);
      setStep(3);
    } catch (err: any) {
      showToast('error', 'Fare Calculation Failed', err.response?.data?.error || 'Unable to calculate fare estimates');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and Create Ride Request
  const handleConfirmRide = async () => {
    setLoading(true);
    try {
      const fare = estimates?.estimates[selectedType]?.estimatedFare || 250.00;
      const res = await rideApi.createRide({
        passengerId: user?.id || 'passenger-101',
        pickupAddress,
        dropoffAddress,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        fare,
        rideType: selectedType,
        paymentMethod,
      });

      setCurrentRide(res.ride);
      setIsSearching(true);
      setStep(5);
      showToast('success', 'Ride Requested', 'Searching for nearby drivers via STOMP broker...');
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.response?.data?.error || 'Unable to create ride request');
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time STOMP WebSockets ride updates
  useEffect(() => {
    if (!currentRide) return;

    const unsubscribe = realtimeService.subscribe((event) => {
      if (event.ride && event.ride.id === currentRide.id) {
        setCurrentRide(event.ride);
        
        if (event.ride.status === 'DRIVER_ASSIGNED') {
          setIsSearching(false);
          showToast('success', 'Driver Assigned!', `${event.ride.driverName || 'A driver'} accepted your ride.`);
        } else if (event.ride.status === 'RIDE_COMPLETED') {
          showToast('success', 'Trip Completed', 'Payment processed automatically via OpenFeign.');
        }
      }
    });

    // Fallback Polling every 3 seconds if WebSockets not connected
    const interval = setInterval(async () => {
      try {
        const updated = await rideApi.getRideById(currentRide.id);
        if (updated.ride) {
          setCurrentRide(updated.ride);
          if (updated.ride.status === 'DRIVER_ASSIGNED' && isSearching) {
            setIsSearching(false);
          }
        }
      } catch (e) {
        // Silent poll
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentRide, isSearching]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-extrabold flex items-center justify-center text-sm">
              {step}
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900">
                {step === 1 && 'Step 1: Enter Pickup Location'}
                {step === 2 && 'Step 2: Enter Destination'}
                {step === 3 && 'Step 3: Select Ride Type & Fare'}
                {step === 4 && 'Step 4: Confirm Booking Summary'}
                {step === 5 && (isSearching ? 'Step 5: Finding Your Driver' : 'Step 5: Ride Live Status')}
              </h1>
              <p className="text-xs text-slate-500">
                {step < 5 ? 'Customize your ride preferences below' : 'Real-time WebSocket trip tracking'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-md'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls / Form Card */}
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
            
            {/* STEP 1 & 2: Address Inputs */}
            {step <= 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Destination</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      placeholder="Enter destination..."
                      className="w-full pl-10 pr-4 py-3 text-xs font-semibold rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculateEstimates}
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Calculating Fares...' : 'Calculate Fares & Show Options'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: Ride Type Selection */}
            {step === 3 && estimates && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Select Vehicle Class</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {estimates.distanceKm} km • {estimates.estimatedTimeMin} mins
                  </span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(estimates.estimates).map(([type, details]) => (
                    <div
                      key={type}
                      onClick={() => setSelectedType(type as any)}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        selectedType === type
                          ? 'border-blue-600 bg-blue-50/60 shadow-md'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedType === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{type}</p>
                          <p className="text-[10px] text-slate-500">Base ₹{details.baseFare} + ₹{details.perKmFare}/km</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-extrabold text-slate-900">₹{details.estimatedFare}.00</p>
                        <p className="text-[10px] font-bold text-emerald-600">Fast Match</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={() => setStep(1)} className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">
                    Back
                  </button>
                  <button onClick={() => setStep(4)} className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">
                    Continue to Summary
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Ride Summary & Payment Selection */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200/60 pb-2">Booking Summary</h3>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{pickupAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{dropoffAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle Type:</span>
                    <span className="font-bold text-blue-600">{selectedType}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-sm">
                    <span>Estimated Fare:</span>
                    <span className="text-slate-900">₹{estimates?.estimates[selectedType]?.estimatedFare || 250}.00</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['CREDIT_CARD', 'CASH', 'UPI'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          paymentMethod === method
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {method.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={() => setStep(3)} className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100">
                    Back
                  </button>
                  <button
                    onClick={handleConfirmRide}
                    disabled={loading}
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Requesting...' : 'Confirm & Dispatch Ride'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Searching Radar or Live Ride Status */}
            {step === 5 && (
              <div className="space-y-5 text-center py-4">
                {isSearching ? (
                  <div className="space-y-4">
                    {/* Animated Radar Effect */}
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-radar" />
                      <span className="absolute inset-0 rounded-full bg-blue-500/10 animate-radar delay-300" />
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/40 relative z-10">
                        <Radio className="w-8 h-8 animate-pulse" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Finding Your Driver</h3>
                      <p className="text-xs text-slate-500 mt-1">Broadcasted to online drivers via STOMP broker (/topic/rides)...</p>
                    </div>

                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/80 text-xs text-left space-y-1">
                      <p className="font-bold text-blue-900">Ride ID: <span className="font-mono text-blue-700">{currentRide?.id}</span></p>
                      <p className="text-slate-600">Status: <StatusBadge status={currentRide?.status || 'WAITING_FOR_DRIVER'} /></p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Your Driver is Assigned</h3>
                        <p className="text-xs text-slate-500">Live Ride Lifecycle Tracking</p>
                      </div>
                      <StatusBadge status={currentRide?.status || 'DRIVER_ASSIGNED'} />
                    </div>

                    {/* Driver Card Info */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-bold flex items-center justify-center text-lg">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900">{currentRide?.driverName || 'Rahul Kumar'}</p>
                        <p className="text-[10px] font-medium text-slate-500">Toyota Etios • DL-1420110012345</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-amber-600">★ 4.9 Rating</span>
                          <span className="text-[10px] text-slate-400">• Verified Partner</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2 text-xs font-semibold text-slate-700 pt-2">
                      <div className={`flex items-center gap-2.5 ${currentRide?.status === 'DRIVER_ASSIGNED' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" /> Driver Assigned & En Route
                      </div>
                      <div className={`flex items-center gap-2.5 ${currentRide?.status === 'DRIVER_ARRIVED' ? 'text-cyan-600 font-bold' : 'text-slate-400'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" /> Driver Arrived at Pickup
                      </div>
                      <div className={`flex items-center gap-2.5 ${currentRide?.status === 'RIDE_STARTED' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" /> Trip Started
                      </div>
                      <div className={`flex items-center gap-2.5 ${currentRide?.status === 'RIDE_COMPLETED' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" /> Completed & Receipt Generated
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Map View */}
          <div className="lg:col-span-7">
            <MapView
              pickupLat={pickupLat}
              pickupLng={pickupLng}
              dropoffLat={dropoffLat}
              dropoffLng={dropoffLng}
              driverLat={step === 5 && !isSearching ? 12.9650 : undefined}
              driverLng={step === 5 && !isSearching ? 77.6000 : undefined}
              pickupAddress={pickupAddress}
              dropoffAddress={dropoffAddress}
              className="h-[420px] sm:h-[480px]"
            />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
