import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="mt-4 text-indigo-900 font-medium animate-pulse">Chargement en cours...</p>
    </div>
  );
};

export default Loading;