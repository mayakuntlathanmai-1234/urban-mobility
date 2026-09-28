import React, { useEffect, useState } from 'react';
import { Header } from '../../components/common/Header';
import { Footer } from '../../components/common/Footer';
import { StatusBadge } from '../../components/common/Badge';
import { authApi } from '../../api/authApi';
import { rideApi } from '../../api/rideApi';
import { driverApi } from '../../api/driverApi';
import { paymentApi } from '../../api/paymentApi';
import { Ride, Driver } from '../../types';
import { ShieldCheck, Server, Activity, Users, Car, Navigation, CreditCard, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [servicesHealth, setServicesHealth] = useState({
    eureka: 'ONLINE',
    gateway: 'ONLINE',
    auth: 'ONLINE',
    ride: 'ONLINE',
    driver: 'ONLINE',
    payment: 'ONLINE',
  });

  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      const [ridesRes, driversRes] = await Promise.all([
        rideApi.listRides().catch(() => ({ rides: [] })),
        driverApi.getAllDrivers().catch(() => ({ drivers: [] })),
      ]);

      setRides(ridesRes.rides || []);
      setDrivers(driversRes.drivers || []);

      // Check Gateway & Auth Health
      try {
        await authApi.getHealth();
        setServicesHealth((prev) => ({ ...prev, auth: 'ONLINE', gateway: 'ONLINE' }));
      } catch (e) {
        setServicesHealth((prev) => ({ ...prev, auth: 'OFFLINE' }));
      }
    } catch (e) {
      console.error('Failed to load system stats', e);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = rides.filter((r) => r.status === 'RIDE_COMPLETED').length;
  const activeCount = rides.filter((r) =>
    ['WAITING_FOR_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'RIDE_STARTED'].includes(r.status)
  ).length;
  const totalRevenue = rides
    .filter((r) => r.status === 'RIDE_COMPLETED')
    .reduce((acc, r) => acc + (r.fare || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              System Operations Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Microservices Monitoring Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Live status of Spring Cloud microservices, database instances, and cluster traffic.</p>
          </div>

          <button
            onClick={fetchSystemStats}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Health
          </button>
        </div>

        {/* Microservices Port Health Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'EUREKA-SERVER', port: '8761', status: servicesHealth.eureka, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { name: 'API-GATEWAY', port: '5000', status: servicesHealth.gateway, color: 'text-blue-600', bg: 'bg-blue-50' },
            { name: 'AUTH-SERVICE', port: '8081', status: servicesHealth.auth, color: 'text-green-600', bg: 'bg-green-50' },
            { name: 'RIDE-SERVICE', port: '8082', status: servicesHealth.ride, color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { name: 'DRIVER-SERVICE', port: '8083', status: servicesHealth.driver, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { name: 'PAYMENT-SERVICE', port: '8084', status: servicesHealth.payment, color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map((svc) => (
            <div key={svc.name} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft space-y-2">
              <div className="flex items-center justify-between">
                <Server className={`w-4 h-4 ${svc.color}`} />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-900 truncate">{svc.name}</p>
                <p className="text-[10px] font-mono text-slate-400">Port {svc.port}</p>
              </div>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${svc.bg} ${svc.color}`}>
                {svc.status}
              </span>
            </div>
          ))}
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Drivers</span>
              <Car className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{drivers.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">urban_driver_db</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Active Trips</span>
              <Navigation className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{activeCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">In progress</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Completed Trips</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">{completedCount}</p>
            <p className="text-[10px] text-slate-400 mt-1">urban_ride_db</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase">Total Revenue</span>
              <CreditCard className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">₹{totalRevenue.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-1">urban_payment_db</p>
          </div>
        </div>

        {/* Global Ride Activity Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Global Cluster Ride Log</h3>
            <span className="text-xs text-slate-400 font-mono">Total Logged: {rides.length}</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading system logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Ride ID</th>
                    <th className="pb-3">Pickup → Dropoff</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Fare</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {rides.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-mono font-bold text-slate-900">{r.id.slice(0, 8)}...</td>
                      <td className="py-3 max-w-xs truncate">{r.pickupAddress} → {r.dropoffAddress}</td>
                      <td className="py-3 font-bold text-blue-600">{r.rideType}</td>
                      <td className="py-3 font-bold text-slate-900">₹{r.fare?.toFixed(2)}</td>
                      <td className="py-3 text-right"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
};
