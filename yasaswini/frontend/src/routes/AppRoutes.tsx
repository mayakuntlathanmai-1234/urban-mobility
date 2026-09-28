import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

// Passenger Pages
import { PassengerDashboard } from '../pages/passenger/PassengerDashboard';
import { BookRidePage } from '../pages/passenger/BookRidePage';
import { RideHistoryPage as PassengerRideHistoryPage } from '../pages/passenger/RideHistoryPage';
import { PaymentsPage } from '../pages/passenger/PaymentsPage';
import { ProfilePage as PassengerProfilePage } from '../pages/passenger/ProfilePage';

// Driver Pages
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { DriverRequestsPage } from '../pages/driver/DriverRequestsPage';
import { ActiveRidePage } from '../pages/driver/ActiveRidePage';
import { DriverEarningsPage } from '../pages/driver/DriverEarningsPage';
import { DriverProfilePage } from '../pages/driver/DriverProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  if (user.role === 'ROLE_DRIVER') return <Navigate to="/driver" replace />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/passenger" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Passenger Routes */}
          <Route
            path="/passenger"
            element={
              <RoleRoute allowedRoles={['ROLE_PASSENGER', 'ROLE_ADMIN']}>
                <PassengerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/passenger/book"
            element={
              <RoleRoute allowedRoles={['ROLE_PASSENGER', 'ROLE_ADMIN']}>
                <BookRidePage />
              </RoleRoute>
            }
          />
          <Route
            path="/passenger/history"
            element={
              <RoleRoute allowedRoles={['ROLE_PASSENGER', 'ROLE_ADMIN']}>
                <PassengerRideHistoryPage />
              </RoleRoute>
            }
          />
          <Route
            path="/passenger/payments"
            element={
              <RoleRoute allowedRoles={['ROLE_PASSENGER', 'ROLE_ADMIN']}>
                <PaymentsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/passenger/profile"
            element={
              <RoleRoute allowedRoles={['ROLE_PASSENGER', 'ROLE_ADMIN']}>
                <PassengerProfilePage />
              </RoleRoute>
            }
          />

          {/* Driver Routes */}
          <Route
            path="/driver"
            element={
              <RoleRoute allowedRoles={['ROLE_DRIVER', 'ROLE_ADMIN']}>
                <DriverDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/driver/requests"
            element={
              <RoleRoute allowedRoles={['ROLE_DRIVER', 'ROLE_ADMIN']}>
                <DriverRequestsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/driver/active-ride"
            element={
              <RoleRoute allowedRoles={['ROLE_DRIVER', 'ROLE_ADMIN']}>
                <ActiveRidePage />
              </RoleRoute>
            }
          />
          <Route
            path="/driver/earnings"
            element={
              <RoleRoute allowedRoles={['ROLE_DRIVER', 'ROLE_ADMIN']}>
                <DriverEarningsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <RoleRoute allowedRoles={['ROLE_DRIVER', 'ROLE_ADMIN']}>
                <DriverProfilePage />
              </RoleRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
