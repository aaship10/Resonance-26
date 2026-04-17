import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // 1. Added useParams
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios'; // 2. Added our secure FastAPI client

const InvestigationHub = () => {
  const navigate = useNavigate();
  const { alertId } = useParams(); // 3. Grab the active Case ID from the URL

  // 4. State to hold the live data from your database
  const [alertData, setAlertData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [txData, setTxData] = useState([]);

  // 5. Fetch the alert details on load
// src/pages/InvestigationHub.jsx

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await apiClient.get(`/alerts/${alertId}/investigation`);
        setAlertData(response.data.alert);
        setCustomerData(response.data.customer);
        setTxData(response.data.transactions);
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
      setCustomerData({
        full_name: "Pending Intake",
        expected_monthly_income: 0,
        occupation: "Unknown",
        tax_id_pan: "TBD"
      });
      setTxData([]);
    }
  }, [alertId]);

  // Draggable Map State
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setMapOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Dictionary mapping country strings to X,Y percentages on our SVG background
  const GEO_MAP = {
    'Domestic': { x: 70, y: 48 },
    'India': { x: 70, y: 48 },
    'Dubai': { x: 63, y: 44 },
    'UAE': { x: 63, y: 44 },
    'USA': { x: 25, y: 38 },
    'United States': { x: 25, y: 38 },
    'UK': { x: 48, y: 32 },
    'London': { x: 48, y: 32 },
    'Singapore': { x: 78, y: 55 },
    'China': { x: 76, y: 42 },
    'Russia': { x: 65, y: 25 },
    'Australia': { x: 85, y: 75 }
  };

  // Parse Unique Counterparties for Nodes
  const uniqueCounterparties = [];
  const locationCounts = {};
  const seenCP = new Set();
  txData.forEach(tx => {
    const cpName = tx.counterparty_name || `Via ${tx.channel}`; 
    const country = tx.counterparty_location || 'Domestic';
    
    if (!seenCP.has(cpName) && uniqueCounterparties.length < 15) { 
      seenCP.add(cpName);
      const baseCoords = GEO_MAP[country] || { x: 45 + Math.random()*20, y: 65 + Math.random()*15 };
      
      // Jitter overlapping nodes so they don't perfectly stack
      const count = locationCounts[country] || 0;
      locationCounts[country] = count + 1;
      
      const jitterX = count > 0 ? (count * 2) * (count % 2 === 0 ? 1 : -1) : 0;
      const jitterY = count > 0 ? (count * 1.5) * (count % 3 === 0 ? 1 : -1) : 0;

      uniqueCounterparties.push({
        name: cpName,
        country: country,
        amount: tx.amount_inr,
        type: tx.tx_type,
        channel: tx.channel,
        coords: { x: baseCoords.x + jitterX, y: baseCoords.y + jitterY }
      });
    }
  });
  
  const displayNodes = uniqueCounterparties;

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
              <div 
                className={`flex-1 relative neomorphic-inset rounded-2xl overflow-hidden flex items-center justify-center mt-2 shadow-[inset_0_4px_15px_rgba(0,0,0,0.02)] border border-white/20 bg-surface/50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div 
                  className="absolute inset-0 w-[150%] h-[150%] origin-center"
                  style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(0.85)`, left: '-25%', top: '-25%' }}
                >
                  {/* World Map Silhouette Background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.10]">
                    <svg viewBox="0 0 1008 650" className="w-full h-full fill-on-surface-variant">
                      <path d="M120,180 Q140,150 180,160 Q210,140 250,150 Q240,190 220,230 Q180,260 160,250 Q130,220 120,180 Z" /> {/* NA */}
                      <path d="M220,280 Q250,290 270,330 Q260,380 230,420 Q200,400 190,340 Z" /> {/* SA */}
                      <path d="M430,120 Q480,100 520,130 Q540,180 500,200 Q450,190 430,150 Z" /> {/* Europe */}
                      <path d="M450,220 Q520,210 570,250 Q560,330 520,380 Q450,350 430,280 Z" /> {/* Africa */}
                      <path d="M540,120 Q650,80 750,100 Q800,160 820,220 Q780,280 700,300 Q650,330 580,250 Z" /> {/* Asia */}
                      <path d="M800,380 Q850,360 880,400 Q860,460 810,450 Z" /> {/* Aus */}
                    </svg>
                  </div>

                  {/* SVG Network Lines FROM HUB to NODES */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.8] z-10">
                    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5,5" className="text-primary/60">
                      {displayNodes.map((node, i) => (
                        <line key={`line-${i}`} x1="70%" y1="48%" x2={`${node.coords.x}%`} y2={`${node.coords.y}%`} />
                      ))}
                    </g>
                  </svg>

                  {/* Central Hub Node (Always Fixed at India/Domestic 70/48) */}
                  <div className="absolute z-20 w-16 h-16 rounded-full neomorphic-raised flex flex-col items-center justify-center text-primary border border-white/80 bg-surface/90 shadow-lg backdrop-blur-sm"
                       style={{ left: `70%`, top: `48%`, transform: 'translate(-50%, -50%)' }}>
                    <span className="material-symbols-outlined text-[24px]">apartment</span>
                    <span className="text-[8px] font-bold mt-1 text-on-surface text-center leading-tight">SUBJECT<br/>HUB</span>
                  </div>

                  {/* Dynamic Geographic Satellite Nodes */}
                  {displayNodes.map((node, i) => {
                    const isError = node.country !== 'Domestic' && node.country !== 'India';
                    return (
                      <div 
                        key={`node-${i}`}
                        className="absolute group z-30"
                        style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className={`w-11 h-11 rounded-full neomorphic-raised border border-white/40 shadow-sm flex items-center justify-center cursor-crosshair bg-surface/80 backdrop-blur-sm ${isError ? 'shadow-[inset_0_0_10px_rgba(255,0,0,0.05)]' : ''}`}>
                          {isError ? (
                            <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                          ) : (
                            <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                          )}
                        </div>
                        
                        {/* Hover Tooltip (Country & CP Name) */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 p-2.5 liquid-glass rounded-xl text-[11px] whitespace-nowrap font-bold text-on-surface shadow-md border border-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center z-50">
                          <span className="font-display tracking-tight text-[13px]">{node.name}</span>
                          <span className={`text-[10px] uppercase tracking-wider ${isError ? 'text-error' : 'text-primary'}`}>{node.country}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW SECTION: Subject & Transaction Deep Dive */}
        <div className="w-full max-w-[1100px] grid grid-cols-12 gap-8 relative z-10 pb-40 mt-0 justify-center">
          <div className="col-span-12 neomorphic-raised rounded-[2rem] p-8 w-full min-h-[400px]">
            <h3 className="text-xl font-bold font-display text-on-surface flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-[24px]">manage_search</span>
              Subject KYC & Financial Ledger
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* KYC Column */}
              <div className="md:col-span-1 neomorphic-recessed rounded-2xl p-6 bg-surface/50 border border-white/20">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">KYC Profile</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-outline-variant font-bold uppercase tracking-widest">Full Name</p>
                    <p className="text-sm font-bold text-on-surface">{customerData?.full_name || 'Loading...'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-outline-variant font-bold uppercase tracking-widest">Occupation</p>
                    <p className="text-sm font-bold text-on-surface">{customerData?.occupation || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-outline-variant font-bold uppercase tracking-widest">Tax / PAN ID</p>
                    <p className="text-sm font-bold text-on-surface">{customerData?.tax_id_pan || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-outline-variant font-bold uppercase tracking-widest">Expected Income</p>
                    <p className="text-sm font-bold text-primary">₹{(customerData?.expected_monthly_income || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Transactions Column */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Transaction History</h4>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {txData.length === 0 ? (
                    <div className="text-xs text-on-surface-variant text-center py-8 font-bold">No transactions logged.</div>
                  ) : (
                    txData.map((tx, idx) => (
                      <div key={idx} className="grid grid-cols-4 items-center neomorphic-raised rounded-xl px-4 py-3 bg-surface hover:scale-[1.01] transition-transform">
                        <div>
                          <p className="text-[11px] font-bold text-on-surface">{tx.tx_type}</p>
                          <p className="text-[9px] text-on-surface-variant">{new Date(tx.tx_date).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold text-on-surface truncate pr-2">{tx.counterparty_name || 'Self/Cash'}</p>
                          <p className="text-[9px] text-on-surface-variant">{tx.channel} • {tx.counterparty_location || 'Domestic'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[12px] font-black ${tx.tx_type === 'CREDIT' ? 'text-primary' : 'text-error'}`}>
                            {tx.tx_type === 'CREDIT' ? '+' : '-'}₹{(tx.amount_inr || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
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