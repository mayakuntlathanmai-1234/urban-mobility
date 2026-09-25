import React from 'react';
import { CheckCircle2, Circle, Clock, Car, Navigation, Flag, AlertTriangle } from 'lucide-react';
import { RideStatus } from '../../types';

interface RideStatusStepperProps {
  status: RideStatus;
  cancelReason?: string;
}

export const RideStatusStepper: React.FC<RideStatusStepperProps> = ({ status, cancelReason }) => {
  const steps = [
    { key: 'REQUESTED', label: 'Requested', icon: Clock },
    { key: 'DRIVER_ASSIGNED', label: 'Assigned', icon: Car },
    { key: 'DRIVER_ARRIVED', label: 'Arrived', icon: Navigation },
    { key: 'RIDE_STARTED', label: 'On Trip', icon: Navigation },
    { key: 'COMPLETED', label: 'Completed', icon: Flag }
  ];

  const getActiveStepIndex = (currentStatus: RideStatus) => {
    switch (currentStatus) {
      case 'REQUESTED':
      case 'SEARCHING_DRIVER':
        return 0;
      case 'DRIVER_ASSIGNED':
      case 'DRIVER_ARRIVING':
        return 1;
      case 'DRIVER_ARRIVED':
        return 2;
      case 'RIDE_STARTED':
        return 3;
      case 'COMPLETED':
      case 'PAYMENT_PENDING':
        return 4;
      default:
        return -1;
    }
  };

  const activeIndex = getActiveStepIndex(status);
  const isCancelled = status.includes('CANCELLED') || status === 'NO_DRIVER_FOUND';

  if (isCancelled) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center space-y-1">
        <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Ride Cancelled</span>
        </div>
        <p className="text-xs text-rose-300 font-mono">{cancelReason || 'Trip request was cancelled'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Ride Progress</span>
        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1 text-center">
        {steps.map((step, idx) => {
          const isDone = activeIndex > idx;
          const isCurrent = activeIndex === idx;

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 animate-pulse'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium leading-tight ${
                  isCurrent ? 'text-emerald-400 font-bold' : isDone ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
