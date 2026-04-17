// src/pages/AlertQueue.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/axios';

const AlertQueue = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || 'Analyst';

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

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

  const sortedAlerts = [...alerts].sort((a, b) => {
    let aVal, bVal;
    if (sortConfig.key === 'score') {
      aVal = a.risk_score || 0;
      bVal = b.risk_score || 0;
    } else {
      aVal = new Date(a.created_at || 0).getTime();
      bVal = new Date(b.created_at || 0).getTime();
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // UI Helpers tightly aligned with original dashboard
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

  return (
    <div className="font-body min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Top Navigation mirroring Admin Dashboard style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center w-full px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-on-surface tracking-tighter font-display uppercase">SENTINEL SAR</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs">
            {role === 'Approver' ? 'AP' : 'AN'}
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content Area directly styled after AdminDashboard.jsx */}
      <main className="flex-1 lg:pl-[240px] pt-24 pb-12 px-8 flex flex-col gap-8 z-10 w-full max-w-[1600px] mx-auto">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-on-surface tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">notification_important</span>
              Active Alert Queue
            </h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">
              All system flagged suspicious activity requiring investigation assigned directly to your queue.
            </p>
          </div>
          
          <div className="flex space-x-3 relative">
            <div className="relative">
              <button onClick={() => setFilterOpen(!filterOpen)} className="neomorphic-raised px-4 py-2 rounded-full text-sm font-semibold text-on-surface flex items-center space-x-2 hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>Sort</span>
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-3 w-48 neomorphic-raised rounded-[1rem] bg-surface border border-white/20 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[10px] font-bold text-outline-variant uppercase tracking-widest px-3 pt-2 pb-1">Risk Score</div>
                  <button onClick={() => { setSortConfig({key: 'score', direction: 'desc'}); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${sortConfig.key === 'score' && sortConfig.direction === 'desc' ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>High to Low</button>
                  <button onClick={() => { setSortConfig({key: 'score', direction: 'asc'}); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${sortConfig.key === 'score' && sortConfig.direction === 'asc' ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Low to High</button>
                  
                  <div className="w-full h-px bg-outline-variant/10 my-1"></div>

                  <div className="text-[10px] font-bold text-outline-variant uppercase tracking-widest px-3 pt-2 pb-1">Time Processed</div>
                  <button onClick={() => { setSortConfig({key: 'time', direction: 'desc'}); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${sortConfig.key === 'time' && sortConfig.direction === 'desc' ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Newest First</button>
                  <button onClick={() => { setSortConfig({key: 'time', direction: 'asc'}); setFilterOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${sortConfig.key === 'time' && sortConfig.direction === 'asc' ? 'bg-primary/5 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}>Oldest First</button>
                </div>
              )}
            </div>
            <button className="neomorphic-raised px-4 py-2 rounded-full text-sm font-semibold text-on-surface flex items-center space-x-2 hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Alert list cloned from Dashboard but wrapped in unified frame */}
        <section className="bg-transparent border-0 w-full flex flex-col gap-5 relative">
          <div className="grid grid-cols-6 px-8 py-2 text-xs font-bold text-outline-variant uppercase tracking-widest pl-12">
            <span>Alert ID</span>
            <span className="col-span-2">Entity Name</span>
            <span>Risk Score</span>
            <span>Alert Type</span>
            <span className="text-right pr-4">Action</span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-on-surface-variant font-bold animate-pulse">Loading Live Queue...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant font-bold">Your queue is empty.</div>
            ) : (
              sortedAlerts.map((alert, index) => {
                const isTopAlert = index === 0;
                
                return (
                  <div 
                    key={alert.id}
                    onClick={() => navigate(role === 'Approver' ? `/editor/${alert.id}` : `/investigate/${alert.id}`)}
                    className={`grid grid-cols-6 items-center px-8 py-5 neomorphic-raised rounded-2xl bg-surface transition-all duration-300 cursor-pointer ${
                      isTopAlert 
                        ? 'ring-2 ring-primary-container/40 shadow-[0_0_20px_rgba(211,197,224,0.4)] scale-[1.01] relative z-10' 
                        : 'hover:translate-y-[-2px] border border-white/40 shadow-sm'
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
      </main>
    </div>
  );
};

export default AlertQueue;
