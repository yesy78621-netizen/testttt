import React from 'react';
import { Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-lg">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;