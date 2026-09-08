import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
            case 'info':
            default:
              return <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 bg-white';
            case 'warning':
              return 'border-amber-200 bg-white';
            case 'error':
              return 'border-rose-200 bg-white';
            case 'info':
            default:
              return 'border-blue-200 bg-white';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-lg ${getBorderColor()} flex items-start gap-2.5 transition-all animate-in slide-in-from-bottom-5`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
