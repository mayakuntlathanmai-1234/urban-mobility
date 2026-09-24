import React from 'react';
import { Phone, MessageSquare, Star, Shield, Car, XCircle } from 'lucide-react';
import { Driver, RideStatus } from '../../types';

interface DriverInfoCardProps {
  driver: Driver;
  etaMins?: number;
  status: RideStatus;
  onCancelRide: () => void;
}

export const DriverInfoCard: React.FC<DriverInfoCardProps> = ({ driver, etaMins = 4, status, onCancelRide }) => {
  const driverName = driver.user?.name || 'Rahul Kumar';
  const driverPhone = driver.user?.phone || '+91 98765 43210';
  const vehicle = driver.vehicle || { make: 'Hyundai', model: 'i20', color: 'White', plateNumber: 'AP 39 AB 1234' };

  return (
    <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Driver Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-lg">
              {driverName.charAt(0)}
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-white text-base leading-tight">{driverName}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                {driver.rating || 4.8}
              </span>
              <span>&bull;</span>
              <span className="text-gray-300 font-mono">{driver.totalRides || 12} Trips</span>
            </div>
          </div>
        </div>

        <div className="text-right bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] text-gray-400 block font-mono">STATUS</span>
          <span className="text-xs font-extrabold text-emerald-400 font-mono">
            {status === 'DRIVER_ARRIVED' ? 'Arrived!' : `Arriving ~${etaMins}m`}
          </span>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-emerald-400" />
          <span className="text-gray-200 font-bold">{vehicle.make} {vehicle.model}</span>
          <span className="text-gray-400">({vehicle.color})</span>
        </div>
        <div className="bg-gray-900 px-2.5 py-1 rounded border border-gray-700 font-black text-white text-xs tracking-wider">
          {vehicle.plateNumber}
        </div>
      </div>

      {/* Communication & Action Buttons */}
      <div className="flex items-center space-x-2 pt-1">
        <a
          href={`tel:${driverPhone}`}
          className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-white text-xs font-bold flex items-center justify-center space-x-1.5 border border-gray-700 transition-all shadow-md"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Call Driver</span>
        </a>

        <button
          type="button"
          onClick={() => alert(`Messaging ${driverName} at ${driverPhone}`)}
          className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-white text-xs font-bold flex items-center justify-center space-x-1.5 border border-gray-700 transition-all shadow-md"
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          <span>Message</span>
        </button>

        <button
          type="button"
          onClick={onCancelRide}
          className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center justify-center border border-rose-500/30 transition-all"
          title="Cancel Ride"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
