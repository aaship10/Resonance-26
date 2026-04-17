import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 1. Added useParams
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios'; // 2. Added our secure FastAPI client

const InvestigationHub = () => {
  const navigate = useNavigate();
  const { alertId } = useParams(); // 3. Grab the active Case ID from the URL

  // 4. State to hold the live data from your database
  const [alertData, setAlertData] = useState(null);

  // 5. Fetch the alert details on load
// src/pages/InvestigationHub.jsx

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await apiClient.get(`/alerts/${alertId}`);
        setAlertData(response.data);
      } catch (err) {
        console.error("Failed to load case data:", err);
      }
    };

    // Logic Gate: If it's a manual filing, don't ping the database for an alert ID
    if (alertId && alertId !== 'manual') {
      fetchCaseDetails();
    } else if (alertId === 'manual') {
      // Set a blank "Manual Template" so the UI doesn't crash or stay in a loading state
      setAlertData({
        customer_id: "TBD",
        case_id: "MANUAL-INTAKE-NEW",
        risk_score: 0,
        alert_type: "Human-Initiated Tip",
        created_at: new Date().toISOString()
      });
    }
  }, [alertId]);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f3eff6]/80 backdrop-blur-xl border-b border-[#cbbec9]/10 flex justify-between items-center w-full px-6 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-on-surface tracking-tighter font-display uppercase">SENTINEL SAR</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30">
            <img alt="Investigator Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqduRW52w2NbAOxj4IkCEeElhvq1WlI1JSHyMN-FnO2uuzTlssOTEFEPhRhMQZBs8zc7xXNYdmUU7dXXn6LKjPvAUhgxvmrCpXA1X4QqEhJfbHID2gSewn-CJf8MuOfVN9A2vJZMTq8lzie_YrdiOe5cW144npx7ylKuE8DcT54oBvnWucUF6hgAyzFWDKpPmv6NWrtxBPkU1my87Go5L5RgyZXC-EM57MhwS5bOXdi6y8FIphncaFXhA4AEBt_8X6d7wZVUIRnWgJ"/>
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Canvas */}
      <main className="lg:pl-[220px] pt-16 min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-8 bg-transparent">
        
        {/* Subtle dashboard-style blurred aura instead of flat gray */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        {/* Dashboard Layout */}
        <div className="w-full max-w-[1100px] grid grid-cols-12 gap-8 relative z-10 pb-20 mt-4 justify-center">
          
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 w-full">
            
            {/* Widget 1: KYC Profile */}
            <div className="neomorphic-raised rounded-[2rem] p-7 border-0 w-full min-h-[220px] flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-start justify-between text-center pt-1 mb-4">
                <div className="h-10 w-10 rounded-full neomorphic-inset flex items-center justify-center border border-white/40">
                   <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                </div>
                <span className="px-3 py-1 bg-error/10 text-error rounded-full text-[11px] font-bold tracking-widest uppercase shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.5)]">
                  {/* DYNAMIC RISK LEVEL */}
                  {alertData?.risk_score >= 85 ? 'CRITICAL RISK' : 'HIGH RISK'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-body mb-1">Subject Entity</p>
                  <h3 className="text-[19px] font-bold font-display text-on-surface tracking-tight">
                    {/* DYNAMIC CUSTOMER ID */}
                    {alertData ? `Subject #${alertData.customer_id}` : 'Loading Target...'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl neomorphic-inset border border-white/20 text-center flex flex-col justify-center items-center gap-1 bg-surface-container-low/50">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Case ID</p>
                    <div className="flex items-center justify-center gap-1.5 text-on-surface mt-[2px]">
                      <span className="material-symbols-outlined text-[14px]">public</span>
                      <span className="text-[12px] font-bold">
                        {/* DYNAMIC CASE ID */}
                        {alertData ? alertData.case_id : 'WAIT'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl neomorphic-inset border border-white/20 text-center flex flex-col justify-center items-center gap-1 bg-surface-container-low/50">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Flag Date</p>
                    <div className="flex items-center justify-center gap-1.5 text-on-surface mt-[2px]">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span className="text-[12px] font-bold whitespace-nowrap">
                        {/* DYNAMIC DATE */}
                        {alertData ? new Date(alertData.created_at).toLocaleDateString() : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Intelligence Widget */}
            <div className="neomorphic-raised rounded-[2rem] p-7 border-0 flex-1 w-full min-h-[220px] group hover:scale-[1.01] transition-transform duration-300">
              <h4 className="text-[14px] font-bold mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                Case Metadata
              </h4>
              <ul className="space-y-[1.1rem]">
                <li className="flex items-center justify-between text-[13px] border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Suspicion Score</span>
                  <span className="font-bold text-error">
                    {/* DYNAMIC RISK SCORE */}
                    {alertData ? `${alertData.risk_score}/100` : '--/100'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-[13px] border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Typology Trigger</span>
                  <span className="font-bold text-on-surface truncate max-w-[120px]" title={alertData?.alert_type}>
                    {/* DYNAMIC TRIGGER */}
                    {alertData ? alertData.alert_type : 'Scanning...'}
                  </span>
                </li>
                <li className="flex items-center justify-between text-[13px]">
                  <span className="text-on-surface-variant font-medium">Verification Status</span>
                  <span className="text-primary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span> Verified
                  </span>
                </li>
              </ul>
            </div>
            
          </div>

          {/* Right Column: Large Transaction Network */}
          <div className="col-span-12 lg:col-span-8 h-full min-h-[464px]">
            <div className="neomorphic-raised rounded-[2rem] p-8 h-full border-0 flex flex-col relative overflow-hidden group hover:scale-[1.005] transition-transform duration-300">
              <div className="flex justify-between items-start mb-6 relative z-20">
                <div>
                  <h3 className="text-xl font-bold font-display text-on-surface">Transaction Network</h3>
                  <p className="text-[12px] text-on-surface-variant mt-1 font-medium">Visualizing linked nodes for entity flow analysis</p>
                </div>
                <div className="flex gap-3">
                  <button className="w-[36px] h-[36px] rounded-full flex items-center justify-center neomorphic-recessed text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </button>
                  <button className="w-[36px] h-[36px] rounded-full flex items-center justify-center neomorphic-recessed text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </button>
                </div>
              </div>

              {/* Network Visualization Container (Neomorphic Inset) */}
              <div className="flex-1 relative neomorphic-inset rounded-2xl overflow-hidden flex items-center justify-center mt-2 shadow-[inset_0_4px_15px_rgba(0,0,0,0.02)] border border-white/20 bg-surface/50">
                
                {/* Central Node */}
                <div className="relative z-20 w-14 h-14 rounded-full neomorphic-raised flex items-center justify-center text-primary hover:scale-110 transition-transform cursor-pointer border border-white/50">
                  <span className="material-symbols-outlined text-[24px]">apartment</span>
                </div>
                
                {/* SVG Network Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.4]">
                  <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,4" className="text-primary/50">
                    <line x1="50%" x2="28%" y1="50%" y2="28%"></line>
                    <line x1="50%" x2="72%" y1="50%" y2="25%"></line>
                    <line x1="50%" x2="25%" y1="50%" y2="60%"></line>
                    <line x1="50%" x2="75%" y1="50%" y2="65%"></line>
                    <line x1="50%" x2="45%" y1="50%" y2="15%"></line>
                    <line x1="50%" x2="58%" y1="50%" y2="82%"></line>
                  </g>
                </svg>

                {/* Satellite Nodes */}
                <div className="absolute top-[26%] left-[26%] w-8 h-8 rounded-full neomorphic-raised border border-white/40 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                </div>
                
                <div className="absolute top-[23%] right-[23%] w-10 h-10 rounded-full neomorphic-raised border border-white/40 shadow-[inset_0_0_10px_rgba(255,0,0,0.05)] flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-error text-[16px]">warning</span>
                </div>
                
                <div className="absolute bottom-[38%] left-[23%] w-8 h-8 rounded-full neomorphic-raised border border-white/40 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-outline-variant/60"></span>
                </div>
                
                <div className="absolute bottom-[23%] right-[27%] w-11 h-11 rounded-full neomorphic-raised border border-white/40 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">account_balance</span>
                </div>
                
                {/* Neomorphic Glows */}
                <div className="absolute top-[13%] left-[43%] w-16 h-16 rounded-full bg-primary-container/20 blur-xl"></div>
                <div className="absolute bottom-[16%] left-[56%] w-16 h-16 rounded-full bg-error/10 blur-xl"></div>

                {/* Floating Data Label */}
                <div className="absolute top-[48%] left-[70%] -translate-x-1/2 p-2 liquid-glass rounded-xl text-[10px] font-bold text-on-surface shadow-sm border border-white/50 cursor-default z-30">
                  Transaction Flagged
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Element */}
        <div className="fixed bottom-10 left-1/2 lg:left-[calc(50%+110px)] -translate-x-1/2 w-fit px-6 z-30">
          <button 
            // 6. DYNAMIC ROUTING: Passes the alertId to the AiGeneration Component!
            onClick={() => navigate(`/generate/${alertId}`)}
            className="neomorphic-pill px-10 h-14 rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed hover:scale-105 group"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-12">draw</span>
            <span className="font-semibold tracking-tight font-body text-[14px] uppercase tracking-widest">Generate Draft SAR</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default InvestigationHub;