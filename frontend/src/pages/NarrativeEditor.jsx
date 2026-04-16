// src/pages/NarrativeEditor.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/axios';

const NarrativeEditor = () => {
  const navigate = useNavigate();
  const { alertId } = useParams();
  const { user } = useContext(AuthContext);

  // Backend Integration State
  const [sarData, setSarData] = useState({ narrative: '', audit_trail: [], status: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Fetch the Generated SAR and Audit Trail from FastAPI
  useEffect(() => {
    const fetchSAR = async () => {
      try {
        const response = await apiClient.get(`/alerts/${alertId}`);
        setSarData({
          narrative: response.data.sar_narrative || 'No narrative generated yet. Please run the AI Risk Engine.',
          audit_trail: response.data.audit_trail_json ? JSON.parse(response.data.audit_trail_json) : [],
          status: response.data.status
        });
      } catch (err) {
        console.error("Failed to fetch SAR:", err);
        setMessage("Error loading document.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSAR();
  }, [alertId]);

  // 2. The Analyst Action: Handoff to Approver
  const submitToApprover = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/generate/${alertId}/submit`); // Assuming this endpoint marks it UNDER_REVIEW
      setMessage("Success: Case handed off to Manager Queue.");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  // 3. The Approver Action: Final Legal Filing
  const approveAndFile = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/alerts/${alertId}/file`);
      setMessage("Success: SAR officially filed.");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage("Failed to file SAR.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
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
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs">
            {user?.role === 'Approver' ? 'AP' : 'AN'}
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[220px] pt-28 pb-[11rem] px-8 flex items-start gap-8 z-10 w-full max-w-[1600px] mx-auto">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        {/* Left Panel: Narrative Editor */}
        <section className="flex-1 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h2 className="font-display text-2xl font-black text-on-surface tracking-tight">Narrative Investigation</h2>
              {/* Dynamic Status Message injected cleanly below the header */}
              {message && (
                 <span className={`text-sm font-bold mt-1 ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                   {message}
                 </span>
              )}
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 rounded-full bg-error/10 text-error text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-error/20">
                URGENT PRIORITY
              </span>
            </div>
          </div>
          
          <div className="neomorphic-raised rounded-[2rem] p-10 border-0 flex flex-col relative pb-32">
            <div className="pr-6 relative z-10">
              <div className="max-w-3xl mx-auto space-y-6 text-on-surface leading-relaxed font-normal text-[16px]">
                
                {/* Dynamically Injected Narrative Textbox (Matches original font/spacing perfectly) */}
                {isLoading ? (
                  <p className="animate-pulse text-on-surface-variant">Loading SAR Draft from Sentinel AI...</p>
                ) : (
                  <textarea
                    className="w-full min-h-[350px] bg-transparent border-none outline-none focus:ring-0 text-on-surface leading-relaxed font-normal text-[16px] resize-none"
                    value={sarData.narrative}
                    onChange={(e) => setSarData({...sarData, narrative: e.target.value})}
                    disabled={user?.role === 'Approver'}
                  />
                )}
                
                {/* Original Dropzone preserved exactly */}
                <div className="h-32 w-full rounded-2xl neomorphic-recessed flex items-center justify-center border-2 border-dashed border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer group my-8">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant/70 group-hover:text-on-surface-variant">
                    <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    <p className="italic text-[13px] font-medium">Add supplementary evidence or drag files here...</p>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Floating Toolbar inside block */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
              <div className="flex items-center gap-2 p-2 liquid-glass rounded-full border border-white/40 shadow-ambient-float">
                <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px] block">edit</span>
                </button>
                <div className="w-[1px] h-6 bg-outline-variant/30"></div>
                <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px] block">attachment</span>
                </button>
                <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px] block">translate</span>
                </button>
                <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px] block">balance</span>
                </button>
                <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[20px] block">spellcheck</span>
                </button>
              </div>
              <div className="liquid-glass px-4 py-1.5 rounded-full shadow-sm border border-white/40">
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Unbiased & Non-Discriminatory Guidelines Applied</p>
              </div>
            </div>
          </div>

          {/* Command Bar */}
          <div className="mt-4 px-1 z-20 w-[95%] mx-auto">
            <div className="relative group">
              <div className="absolute -inset-[1.5px] bg-gradient-to-r from-primary-container to-secondary-container rounded-[1.25rem] blur-[3px] opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative neomorphic-raised rounded-2xl p-2 flex items-center gap-4 bg-surface/80 backdrop-blur-sm border-0">
                <div className="pl-4">
                  <span className="material-symbols-outlined text-primary text-[22px] block">terminal</span>
                </div>
                <input className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface placeholder:text-outline-variant/60 font-body text-[14px] py-2" placeholder="Refine narrative with commands (e.g., 'Focus more on high-velocity deposits', 'Explain the KYC deviation')..." type="text"/>
                <button className="p-2 rounded-[0.8rem] bg-primary-container text-primary hover:brightness-95 active:scale-95 transition-all w-10 h-10 flex items-center justify-center">
                  <span className="material-symbols-outlined block text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: Audit Trail */}
        <aside className="w-[400px] flex flex-col gap-5 shrink-0 sticky top-28 h-[calc(100vh-14rem)]">
          <h2 className="font-display font-extrabold text-[22px] tracking-tight text-on-surface px-2">Intelligence Stream</h2>
          
          <div className="flex-1 neomorphic-raised rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden border-0">
            
            {/* Fixed Header Area: Mapped to RAG Audit Trail Data */}
            <div className="space-y-3 overflow-y-auto max-h-[200px] pr-2">
              {isLoading ? (
                <p className="text-sm text-on-surface-variant animate-pulse">Loading Vector DB evidence...</p>
              ) : sarData.audit_trail.length > 0 ? (
                sarData.audit_trail.map((log, index) => (
                  <div key={index} className="neo-inset p-3.5 rounded-2xl flex items-start gap-4 border border-white/20 bg-surface-container-low/50">
                    <div className="bg-error/10 text-error p-2 rounded-xl flex items-center justify-center border border-error/10">
                      <span className="material-symbols-outlined block text-[20px]">fact_check</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-[13px] text-on-surface">Law: {log.source_name}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">Section: {log.section}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1 italic truncate w-[200px]">"{log.snippet}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="neo-inset p-3.5 rounded-2xl flex items-start gap-4 border border-white/20 bg-surface-container-low/50">
                   <p className="text-xs text-on-surface-variant">No regulatory citations found for this case.</p>
                </div>
              )}
            </div>

            {/* Timeline Section (Preserved Exactly) */}
            <div className="flex-1 relative overflow-hidden rounded-[1.5rem] neomorphic-recessed p-6 border-0 mt-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[2px] bg-surface shadow-inner"></div>
              <div className="relative h-full flex flex-col justify-between items-center py-2 min-h-max">
                <div className="w-full flex flex-col gap-[1.75rem]">
                  
                  <div className="flex items-center justify-between w-full relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-outline-variant z-10 border-[3px] border-surface"></div>
                    <div className="flex-1 h-px bg-outline-variant/20 mx-4"></div>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">09:12 AM</span>
                  </div>
                  
                  <div className="flex items-center justify-between w-full relative">
                    <div className="w-[10px] h-[10px] rounded-full bg-error z-10 border-[2px] border-surface ml-[2px]"></div>
                    <div className="flex-1 h-px bg-outline-variant/20 mx-4"></div>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">10:45 AM</span>
                  </div>
                  
                  {/* Decorative timeline beads */}
                  <div className="grid grid-cols-6 gap-3 py-2 opacity-60 justify-items-center relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/60"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/60"></div>
                    <div className="w-2 h-2 rounded-full bg-error/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/60"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/60"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/60"></div>
                    <div className="w-2 h-2 rounded-full bg-error/40"></div>
                  </div>

                  <div className="flex items-center justify-between w-full relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-outline-variant z-10 border-[3px] border-surface"></div>
                    <div className="flex-1 h-px bg-outline-variant/20 mx-4"></div>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">04:20 PM</span>
                  </div>
                  
                  <div className="flex items-center justify-between w-full relative mt-2">
                    <div className="w-[18px] h-[18px] rounded-full bg-primary z-10 border-[4px] border-surface ring-2 ring-primary-container shadow-sm -ml-[2px] animate-pulse"></div>
                    <div className="flex-1 h-px bg-outline-variant/20 mx-4"></div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest">NOW</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Separated Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-40">
        <div className="bg-surface/80 backdrop-blur-xl py-6 rounded-t-[2.5rem] border-t border-white/40 shadow-[0_-15px_40px_rgba(53,41,59,0.04)] w-full flex flex-col items-center">
          <div className="relative w-full max-w-4xl group">
            <div className="flex flex-col items-center gap-3">
              
              {/* Dynamic Role-Based Buttons preserving your exact CSS classes */}
              {user?.role === 'Analyst' && sarData.status !== 'UNDER_REVIEW' && (
                <button 
                  onClick={submitToApprover}
                  disabled={isSubmitting}
                  className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed w-[280px] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  <span className="font-display font-bold uppercase tracking-widest text-[15px]">
                    {isSubmitting ? 'Submitting...' : 'Send to Approver'}
                  </span>
                </button>
              )}

              {user?.role === 'Approver' && sarData.status === 'UNDER_REVIEW' && (
                <button 
                  onClick={approveAndFile}
                  disabled={isSubmitting}
                  className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed w-[280px] disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span className="font-display font-bold uppercase tracking-widest text-[15px]">
                    {isSubmitting ? 'Filing...' : 'Approve and File'}
                  </span>
                </button>
              )}

              {/* Failsafe Button if already filed */}
              {sarData.status === 'FILED' && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed w-[280px]"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  <span className="font-display font-bold uppercase tracking-widest text-[15px]">Return to Queue</span>
                </button>
              )}

              <p className="text-center text-[9px] text-on-surface-variant font-body tracking-wider uppercase font-medium">
                Compliance Verification ID: {alertId ? `SAR-2024-X992-${alertId}` : 'PENDING'}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NarrativeEditor;