import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Format Path: e.g. /compliance -> Compliance, /alert-queue -> Alert Queue
  let pathName = location.pathname.replace('/', '').replace('-', ' ');
  let title = pathName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Specific overrides for clearer titles
  if (location.pathname === '/alerts') title = 'Alert Queue';
  if (location.pathname === '/risk') title = 'Risk Engine';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-30 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"></div>
      
      <div className="neomorphic-raised max-w-lg w-full p-12 z-10 flex flex-col items-center text-center rounded-[2.5rem] border-0">
        <div className="w-20 h-20 rounded-full neomorphic-inset flex items-center justify-center border border-white/20 mb-6 bg-surface-container-low/50">
          <span className="material-symbols-outlined text-[32px] text-primary">construction</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-on-surface mb-4 tracking-tight">{title || 'Feature'}</h1>
        <p className="text-on-surface-variant mb-10 text-lg font-medium">This module is currently in development and will be available in the next release.</p>
        <button 
          onClick={() => navigate(-1)}
          className="neomorphic-pill px-8 py-3 rounded-full font-display font-bold text-on-primary-fixed tracking-widest uppercase text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
