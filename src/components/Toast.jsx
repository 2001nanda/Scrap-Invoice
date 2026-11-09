import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-950/20'
                : isError
                ? 'bg-rose-900/90 text-white border-rose-700/50 shadow-rose-950/20'
                : isWarning
                ? 'bg-amber-900/90 text-white border-amber-700/50 shadow-amber-950/20'
                : 'bg-slate-900/90 text-white border-slate-700/50 shadow-slate-950/20'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-300" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-300" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-300" />}
            </div>

            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.title && <div className="font-semibold text-white/95">{toast.title}</div>}
              <div className="text-white/85 text-xs mt-0.5">{toast.message}</div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white shrink-0 p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
