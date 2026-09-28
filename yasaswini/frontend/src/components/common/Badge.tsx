import React from 'react';
import { RideStatus, PaymentStatus } from '../../types';

interface BadgeProps {
  status: RideStatus | PaymentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  switch (status) {
    case 'WAITING_FOR_DRIVER':
    case 'SEARCHING_DRIVER':
      styleClasses = 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse';
      label = 'Searching Driver';
      break;
    case 'DRIVER_ASSIGNED':
      styleClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      label = 'Driver Assigned';
      break;
    case 'DRIVER_ARRIVED':
      styleClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      label = 'Driver Arrived';
      break;
    case 'RIDE_STARTED':
      styleClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      label = 'On Trip';
      break;
    case 'RIDE_COMPLETED':
    case 'SUCCESS':
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      label = status === 'SUCCESS' ? 'Paid' : 'Completed';
      break;
    case 'CANCELLED':
    case 'FAILED':
      styleClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      label = 'Cancelled';
      break;
    case 'PENDING':
      styleClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'Pending';
      break;
    default:
      styleClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase ${styleClasses} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </span>
  );
};
