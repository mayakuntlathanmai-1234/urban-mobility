import React, { createContext, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 glass-card ${
                toast.type === 'success'
                  ? 'border-emerald-200 text-emerald-950'
                  : toast.type === 'error'
                  ? 'border-rose-200 text-rose-950'
                  : toast.type === 'warning'
                  ? 'border-amber-200 text-amber-950'
                  : 'border-blue-200 text-blue-950'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-[11px] font-medium opacity-80 mt-1 leading-snug">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
