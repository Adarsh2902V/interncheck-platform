'use client';

import { Toaster as SonnerToaster } from 'sonner';

export default function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white text-slate-900 border border-slate-200 shadow-xl rounded-xl p-4 font-sans',
          description: 'text-slate-600 text-xs',
          actionButton: 'bg-indigo-600 text-white rounded-lg text-xs font-semibold px-3 py-1.5',
          cancelButton: 'bg-slate-100 text-slate-600 rounded-lg text-xs px-3 py-1.5',
        },
      }}
    />
  );
}
