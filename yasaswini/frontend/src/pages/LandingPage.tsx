import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { MapView } from '../components/map/MapView';
import { 
  Navigation, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Car, 
  Smartphone,
  Server
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                Real-Time Urban Dispatch & Concurrency Engine
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Your city. <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Your ride. Your way.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Book rides, connect with drivers, and move through the city with a real-time mobility platform powered by Spring Cloud microservices.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/passenger/book"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Navigation className="w-4 h-4" />
                  Book a Ride
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  to="/register?role=driver"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200/80 shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <Car className="w-4 h-4 text-cyan-600" />
                  Drive With Us
                </Link>
              </div>

              {/* Stats badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-xl font-extrabold text-slate-900">99.9%</p>
                  <p className="text-xs text-slate-500 font-medium">Uptime Guarantee</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-blue-600">&lt; 100ms</p>
                  <p className="text-xs text-slate-500 font-medium">STOMP Latency</p>
                </div>
                <div>
                  <p className="text-xl font-extrabold text-teal-600">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Database Isolation</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual / Leaflet Map Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 relative"
            >
              <div className="relative glass-card p-3 rounded-3xl shadow-2xl border border-slate-200/80">
                <MapView
                  pickupLat={12.9716}
                  pickupLng={77.5946}
                  dropoffLat={12.9352}
                  dropoffLng={77.6245}
                  driverLat={12.9600}
                  driverLng={77.6000}
                  pickupAddress="MG Road Metro Station"
                  dropoffAddress="Koramangala 5th Block"
                  className="h-[380px] sm:h-[440px] rounded-2xl"
                />

                {/* Floating Ride Info Badge */}
                <div className="absolute top-6 right-6 glass-card p-3.5 rounded-2xl shadow-lg border border-white/60 flex items-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Premium Sedan Available</p>
                    <p className="text-[10px] font-semibold text-emerald-600">ETA: 3 mins • ₹250.00</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 glass-card p-3 rounded-2xl shadow-lg border border-white/60 flex items-center gap-2.5 z-10">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-800">5 Drivers Online Nearby</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How Urban Ride Works */}
      <section id="features" className="py-16 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Simplified Mobility</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How Urban Ride Works</p>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Designed for speed, safety, and seamless urban transit in just 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Request Your Destination</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter pickup and dropoff points. Compare instant estimates for Economy, Sedan, Auto, and SUV rides.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Atomic Driver Match</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend concurrency locking matches your request with the closest driver instantly without double-booking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl mb-5 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Transit & Receipts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track your trip live via STOMP WebSockets. Automated digital payment receipt generated via OpenFeign upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section id="architecture" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                <Server className="w-3.5 h-3.5" />
                Enterprise Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Powered by Spring Cloud Microservices
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Urban Ride is built on 6 decoupled domain services with 100% strict database-per-service data isolation, dynamic API Gateway routing, and real-time STOMP messaging.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Atomic Concurrency Lock Query</h4>
                    <p className="text-[11px] text-slate-400">Prevents race conditions when 10+ drivers accept the same ride simultaneously.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Spring Cloud Gateway (Port 5000)</h4>
                    <p className="text-[11px] text-slate-400">Unified entry point with dynamic Eureka service discovery resolution.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Dedicated PostgreSQL Databases</h4>
                    <p className="text-[11px] text-slate-400">urban_auth_db, urban_ride_db, urban_driver_db, urban_payment_db.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-800/90 p-6 rounded-3xl border border-slate-700 font-mono text-xs text-slate-300 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-slate-400 font-bold">System Status Dashboard</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">ALL UP (5/5)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span>EUREKA-SERVER</span><span className="text-yellow-400">Port 8761</span></div>
                <div className="flex justify-between"><span>API-GATEWAY</span><span className="text-blue-400">Port 5000</span></div>
                <div className="flex justify-between"><span>AUTH-SERVICE</span><span className="text-green-400">Port 8081</span></div>
                <div className="flex justify-between"><span>RIDE-SERVICE</span><span className="text-cyan-400">Port 8082</span></div>
                <div className="flex justify-between"><span>DRIVER-SERVICE</span><span className="text-indigo-400">Port 8083</span></div>
                <div className="flex justify-between"><span>PAYMENT-SERVICE</span><span className="text-teal-400">Port 8084</span></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready to experience smarter urban transit?</h2>
          <p className="text-sm opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of passengers and drivers using Urban Ride every day.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-7 py-3 rounded-2xl bg-white text-blue-600 font-bold text-sm shadow-lg hover:scale-105 transition-transform">
              Create Account
            </Link>
            <Link to="/login" className="px-7 py-3 rounded-2xl bg-blue-700 text-white font-bold text-sm border border-white/20 hover:bg-blue-800 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
