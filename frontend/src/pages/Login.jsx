import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('Analyst');

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface overflow-hidden relative w-full">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-container/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-tertiary-container/15 rounded-full blur-[100px]"></div>
      
      <main className="relative z-10 w-full max-w-lg">
        {/* Main Authentication Card (Liquid Glass) */}
        <div className="liquid-glass ambient-glow rounded-xl p-10 md:p-14 flex flex-col items-center">
          {/* Brand Anchor: SENTINEL SAR */}
          <header className="mb-12 text-center">
            <h1 className="font-display font-black text-3xl tracking-tighter text-on-surface mb-2">
              SENTINEL SAR
            </h1>
            <p className="font-body text-on-surface-variant text-sm uppercase tracking-[0.2em]">
              Intelligence Division
            </p>
          </header>
          
          <form className="w-full space-y-8" onSubmit={(e) => { 
            e.preventDefault(); 
            navigate('/dashboard', { state: { role: activeRole } }); 
          }}>
            {/* Employee ID Field */}
            <div className="space-y-3">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60 ml-1">
                Employee ID
              </label>
              <div className="neomorphic-recessed rounded-xl px-6 py-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">badge</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-on-surface-variant/40 outline-none" 
                  placeholder="Enter ID number" 
                  type="text"
                />
              </div>
            </div>
            
            {/* Passkey Field */}
            <div className="space-y-3">
              <label className="font-body text-xs font-semibold uppercase tracking-widest text-on-surface/60 ml-1">
                Passkey
              </label>
              <div className="neomorphic-recessed rounded-xl px-6 py-4 flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant text-lg">lock_open</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full font-body text-on-surface placeholder:text-on-surface-variant/40 outline-none" 
                  placeholder="••••••••" 
                  type="password"
                />
              </div>
            </div>
            
            {/* Primary Action */}
            <div className="pt-4">
              <button 
                type="submit"
                className="neomorphic-pill w-full py-5 rounded-xl font-display font-bold text-on-primary-fixed text-lg flex items-center justify-center gap-2"
              >
                Authenticate
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              </button>
            </div>
          </form>
          
          {/* Role Selector */}
          <div className="mt-12 w-full">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <span className="h-[1px] w-8 bg-outline-variant/30"></span>
              <span className="font-body text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">Select Authority Role</span>
              <span className="h-[1px] w-8 bg-outline-variant/30"></span>
            </div>
            <div className="flex justify-between items-center bg-surface-container-low/50 p-1.5 rounded-full backdrop-blur-sm">
              <button 
                onClick={() => setActiveRole('Analyst')}
                className={`flex-1 py-2 px-4 rounded-full font-body text-xs font-semibold transition-all ${activeRole === 'Analyst' ? 'text-on-surface toggle-active' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Analyst
              </button>
              <button 
                onClick={() => setActiveRole('Approver')}
                className={`flex-1 py-2 px-4 rounded-full font-body text-xs font-semibold transition-all ${activeRole === 'Approver' ? 'text-on-surface toggle-active' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Approver
              </button>
              <button 
                onClick={() => setActiveRole('Admin')}
                className={`flex-1 py-2 px-4 rounded-full font-body text-xs font-semibold transition-all ${activeRole === 'Admin' ? 'text-on-surface toggle-active' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
        
        {/* Security Footer */}
        <footer className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5 opacity-50">
              <span className="material-symbols-outlined text-[14px]">encrypted</span>
              <span className="font-body text-[10px] uppercase tracking-tighter text-on-surface">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-50">
              <span className="material-symbols-outlined text-[14px]">policy</span>
              <span className="font-body text-[10px] uppercase tracking-tighter text-on-surface">Tier 1 Compliance</span>
            </div>
          </div>
          <p className="font-body text-[10px] text-on-surface-variant/40 uppercase tracking-widest mt-2">
            © 2024 SENTINEL SAR Intelligence. All Rights Reserved.
          </p>
        </footer>
      </main>
      
      {/* Side Image Texture (Asymmetric Detail) */}
      <div className="fixed top-1/2 right-[-10rem] -translate-y-1/2 w-[30rem] h-[30rem] opacity-20 pointer-events-none">
        <img 
          className="w-full h-full object-contain filter grayscale invert brightness-110" 
          alt="abstract tech circuit pattern" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyuQ87ADXUe36H8TPhUK7gOT0kKAXTmjkLPNl10kgJcKVNclrg9ZsdDw7ZnHyNyq4Nsxw4KGePWYgAcAaTQs_r0kC7X2e4z-wtmdfTuNsUYdeEWRII9R6wPSd-qvFdMySEfj539gWyy12RqcawizokWXTwaEXCxcdtEtIoB-n0dbkXOc1iDOveFZCp91nnG2e4qardO4TnZ9HvfNYW29wm5tIWDK1hkpGVEBvd0WtF3Ri2GXvq8lutL59xgLOv8AVJeeD86KKMX2WT"
        />
      </div>
    </div>
  );
};

export default Login;
