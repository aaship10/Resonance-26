import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios'; 
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps";

// 1. Importing the local JSON file for instant, offline loading
import geoData from '../assets/countries-110m.json';

const InvestigationHub = () => {
  const navigate = useNavigate();
  const { alertId } = useParams();

  const [alertData, setAlertData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [txData, setTxData] = useState([]);
  
  // NEW: Advanced Tooltip State tracking position and data
  const [tooltipData, setTooltipData] = useState(null);

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

    if (alertId && alertId !== 'manual') {
      fetchCaseDetails();
    } else if (alertId === 'manual') {
      setAlertData({
        customer_id: "TBD",
        case_id: "MANUAL-INTAKE-NEW",
        risk_score: 0,
        alert_type: "Human-Initiated Tip",
        created_at: new Date().toISOString()
      });
      setCustomerData({ full_name: "Pending Intake", expected_monthly_income: 0, occupation: "Unknown", tax_id_pan: "TBD" });
      setTxData([]);
    }
  }, [alertId]);

  const GEO_COORDINATES = {
    'Pune, MH': [73.8567, 18.5204],
    'UAE': [53.8478, 23.4241],
    'Kabul, Afghanistan': [69.2075, 34.5553],
    'Karachi, Pakistan': [67.0011, 24.8607],
    'Shanghai, China': [121.4737, 31.2304],
    'Bengaluru, KA': [77.5946, 12.9716],
    'Jaipur, RJ': [75.7873, 26.9124],
    'Ludhiana, PB': [75.8573, 30.9010],
    'Singapore': [103.8198, 1.3521],
    'Yangon, Myanmar': [96.1951, 16.8661],
    'Dubai, UAE': [55.2708, 25.2048],
    'Cayman Islands': [-80.5366, 19.3133],
    'Ahmedabad, GJ': [72.5714, 23.0225],
    'New York, USA': [-74.0060, 40.7128],
    'Navi Mumbai, MH': [73.0297, 19.0330],
    'London, UK': [-0.1276, 51.5072],
    'Port Louis, Mauritius': [57.5012, -20.1609],
    'Abu Dhabi, UAE': [54.3667, 24.4667],
    'Mumbai, MH': [72.8777, 19.0760],
    'Tashkent, Uzbekistan': [69.2401, 41.2995],
    'Beijing, China': [116.4074, 39.9042],
    'India': [78.9629, 20.5937],
    'Kochi, KL': [76.2673, 9.9312],
    'Hyderabad, TG': [78.4867, 17.3850],
    'Nashik, MH': [73.7898, 19.9975],
    'Kolkata, WB': [88.3639, 22.5726],
    'Damascus, Syria': [36.2921, 33.5138],
    'Patna, BR': [85.1376, 25.5941],
    'Willemstad, Curacao': [-68.9310, 12.1166],
    'Sharjah, UAE': [55.4054, 25.3463],
    'New Delhi': [77.2090, 28.6139],
    'Hong Kong': [114.1694, 22.3193],
    'Chennai, TN': [80.2707, 13.0827],
    '': [78.9629, 20.5937], 
    'Unknown': [78.9629, 20.5937], 
    'Domestic': [78.9629, 20.5937],
    'USA': [-95.7129, 37.0902],
    'UK': [-3.4359, 55.3781],
    'Russia': [105.3188, 61.5240],
    'Australia': [133.7751, -25.2744]
  };

  // 2. NEW GROUPING LOGIC
  const locationGroups = {};
  
  txData.forEach(tx => {
    const cpName = tx.counterparty_name || `Via ${tx.channel}`; 
    const country = tx.counterparty_location || 'Domestic';
    const baseCoords = GEO_COORDINATES[country] || [78.9629, 20.5937]; 
    
    // Create a unique key based on the exact coordinates
    const geoKey = `${baseCoords[0]},${baseCoords[1]}`;
    
    if (!locationGroups[geoKey]) {
      locationGroups[geoKey] = {
        country: country,
        coords: baseCoords,
        isError: country !== 'Domestic' && country !== 'India' && country !== 'Unknown',
        transactions: []
      };
    }
    
    // Store the full transaction to show amounts and types in the tooltip
    locationGroups[geoKey].transactions.push({
      name: cpName,
      amount: tx.amount_inr,
      type: tx.tx_type
    });
  });

  const displayNodes = Object.values(locationGroups);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* 3. THE FLOATING HTML TOOLTIP */}
      {/* It renders outside the map canvas and follows the mouse exactly */}
      {tooltipData && (
        <div 
          className="fixed z-[9999] p-4 rounded-xl border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-none backdrop-blur-md"
          style={{ 
            left: tooltipData.x + 15, // Offset slightly so it doesn't cover the mouse
            top: tooltipData.y + 15,
            backgroundColor: tooltipData.node.isError ? 'rgba(255, 240, 240, 0.9)' : 'rgba(250, 248, 255, 0.95)',
          }}
        >
          {/* Header row: Location & Count Badge */}
          <div className="flex justify-between items-center gap-4 mb-2 pb-2 border-b border-black/5">
            <span className="font-display font-black text-[13px] uppercase tracking-wider text-on-surface">
              {tooltipData.node.country}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${tooltipData.node.isError ? 'bg-error text-white' : 'bg-primary text-white'}`}>
              {tooltipData.node.transactions.length} {tooltipData.node.transactions.length === 1 ? 'TXN' : 'TXNS'}
            </span>
          </div>
          
          {/* List of Transactions */}
          <ul className="space-y-1">
            {tooltipData.node.transactions.slice(0, 3).map((tx, idx) => (
              <li key={idx} className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${tooltipData.node.isError ? 'bg-error' : 'bg-primary'}`}></span>
                  <span className="truncate max-w-[120px]" title={tx.name}>{tx.name}</span>
                </div>
                <span className={`font-black tracking-tight text-[10px] ${tx.type === 'CREDIT' ? 'text-primary' : 'text-error'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                </span>
              </li>
            ))}
            {/* Fallback if there are more than 3 transactions in one place */}
            {tooltipData.node.transactions.length > 3 && (
              <li className="text-[10px] font-bold text-outline-variant italic mt-1 pl-3">
                + {tooltipData.node.transactions.length - 3} more transactions...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f3eff6]/80 backdrop-blur-xl border-b border-[#cbbec9]/10 flex justify-between items-center w-full px-6 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-on-surface tracking-tighter font-display uppercase">SENTINEL SAR</span>
        </div>
      </header>

      <Sidebar />

      {/* Main Canvas */}
      <main className="lg:pl-[220px] pt-16 min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-8 bg-transparent">
        
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        {/* Dashboard Layout */}
        <div className="w-full max-w-[1100px] grid grid-cols-12 gap-8 relative z-10 pb-20 mt-4 justify-center">
          
          {/* Left Column (KYC & Metadata) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 w-full">
            <div className="neomorphic-raised rounded-[2rem] p-7 border-0 w-full min-h-[220px] flex flex-col justify-between group hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-start justify-between text-center pt-1 mb-4">
                <div className="h-10 w-10 rounded-full neomorphic-inset flex items-center justify-center border border-white/40">
                   <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                </div>
                <span className="px-3 py-1 bg-error/10 text-error rounded-full text-[11px] font-bold tracking-widest uppercase shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.5)]">
                  {alertData?.risk_score >= 85 ? 'CRITICAL RISK' : 'HIGH RISK'}
                </span>
              </div>
              <div className="space-y-4">
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-body mb-1">Subject Entity</p>
                  <h3 className="text-[19px] font-bold font-display text-on-surface tracking-tight">
                    {alertData ? `Subject #${alertData.customer_id}` : 'Loading Target...'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl neomorphic-inset border border-white/20 text-center flex flex-col justify-center items-center gap-1 bg-surface-container-low/50">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Case ID</p>
                    <div className="flex items-center justify-center gap-1.5 text-on-surface mt-[2px]">
                      <span className="material-symbols-outlined text-[14px]">public</span>
                      <span className="text-[12px] font-bold">
                        {alertData ? alertData.case_id : 'WAIT'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl neomorphic-inset border border-white/20 text-center flex flex-col justify-center items-center gap-1 bg-surface-container-low/50">
                    <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Flag Date</p>
                    <div className="flex items-center justify-center gap-1.5 text-on-surface mt-[2px]">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      <span className="text-[12px] font-bold whitespace-nowrap">
                        {alertData ? new Date(alertData.created_at).toLocaleDateString() : '--'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="neomorphic-raised rounded-[2rem] p-7 border-0 flex-1 w-full min-h-[220px] group hover:scale-[1.01] transition-transform duration-300">
              <h4 className="text-[14px] font-bold mb-6 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                Case Metadata
              </h4>
              <ul className="space-y-[1.1rem]">
                <li className="flex items-center justify-between text-[13px] border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Suspicion Score</span>
                  <span className="font-bold text-error">{alertData ? `${alertData.risk_score}/100` : '--/100'}</span>
                </li>
                <li className="flex items-center justify-between text-[13px] border-b border-outline-variant/10 pb-2">
                  <span className="text-on-surface-variant font-medium">Typology Trigger</span>
                  <span className="font-bold text-on-surface truncate max-w-[120px]">{alertData ? alertData.alert_type : 'Scanning...'}</span>
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
                  <p className="text-[12px] text-on-surface-variant mt-1 font-medium">Geospatial flow analysis (Drag & Zoom enabled)</p>
                </div>
              </div>

              {/* Data-Driven Geographic Map Container */}
              <div className="flex-1 w-full h-full relative neomorphic-inset rounded-2xl overflow-hidden border border-white/20 bg-[#eef1f6] cursor-grab active:cursor-grabbing">
                
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 130 }} style={{ width: "100%", height: "100%" }}>
                  <ZoomableGroup center={[30, 20]} zoom={1.2}>
                    
                    {/* Using the locally imported geoData! */}
                    <Geographies geography={geoData}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography key={geo.rsmKey} geography={geo} fill="#d7d0de" stroke="#ffffff" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#c1b7cb" }, pressed: { outline: "none" } }} />
                        ))
                      }
                    </Geographies>

                    {/* Connection Lines */}
                    {displayNodes.map((node, i) => (
                      <Line key={`line-${i}`} from={GEO_COORDINATES['India']} to={node.coords} stroke="#7b61ff" strokeWidth={1.5} strokeDasharray="4 4" style={{ opacity: 0.5 }} />
                    ))}

                    {/* Central Subject Hub Marker (India) */}
                    <Marker coordinates={GEO_COORDINATES['India']}>
                      <circle r={8} fill="#ffffff" stroke="#7b61ff" strokeWidth={3} style={{ filter: "drop-shadow(0px 0px 5px rgba(123,97,255,0.8))" }} />
                      <text textAnchor="middle" y={-15} style={{ fontFamily: "inherit", fontSize: "10px", fontWeight: "900", fill: "#333" }}>SUBJECT HUB</text>
                    </Marker>

                    {/* Satellite Nodes */}
                    {displayNodes.map((node, i) => {
                      // Prevent drawing a second dot exactly over the India Hub
                      if (node.coords[0] === GEO_COORDINATES['India'][0] && node.coords[1] === GEO_COORDINATES['India'][1]) return null;

                      return (
                        <Marker 
                          key={`marker-${i}`} 
                          coordinates={node.coords}
                          // UPDATE: Standard mouse events to track exact screen position for the beautiful tooltip
                          onMouseEnter={(e) => setTooltipData({ node, x: e.clientX, y: e.clientY })}
                          onMouseMove={(e) => setTooltipData(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                          onMouseLeave={() => setTooltipData(null)}
                        >
                          <circle 
                            r={tooltipData?.node.country === node.country ? 8 : 4.5} 
                            fill={node.isError ? "#ff4d4f" : "#7b61ff"} 
                            stroke="#ffffff" 
                            strokeWidth={1.5} 
                            className="transition-all duration-300 cursor-crosshair"
                            style={{ filter: node.isError ? "drop-shadow(0px 0px 4px rgba(255,77,79,0.8))" : "drop-shadow(0px 0px 4px rgba(123,97,255,0.8))" }}
                          />
                          {/* Notice: No ugly SVG <text> here anymore! */}
                        </Marker>
                      );
                    })}
                  </ZoomableGroup>
                </ComposableMap>
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
                      <div key={idx} className="grid grid-cols-4 items-center neomorphic-raised rounded-xl px-4 py-3 bg-surface hover:bg-surface-container-high transition-colors mb-3">
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