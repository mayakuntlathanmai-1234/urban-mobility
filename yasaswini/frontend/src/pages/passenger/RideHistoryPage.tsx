import React, { useEffect, useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { StatusBadge } from '../../components/common/Badge';
import { rideApi } from '../../api/rideApi';
import { paymentApi } from '../../api/paymentApi';
import { Ride, Payment } from '../../types';
import { 
  History, 
  Search, 
  Filter, 
  MapPin, 
  ArrowRight, 
  Car, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  X,
  FileText
} from 'lucide-react';

export const RideHistoryPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const data = await rideApi.listRides();
      setRides(data.rides || []);
      setFilteredRides(data.rides || []);
    } catch (err) {
      console.error('Failed to fetch ride history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...rides];
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'COMPLETED') {
        result = result.filter((r) => r.status === 'RIDE_COMPLETED');
      } else if (filterStatus === 'CANCELLED') {
        result = result.filter((r) => r.status === 'CANCELLED');
      } else if (filterStatus === 'ACTIVE') {
        result = result.filter((r) =>
          ['WAITING_FOR_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'RIDE_STARTED'].includes(r.status)
        );
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.pickupAddress && r.pickupAddress.toLowerCase().includes(q)) ||
          (r.dropoffAddress && r.dropoffAddress.toLowerCase().includes(q)) ||
          (r.destAddress && r.destAddress.toLowerCase().includes(q)) ||
          (r.rideNumber && r.rideNumber.toLowerCase().includes(q))
      );
    }

    setFilteredRides(result);
  }, [filterStatus, searchQuery, rides]);

  const handleOpenDetail = async (ride: Ride) => {
    setSelectedRide(ride);
    setSelectedPayment(null);
    if (ride.status === 'RIDE_COMPLETED') {
      try {
        const p = await paymentApi.getPaymentByRideId(ride.id);
        setSelectedPayment(p);
      } catch (e) {
        // No payment receipt yet
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <History className="w-7 h-7 text-blue-600" />
              Ride History & Receipts
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              View your past trips, ride details, driver assignments, and transaction invoices.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['ALL', 'COMPLETED', 'ACTIVE', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickup or destination..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Ride Cards List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading your travel history...</div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Rides Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no matching rides found for your selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRides.map((ride) => (
              <div
                key={ride.id}
                onClick={() => handleOpenDetail(ride)}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft hover:shadow-xl transition-all cursor-pointer space-y-4 group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {ride.rideNumber || ride.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      • {new Date(ride.requestedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-1">{ride.pickupAddress}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-1">{ride.dropoffAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Class: <b className="text-slate-900">{ride.rideType}</b></span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">₹{ride.fare?.toFixed(2)}</span>
                    <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-1 transition-transform">Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Ride Detail Modal */}
      {selectedRide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Ride Invoice & Details</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {selectedRide.id}</p>
              </div>
              <button onClick={() => setSelectedRide(null)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={selectedRide.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup:</span>
                <span className="font-bold text-slate-900 text-right">{selectedRide.pickupAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900 text-right">{selectedRide.dropoffAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Type:</span>
                <span className="font-bold text-blue-600">{selectedRide.rideType}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-extrabold text-sm">
                <span>Total Fare:</span>
                <span className="text-slate-900">₹{selectedRide.fare?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Receipt Info */}
            {selectedPayment && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-emerald-600" /> OpenFeign Payment Receipt</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px]">SUCCESS</span>
                </div>
                <p>Transaction ID: <span className="font-mono font-semibold">{selectedPayment.transactionId}</span></p>
                <p>Method: <b>{selectedPayment.paymentMethod}</b> • Amount Paid: <b>₹{selectedPayment.amount}</b></p>
              </div>
            )}

            <button
              onClick={() => setSelectedRide(null)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
