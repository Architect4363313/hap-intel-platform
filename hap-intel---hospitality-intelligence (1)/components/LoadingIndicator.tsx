import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-white">
      <div className="relative size-24 mb-8">
        <div className="absolute inset-0 border-t-2 border-white/20 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-2 border-white/40 rounded-full animate-spin [animation-duration:1.5s]"></div>
        <div className="absolute inset-4 border-l-2 border-white/60 rounded-full animate-spin [animation-duration:2s]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl animate-pulse">public</span>
        </div>
      </div>
      
      <div className="text-center space-y-2 font-mono">
        <div className="text-xs tracking-[0.3em] uppercase animate-pulse">Acquiring Target Data</div>
        <div className="text-[10px] text-white/50">Establishing secure connection to OSINT sources...</div>
      </div>

      <div className="mt-8 w-64 h-0.5 bg-white/10 overflow-hidden">
        <div className="h-full bg-white w-1/3 animate-[translateX_200%]"></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
