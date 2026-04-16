import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext'; // 1. Added Context
import apiClient from '../api/axios'; // 2. Added API Client

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // 3. Securely get the user role
  const role = user?.role || 'Analyst'; 

  // 4. State for live backend data
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 5. Fetch the Maker/Checker queue
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const endpoint = role === 'Approver' ? '/alerts/approver' : '/alerts/analyst';
        const response = await apiClient.get(endpoint);
        setAlerts(response.data);
      } catch (err) {
        console.error("Failed to load queue:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchQueue();
  }, [user, role]);

  // UI Helpers to perfectly preserve your custom styling based on risk score
  const getGradient = (score) => {
    if (score >= 85) return "bg-gradient-to-r from-tertiary-container to-error";
    if (score >= 65) return "bg-gradient-to-r from-secondary-container via-primary-container to-tertiary";
    return "bg-gradient-to-r from-[#d1cfda] to-secondary";
  };
  
  const getTextColor = (score) => {
    if (score >= 85) return "text-error";
    if (score >= 65) return "text-tertiary";
    return "text-secondary";
  };

  const getPillColor = (score) => {
    if (score >= 85) return "bg-tertiary-container/60 text-tertiary";
    if (score >= 65) return "bg-surface-container-high text-on-surface-variant";
    return "bg-secondary-container/60 text-secondary";
  };

  if (role !== 'Analyst' && role !== 'Approver') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-30 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="liquid-glass-panel max-w-lg w-full p-12 shadow-ambient-float z-10 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-6xl text-primary mb-6">construction</span>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-4 tracking-tight">{role} Dashboard</h1>
          <p className="text-on-surface-variant mb-8 text-lg font-medium">This page is coming soon.</p>
          <button 
            onClick={() => navigate('/login')}
            className="neomorphic-pill px-8 py-3 rounded-xl font-display font-bold text-on-primary-fixed"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Active Dashboard
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen relative overflow-x-hidden">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f3eff6]/80 backdrop-blur-xl flex justify-between items-center w-full px-6 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] border-b border-[#cbbec9]/10">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-on-surface tracking-tighter font-display">SENTINEL SAR</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <div className="neomorphic-recessed rounded-full px-4 py-2 flex items-center space-x-2 w-64">
              <span className="material-symbols-outlined text-outline-variant">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm outline-none w-full placeholder:text-outline-variant" placeholder="Search entities..." type="text"/>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30 bg-primary flex items-center justify-center text-white text-xs font-bold">
              {role === 'Approver' ? 'AP' : 'AN'}
            </div>
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content Canvas */}
      <main className="lg:pl-[220px] pt-24 px-8 pb-12 min-h-screen">
        {/* Summary Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
          <div className="neomorphic-raised rounded-3xl p-6 border-0 group hover:scale-[1.02] transition-transform duration-300 cursor-default">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-tertiary-container/50 rounded-2xl text-tertiary shadow-sm">
                <span className="material-symbols-outlined">warning</span>
              </span>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Real-Time</span>
            </div>
            <h3 className="text-on-surface-variant text-sm font-semibold mb-1">New Alerts</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-tertiary tracking-tighter">{alerts.length}</span>
              <span className="text-xs text-error font-bold">+12% vs avg</span>
            </div>
          </div>
          
          <div className="neomorphic-raised rounded-3xl p-6 border-0 group hover:scale-[1.02] transition-transform duration-300 cursor-default">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-secondary-container/50 rounded-2xl text-secondary shadow-sm">
                <span className="material-symbols-outlined">pending_actions</span>
              </span>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Internal</span>
            </div>
            <h3 className="text-on-surface-variant text-sm font-semibold mb-1">Pending Review</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-secondary tracking-tighter">12</span>
              <span className="text-xs text-on-surface-variant font-medium">8 Priority</span>
            </div>
          </div>

          <div className="neomorphic-raised rounded-3xl p-6 border-0 group hover:scale-[1.02] transition-transform duration-300 cursor-default">
            <div className="flex justify-between items-start mb-4">
              <span className="p-3 bg-primary-container/50 rounded-2xl text-primary shadow-sm">
                <span className="material-symbols-outlined">description</span>
              </span>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Total YTD</span>
            </div>
            <h3 className="text-on-surface-variant text-sm font-semibold mb-1">SARs Filed</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-primary tracking-tighter">156</span>
              <span className="text-xs text-on-surface-variant font-medium">99.8% Accuracy</span>
            </div>
          </div>
        </section>

        {/* Alert Queue Section */}
        <section className="mt-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-on-surface font-display tracking-tight">{role === 'Approver' ? 'Management Review Queue' : 'Active Alert Queue'}</h2>
              <p className="text-on-surface-variant text-sm">System flagged suspicious activity requiring investigation</p>
            </div>
            <div className="flex space-x-3">
              <button className="neomorphic-raised px-4 py-2 rounded-full text-sm font-semibold text-on-surface flex items-center space-x-2 hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>Filter</span>
              </button>
              <button className="neomorphic-raised px-4 py-2 rounded-full text-sm font-semibold text-on-surface flex items-center space-x-2 hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 px-8 py-4 mb-2 text-xs font-bold text-outline-variant uppercase tracking-widest">
            <span>Alert ID</span>
            <span className="col-span-2">Entity Name</span>
            <span>Risk Score</span>
            <span>Alert Type</span>
            <span className="text-right">Action</span>
          </div>

          <div className="space-y-4">
            
            {isLoading ? (
              <div className="text-center py-8 text-on-surface-variant font-bold animate-pulse">Loading Live Queue...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant font-bold">Your queue is empty.</div>
            ) : (
              alerts.map((alert, index) => {
                // Determine if this is the "top" active alert to give it the special glowing ring you designed
                const isTopAlert = index === 0;
                
                return (
                  <div 
                    key={alert.id}
                    onClick={() => navigate(role === 'Approver' ? `/editor/${alert.id}` : `/investigate/${alert.id}`)}
                    className={`grid grid-cols-6 items-center px-8 py-5 neomorphic-raised rounded-2xl bg-surface transition-all duration-300 cursor-pointer ${
                      isTopAlert 
                        ? 'ring-2 ring-primary-container/40 shadow-[0_0_20px_rgba(211,197,224,0.4)] scale-[1.01] relative z-10' 
                        : 'hover:translate-y-[-2px]'
                    }`}
                  >
                    <span className={`font-bold font-display ${isTopAlert ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {alert.case_id}
                    </span>
                    <div className="col-span-2 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full neomorphic-recessed flex items-center justify-center text-xs font-bold text-on-surface shadow-sm uppercase">
                        {alert.alert_type.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Subject #{alert.customer_id}</p>
                        <p className="text-xs text-on-surface-variant capitalize">System Monitored Entity</p>
                      </div>
                    </div>
                    <div className="pr-8">
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${getGradient(alert.risk_score)} rounded-full`} style={{ width: `${alert.risk_score}%` }}></div>
                      </div>
                      <span className={`text-[10px] font-black ${getTextColor(alert.risk_score)} mt-1 block uppercase`}>
                        {alert.risk_score >= 85 ? 'CRITICAL' : alert.risk_score >= 65 ? 'MEDIUM' : 'LOW'} {alert.risk_score}/100
                      </span>
                    </div>
                    <div>
                      <span className={`px-3 py-1 ${getPillColor(alert.risk_score)} rounded-full text-[11px] font-bold shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.5)] truncate max-w-[120px] block`}>
                        {alert.alert_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-end space-x-4">
                      <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* DYNAMIC BUTTON */}
                      <button className="neomorphic-pill px-4 py-2 rounded-xl text-primary text-xs font-bold flex items-center gap-1 hover:brightness-105 active:scale-95 transition-all">
                        {role === 'Approver' ? 'Review' : 'Investigate'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </section>

        {/* Insights Bento Section */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 neomorphic-raised rounded-3xl p-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-container/20 blur-3xl -mr-24 -mt-24 rounded-full"></div>
            <h3 className="font-display font-bold text-lg mb-4 text-on-surface">Volume Trends</h3>
            <div className="h-48 w-full flex items-end space-x-3 mt-6">
              <div className="flex-1 bg-surface-container-high h-[30%] rounded-t-xl hover:bg-outline-variant/40 transition-colors"></div>
              <div className="flex-1 bg-surface-container-high h-[45%] rounded-t-xl hover:bg-outline-variant/40 transition-colors"></div>
              <div className="flex-1 bg-primary-container h-[80%] rounded-t-xl hover:bg-primary transition-colors"></div>
              <div className="flex-1 bg-primary h-[60%] rounded-t-xl hover:brightness-110 transition-colors"></div>
              <div className="flex-1 bg-surface-container-high h-[40%] rounded-t-xl hover:bg-outline-variant/40 transition-colors"></div>
              <div className="flex-1 bg-tertiary-container h-[90%] rounded-t-xl hover:bg-tertiary transition-colors"></div>
              <div className="flex-1 bg-surface-container-high h-[50%] rounded-t-xl hover:bg-outline-variant/40 transition-colors"></div>
            </div>
            <p className="text-xs text-on-surface-variant mt-6 italic">*Alert generation increased by 14% over the last 48 hours</p>
          </div>
          
          <div className="md:col-span-2 neomorphic-raised rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-lg mb-2 text-on-surface">Automated Validation</h3>
              <p className="text-sm text-on-surface-variant mb-6">Efficiency metrics for AI-triaged reports</p>
            </div>
            <div className="flex items-center space-x-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full neomorphic-recessed flex items-center justify-center mb-2 shadow-inner">
                  <span className="text-xl font-black text-secondary font-display">82%</span>
                </div>
                <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest text-on-surface-variant">Confidence</span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">False Positives</span>
                    <span className="text-secondary">Low</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full shadow-inner">
                    <div className="h-full bg-secondary w-[15%] rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">Processing Time</span>
                    <span className="text-primary">Optimized</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full shadow-inner">
                    <div className="h-full bg-primary w-[78%] rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Dashboard.jsx - Contextual FAB */}
      <button 
        onClick={() => navigate('/upload')} // This is the fix
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-[0_10px_25px_rgba(107,88,118,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 group z-50"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
        <span className="absolute right-16 bg-on-surface text-surface px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-ambient-float">
          File New SAR
        </span>
      </button>
    </div>
  );
};

export default Dashboard;

