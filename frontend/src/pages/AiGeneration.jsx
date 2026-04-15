import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AiGeneration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically route to the narrative editor after 5 seconds to simulate synthesis completion
    const timer = setTimeout(() => {
      navigate('/narrative');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f5f3ff]/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-[0_10px_30px_-15px_rgba(45,45,58,0.05)] bg-gradient-to-b from-[#c9c7d6]/10 to-transparent">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-on-surface uppercase tracking-widest font-display">SENTINEL SAR</span>
          <div className="hidden md:flex gap-6 items-center">
            <a className="font-display font-bold tracking-tight text-primary border-b-2 border-primary pb-1 active:scale-95 transition-transform duration-200" href="#">Dashboard</a>
            <a className="font-display font-bold tracking-tight text-on-surface/60 hover:text-on-surface transition-colors active:scale-95 duration-200" href="#">Cases</a>
            <a className="font-display font-bold tracking-tight text-on-surface/60 hover:text-on-surface transition-colors active:scale-95 duration-200" href="#">Intelligence</a>
            <a className="font-display font-bold tracking-tight text-on-surface/60 hover:text-on-surface transition-colors active:scale-95 duration-200" href="#">Audit</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors active:scale-95">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors active:scale-95">
            <span className="material-symbols-outlined text-primary">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
            <img alt="Investigator Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDoz9CWKj_L2JEID2tjXlKfocxGFEgXTeTvRsOfTlkX372XIWAD2oPaAgzyyYaNtvoOoOGoImeshTDTraiup8ntwaDoyL4PhsfIbJOn_OYZMEOplrHITCmqqV7aMgLVrJujvGs9lVfFrWOEe0VFpUCHgJPqqoXykopoOI2eiT5-0P-isGIWSC8ZwfYfFXGIFzp4zObs5SbzwO3oumMXetsafMLrbl_vF40EqWEx4h6xO-gQR50DA7QxptMH-JmTEqazR_PvabWtQwY"/>
          </div>
        </div>
      </nav>

      <Sidebar />

      {/* Main Content Canvas */}
      <main className="lg:pl-[220px] pt-16 min-h-screen relative overflow-hidden flex flex-1 items-center justify-center w-full">
        {/* Architectural Background Elements */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <img alt="background architecture" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnq4J4qJ_WpiZnCfs2l23ztL4rnA2Yx5PaUY09_fddObvZKn9JlOAd-fEQJ3lEs4Nntc9d2XO6swfgkOCA_FytCd_VCk5hazOz7jPO02pSkhnnMwNVSBhhpRvjw-zSXCqJXT87Ccq4O6W4Ulhux0XJDofarNJwFpNsjhZSZCxkNOIwDXoe--LctTuy7FaE4MMXhTgzH1_QxxdlYZ7HvfcIlfY7tMBd2iodkZ812rFp3DvOpsyhxvPqBphBuX5lC_Guk_anMX2Y0XE9"/>
          <div className="absolute inset-0 bg-gradient-to-tr from-surface via-surface/60 to-primary-container/20"></div>
        </div>

        {/* Central Generation Component */}
        <section className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6">
          {/* Neomorphic Loading Indicator */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-16">
            {/* Outer Track (Concave) */}
            <div className="absolute inset-0 rounded-full neomorphic-inset bg-surface-container-low border border-outline-variant/10"></div>
            
            {/* Inner Liquid Glow */}
            <div className="absolute w-48 h-48 rounded-full bg-primary-container/30 backdrop-blur-3xl blur-xl animate-pulse"></div>
            
            {/* The Ripple Ring */}
            <div className="relative w-40 h-40 rounded-full bg-surface-container-lowest shadow-lg flex items-center justify-center border border-white/40">
              <div className="absolute inset-2 rounded-full border-[1.5px] border-primary/20 animate-[spin_4s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(55,104,144,0.5)]"></div>
              </div>
              <span className="material-symbols-outlined text-5xl text-primary animate-pulse w-fit h-fit" style={{ fontVariationSettings: "'wght' 200" }}>network_intelligence</span>
            </div>
          </div>

          {/* AI Reasoning Text */}
          <div className="text-center space-y-6">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
              Synthesizing Investigation Intelligence
            </h1>
            <div className="space-y-4 font-body text-lg font-medium">
              {/* Dynamic reasoning steps with shimmer */}
              <div className="relative inline-block px-4 py-2 rounded-full overflow-hidden">
                <div className="absolute inset-0 glass-shimmer animate-shimmer opacity-30"></div>
                <p className="text-primary-dim opacity-100 flex items-center justify-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Analyzing against money laundering typologies...
                </p>
              </div>
              <div className="flex flex-col gap-3 opacity-40">
                <p className="text-on-surface-variant flex items-center justify-center gap-3">
                  Cross-referencing global watchlists...
                </p>
                <p className="text-on-surface-variant flex items-center justify-center gap-3">
                  Synthesizing transaction patterns...
                </p>
              </div>
            </div>
            <div className="pt-12 flex justify-center gap-3">
              <div className="h-1 w-12 rounded-full bg-primary-container/40">
                <div className="h-full bg-primary rounded-full w-2/3 shadow-[0_0_8px_rgba(55,104,144,0.3)]"></div>
              </div>
              <div className="h-1 w-12 rounded-full bg-primary-container/40"></div>
              <div className="h-1 w-12 rounded-full bg-primary-container/40"></div>
            </div>
          </div>

          {/* Tactile Information Card */}
          <div className="mt-20 grid grid-cols-3 gap-6 w-full">
            <div className="bg-surface-container-low/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Data Points</p>
              <p className="text-xl font-display font-extrabold text-on-surface">14,209</p>
            </div>
            <div className="bg-surface-container-low/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Network Depth</p>
              <p className="text-xl font-display font-extrabold text-on-surface">4 Levels</p>
            </div>
            <div className="bg-surface-container-low/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Entity Match</p>
              <p className="text-xl font-display font-extrabold text-on-surface">High</p>
            </div>
          </div>
        </section>

        {/* Floating Status Pill */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-container-lowest/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/30 shadow-xl z-20">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Secured by Sentinel-Protocol 4.0</span>
          <div className="h-4 w-px bg-outline-variant/30"></div>
          <button onClick={() => navigate('/investigation')} className="text-xs font-bold text-error hover:text-error-dim transition-colors uppercase tracking-widest active:scale-95">Abort Process</button>
        </div>
      </main>
    </div>
  );
};

export default AiGeneration;
