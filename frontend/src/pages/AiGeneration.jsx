import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios';

const AiGeneration = () => {
  const navigate = useNavigate();
  const { alertId } = useParams();

  // 1. Array of realistic backend procedures
  const processingSteps = [
    "Initializing Vector Search Engine...",
    "Querying ChromaDB for FATF/FinCEN regulations...",
    "Cross-referencing customer transaction ledger...",
    "Analyzing against money laundering typologies...",
    "Extracting counterparty risk profiles...",
    "Prompting Llama 3.3 for narrative generation...",
    "Structuring 5-part compliance report...",
    "Reviewer Agent validating assertions and highlighting risks...",
    "Finalizing cryptographic audit trail...",
    "Committing draft to secure vault..."
  ];

  // 2. State to track the active step
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    // 3. The Visual Progress Timer
    // Cycles to the next step every 1.5 seconds to keep the user engaged
    const progressTimer = setInterval(() => {
      if (isMounted) {
        setCurrentStepIndex((prev) => 
          prev < processingSteps.length - 1 ? prev + 1 : prev
        );
      }
    }, 1500);

    // 4. The Actual Backend API Call
    const synthesizeIntelligence = async () => {
      try {
        await apiClient.post(`/generate/${alertId}`);
        
        if (isMounted) {
          navigate(`/editor/${alertId}`);
        }
      } catch (err) {
        console.error("AI Synthesis Failed:", err);
        if (isMounted) {
          navigate('/dashboard');
        }
      }
    };

    // Give it a tiny 500ms delay before firing the API just to let the animation start
    const apiTimer = setTimeout(() => {
      synthesizeIntelligence();
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(progressTimer);
      clearTimeout(apiTimer);
    };
  }, [navigate, alertId]);

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Top Identity Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#f5f3ff]/80 backdrop-blur-xl flex items-center px-8 h-16 shadow-[0_10px_30px_-15px_rgba(45,45,58,0.05)] bg-gradient-to-b from-[#c9c7d6]/10 to-transparent pointer-events-none">
        <div className="flex items-center gap-8">
          <span className="text-xl font-black text-on-surface uppercase tracking-widest font-display">SENTINEL SAR</span>
        </div>
      </header>

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
            <div className="space-y-4 font-body text-lg font-medium min-h-[120px] flex flex-col items-center">
              
              {/* Dynamic Active Step with shimmer */}
              <div className="relative inline-block px-4 py-2 rounded-full overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 glass-shimmer animate-shimmer opacity-30"></div>
                <p className="text-primary-dim opacity-100 flex items-center justify-center gap-3 transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  {processingSteps[currentStepIndex]}
                </p>
              </div>
              
              {/* Dynamic Upcoming Steps (Faded) */}
              <div className="flex flex-col gap-3 opacity-40 mt-2 transition-all duration-300">
                {processingSteps.slice(currentStepIndex + 1, currentStepIndex + 3).map((step, idx) => (
                  <p key={idx} className="text-on-surface-variant flex items-center justify-center gap-3">
                    {step}
                  </p>
                ))}
              </div>

            </div>
            <div className="pt-8 flex justify-center gap-3">
              <div className="h-1 w-12 rounded-full bg-primary-container/40">
                <div className="h-full bg-primary rounded-full w-2/3 shadow-[0_0_8px_rgba(55,104,144,0.3)]"></div>
              </div>
              <div className="h-1 w-12 rounded-full bg-primary-container/40"></div>
              <div className="h-1 w-12 rounded-full bg-primary-container/40"></div>
            </div>
          </div>

          {/* Tactile Information Card */}
          <div className="mt-16 grid grid-cols-3 gap-6 w-full">
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
          <button onClick={() => navigate('/dashboard')} className="text-xs font-bold text-error hover:text-error-dim transition-colors uppercase tracking-widest active:scale-95">Abort Process</button>
        </div>
      </main>
    </div>
  );
};

export default AiGeneration;