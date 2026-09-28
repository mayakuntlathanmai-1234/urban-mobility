import React from 'react';
import { Navigation, Shield, Zap, Server } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Navigation className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                URBAN <span className="text-blue-500">RIDE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time urban ride dispatch & mobility platform built on high-performance Spring Cloud microservices architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/#features" className="hover:text-white transition-colors">Passenger App</a></li>
              <li><a href="/#driver" className="hover:text-white transition-colors">Driver Console</a></li>
              <li><a href="/#architecture" className="hover:text-white transition-colors">Microservices Stack</a></li>
              <li><a href="/#safety" className="hover:text-white transition-colors">Safety Standard</a></li>
            </ul>
          </div>

          {/* Microservices Specs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">System Ports</h4>
            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-blue-400" /> Gateway: 5000</li>
              <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-400" /> Eureka: 8761</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-green-400" /> Auth: 8081</li>
              <li className="flex items-center gap-2"><Navigation className="w-3.5 h-3.5 text-cyan-400" /> Ride: 8082</li>
            </ul>
          </div>

          {/* Tech Badges */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] font-semibold text-blue-300 border border-slate-700">Spring Boot 3</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] font-semibold text-cyan-300 border border-slate-700">Spring Gateway</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] font-semibold text-teal-300 border border-slate-700">PostgreSQL</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] font-semibold text-amber-300 border border-slate-700">STOMP WebSockets</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[10px] font-semibold text-rose-300 border border-slate-700">OpenFeign</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Urban Ride Mobility Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
