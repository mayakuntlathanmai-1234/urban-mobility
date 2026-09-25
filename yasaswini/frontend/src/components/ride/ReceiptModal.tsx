import React from 'react';
import { CheckCircle2, Receipt, ShieldCheck, Download, ArrowRight } from 'lucide-react';
import { Ride } from '../../types';

interface ReceiptModalProps {
  ride: Ride;
  onClose: () => void;
  onRateRide: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ ride, onClose, onRateRide }) => {
  const fare = ride.finalFare || ride.estimatedFare;

  return (
    <div className="fixed inset-0 z-[2000] bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Receipt Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">Ride Completed!</h3>
          <p className="text-xs text-gray-400 font-mono">Receipt #{ride.rideNumber}</p>
        </div>

        {/* Fare Summary Breakdown */}
        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-800">
            <span>Base Fare</span>
            <span className="text-gray-200 font-bold">₹{ride.baseFare}</span>
          </div>
          <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-800">
            <span>Distance ({ride.distanceKm} km x ₹{ride.perKmFare}/km)</span>
            <span className="text-gray-200 font-bold">₹{Math.round(ride.distanceKm * ride.perKmFare)}</span>
          </div>
          <div className="flex justify-between text-gray-400 pb-2 border-b border-gray-800">
            <span>Taxes & Service Fee</span>
            <span className="text-gray-200 font-bold">₹0.00</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-white font-extrabold">Total Amount Paid</span>
            <span className="text-lg font-black text-emerald-400">₹{fare}</span>
          </div>
        </div>

        {/* Trip Meta */}
        <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-[11px] space-y-1 text-gray-400 font-mono">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="text-emerald-400 font-bold">{ride.paymentMethod || 'CASH'}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="text-emerald-400 font-bold">SUCCESS ✓</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onRateRide}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>Rate Your Ride Experience</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white font-bold text-xs border border-gray-700 transition-all"
          >
            Close & Done
          </button>
        </div>
      </div>
    </div>
  );
};
