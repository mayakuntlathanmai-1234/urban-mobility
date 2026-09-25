import React from 'react';
import { Users, Clock, Zap } from 'lucide-react';
import { FareEstimate, RideType } from '../../types';

interface RideTypeCardProps {
  estimate: FareEstimate;
  isSelected: boolean;
  onSelect: (type: RideType) => void;
}

export const RideTypeCard: React.FC<RideTypeCardProps> = ({ estimate, isSelected, onSelect }) => {
  const getVehicleMeta = (type: RideType) => {
    switch (type) {
      case 'BIKE':
        return { emoji: '🛵', name: 'Bike', badge: 'Cheapest' };
      case 'AUTO':
        return { emoji: '🛺', name: 'Auto', badge: 'Quick City' };
      case 'SEDAN':
        return { emoji: '🚗', name: 'Sedan', badge: 'Popular' };
      case 'SUV':
        return { emoji: '🚙', name: 'SUV', badge: 'Spacious' };
    }
  };

  const meta = getVehicleMeta(estimate.vehicleType);

  return (
    <button
      type="button"
      onClick={() => onSelect(estimate.vehicleType)}
      className={`w-full p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
        isSelected
          ? 'bg-gray-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10'
          : 'bg-gray-900/60 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3.5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
          isSelected ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-gray-800 border-gray-700'
        }`}>
          {meta.emoji}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white text-sm">{meta.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-gray-800 text-gray-300 border border-gray-700">
              {meta.badge}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-gray-400 mt-0.5">
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1 text-gray-500" />
              Up to {estimate.capacity}
            </span>
            <span>&bull;</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1 text-gray-500" />
              {estimate.estimatedTimeMin} mins
            </span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-base font-extrabold text-emerald-400 font-mono">
          ₹{estimate.estimatedFare}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          ₹{estimate.baseFare} + ₹{estimate.perKmFare}/km
        </div>
      </div>
    </button>
  );
};
