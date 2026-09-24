import React, { useState, useEffect } from 'react';
import { Users, Car, DollarSign, Activity, Settings, Search, Edit2, Check, ShieldCheck, Database, Server } from 'lucide-react';
import { fetchApi } from '../services/api';
import { MapView } from '../components/map/MapView';
import { FareConfig, Driver, User } from '../types';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 14,
    totalDrivers: 4,
    onlineDrivers: 4,
    activeRides: 1,
    completedRides: 8,
    cancelledRides: 0,
    totalRevenue: 2480
  });

  const [fareConfigs, setFareConfigs] = useState<FareConfig[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [editingType, setEditingType] = useState<string | null>(null);

  const [editBaseFare, setEditBaseFare] = useState<number>(60);
  const [editPerKmFare, setEditPerKmFare] = useState<number>(18);
  const [savingFare, setSavingFare] = useState<boolean>(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const resMetrics = await fetchApi<{ metrics: any }>('/admin/metrics');
      setMetrics(resMetrics.metrics);

      const resConfigs = await fetchApi<{ configs: FareConfig[] }>('/admin/fare-configs');
      setFareConfigs(resConfigs.configs);

      const resUsers = await fetchApi<{ users: User[] }>('/admin/users');
      setUsers(resUsers.users);

      const resDrivers = await fetchApi<{ drivers: Driver[] }>('/drivers/nearby');
      setDrivers(resDrivers.drivers);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  const handleEditConfig = (config: FareConfig) => {
    setEditingType(config.vehicleType);
    setEditBaseFare(config.baseFare);
    setEditPerKmFare(config.perKmFare);
  };

  const handleSaveConfig = async (vehicleType: string) => {
    setSavingFare(true);
    try {
      await fetchApi('/admin/fare-configs', {
        method: 'POST',
        body: JSON.stringify({
          vehicleType,
          baseFare: editBaseFare,
          perKmFare: editPerKmFare
        })
      });
      setEditingType(null);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update fare config:', err);
    } finally {
      setSavingFare(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">System Admin Governance Control Room</h2>
            <p className="text-xs text-gray-400">Configure fare rules, monitor active fleet, and manage user accounts.</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-750 text-xs font-bold text-gray-300 border border-gray-700"
        >
          Refresh System Data
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Total Revenue</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">₹{metrics.totalRevenue}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Active Rides</span>
          <span className="text-2xl font-black text-blue-400 font-mono">{metrics.activeRides}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Online Drivers</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{metrics.onlineDrivers} / {metrics.totalDrivers}</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[11px] font-mono text-gray-400 block">Total Users</span>
          <span className="text-2xl font-black text-purple-400 font-mono">{metrics.totalUsers}</span>
        </div>
      </div>

      {/* Configurable Fare Management Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center">
            <Settings className="w-4 h-4 text-emerald-400 mr-2" /> Configurable Fare Pricing Rules
          </h3>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-950 px-2.5 py-1 rounded border border-gray-800">
            Base Fare + Distance Charge
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fareConfigs.map((fc) => {
            const isEditing = editingType === fc.vehicleType;

            return (
              <div key={fc.vehicleType} className="bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">{fc.vehicleType}</span>
                  {!isEditing ? (
                    <button
                      onClick={() => handleEditConfig(fc)}
                      className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveConfig(fc.vehicleType)}
                      disabled={savingFare}
                      className="p-1 rounded bg-emerald-500 text-gray-950 font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-gray-400">
                      <span>Base Fare:</span>
                      <span className="text-emerald-400 font-bold">₹{fc.baseFare}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Per KM:</span>
                      <span className="text-emerald-400 font-bold">₹{fc.perKmFare}/km</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Capacity:</span>
                      <span className="text-gray-200">{fc.capacity} seats</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 block">Base Fare (₹)</label>
                      <input
                        type="number"
                        value={editBaseFare}
                        onChange={(e) => setEditBaseFare(parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block">Per KM Fare (₹)</label>
                      <input
                        type="number"
                        value={editPerKmFare}
                        onChange={(e) => setEditPerKmFare(parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Management Directory */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <h3 className="text-sm font-extrabold text-white flex items-center">
            <Users className="w-4 h-4 text-purple-400 mr-2" /> User & Driver Directory ({filteredUsers.length})
          </h3>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 w-44"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="PASSENGER">Passengers</option>
              <option value="DRIVER">Drivers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-mono">
            <thead className="bg-gray-950 text-gray-400 uppercase text-[10px] border-b border-gray-800">
              <tr>
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Driver Vehicle Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-800/40">
                  <td className="p-3 font-bold text-white">{u.name}</td>
                  <td className="p-3 text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                      u.role === 'DRIVER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{u.phone || 'N/A'}</td>
                  <td className="p-3 text-gray-400">
                    {u.driver?.vehicle ? `${u.driver.vehicle.make} ${u.driver.vehicle.model} (${u.driver.vehicle.plateNumber})` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Active Map Overview */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center">
          <Activity className="w-4 h-4 text-emerald-400 mr-2" /> Live Fleet Spatial Distribution
        </h3>
        <MapView drivers={drivers} height="400px" />
      </div>
    </div>
  );
};
