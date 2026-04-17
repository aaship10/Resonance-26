// // src/pages/NarrativeEditor.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import { AuthContext } from '../context/AuthContext';
// import apiClient from '../api/axios';

// const NarrativeEditor = () => {
//   const navigate = useNavigate();
//   const { alertId } = useParams();
//   const { user } = useContext(AuthContext);

//   // Backend Integration State
//   const [sarData, setSarData] = useState({ narrative: '', audit_trail: [], status: '' });
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [message, setMessage] = useState('');

//   // --- NEW: INTERACTIVE XAI STATE ---
//   const [activeRef, setActiveRef] = useState(null); // Tracks which citation is clicked
//   const [isEditMode, setIsEditMode] = useState(false); // Toggles between clickable text and textarea

//   useEffect(() => {
//     const fetchSAR = async () => {
//       try {
//         const response = await apiClient.get(`/alerts/${alertId}`);
//         setSarData({
//           narrative: response.data.sar_narrative || 'No narrative generated yet. Please run the AI Risk Engine.',
//           // Ensure your backend adds a "ref_id" to these logs to match the text tags!
//           audit_trail: response.data.audit_trail_json ? JSON.parse(response.data.audit_trail_json) : [],
//           status: response.data.status
//         });
//       } catch (err) {
//         console.error("Failed to fetch SAR:", err);
//         setMessage("Error loading document.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchSAR();
//   }, [alertId]);

//   const submitToApprover = async () => {
//     setIsSubmitting(true);
//     try {
//       await apiClient.post(`/generate/${alertId}/submit`);
//       setMessage("Success: Case handed off to Manager Queue.");
//       setTimeout(() => navigate('/dashboard'), 2000);
//     } catch (err) {
//       setMessage("Failed to submit. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   const handleReject = async () => {
//   setIsSubmitting(true);
//   try {
//     await apiClient.post(`/alerts/${alertId}/reject`);
//     setMessage("Success: Case returned to Analyst for correction.");
//     // After 2 seconds, send them back to the queue
//     setTimeout(() => navigate('/dashboard'), 2000);
//   } catch (err) {
//     setMessage("Error: Failed to reject case.");
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const approveAndFile = async () => {
//     setIsSubmitting(true);
//     try {
//       await apiClient.post(`/alerts/${alertId}/file`);
//       setMessage("Success: SAR officially filed.");
//       setTimeout(() => navigate('/dashboard'), 2000);
//     } catch (err) {
//       setMessage("Failed to file SAR.");
//       setIsSubmitting(false);
//     }
//   };

// // --- NEW: THE MAGIC REGEX PARSER ---
//   const renderInteractiveText = (text) => {
//     if (!text) return null;
    
//     const parts = text.split(/(\[REF:.*?\])/g);
    
//     return parts.map((part, index) => {
//       if (part.startsWith('[REF:') && part.endsWith(']')) {
//         // CRITICAL FIX: Strip out BOTH the brackets AND the "REF: " prefix
//         const refId = part.replace(/\[REF:\s*|\s*\]/g, '').trim(); 
//         const isActive = activeRef === refId;
        
//         return (
//           <span
//             key={index}
//             onClick={() => setActiveRef(refId)}
//             className={`cursor-pointer mx-1 px-1.5 py-0.5 rounded text-[12px] font-bold transition-colors shadow-sm inline-flex items-center gap-1 ${
//               isActive 
//                 ? 'bg-primary text-white scale-105 transform' 
//                 : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
//             }`}
//           >
//             <span className="material-symbols-outlined text-[12px]">link</span>
//             {refId}
//           </span>
//         );
//       }
//       return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
//     });
//   };

//   // --- NEW: FILTER AUDIT TRAIL BASED ON CLICK ---
//   const displayLogs = activeRef
//     ? sarData.audit_trail.filter((log) => log.ref_id === activeRef || log.id === activeRef)
//     : sarData.audit_trail;

//   return (
//     <div className="font-body min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
//       {/* Top Navigation */}
//       <header className="fixed top-0 left-0 right-0 z-50 bg-[#f3eff6]/80 backdrop-blur-xl border-b border-[#cbbec9]/10 flex justify-between items-center w-full px-6 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
//         <div className="flex items-center gap-4">
//           <span className="text-xl font-black text-on-surface tracking-tighter font-display uppercase">SENTINEL SAR</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
//             <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
//           </button>
//           <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs">
//             {user?.role === 'Approver' ? 'AP' : 'AN'}
//           </div>
//         </div>
//       </header>

//       <Sidebar />


//       {/* Main Content Area */}
//       <main className="flex-1 lg:pl-[220px] pt-28 pb-[11rem] px-8 flex items-start gap-8 z-10 w-full max-w-[1600px] mx-auto">
//         <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

//         {/* 2. REJECTED WARNING (Place it here) */}
//   {sarData.status === 'REJECTED' && (
//     <div className="w-full mb-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
//       <span className="material-symbols-outlined text-red-500">report</span>
//       <div>
//         <p className="text-red-800 font-bold text-sm underline uppercase tracking-tight">Action Required: Case Rejected</p>
//         <p className="text-red-600 text-xs mt-0.5 font-medium">The Approver has returned this SAR for corrections. Please review the narrative and resubmit.</p>
//       </div>
//     </div>
//   )}
  
//         {/* Left Panel: Narrative Editor */}
//         <section className="flex-1 flex flex-col gap-6 relative">
//           <div className="flex items-center justify-between px-2">
//             <div className="flex flex-col">
//               <h2 className="font-display text-2xl font-black text-on-surface tracking-tight">Narrative Investigation</h2>
//               {message && (
//                  <span className={`text-sm font-bold mt-1 ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
//                    {message}
//                  </span>
//               )}
//             </div>
            
//             {/* View / Edit Mode Toggle */}
//             <div className="flex gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/20">
//               <button 
//                 onClick={() => setIsEditMode(false)}
//                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${!isEditMode ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
//               >
//                 Read Mode
//               </button>
//               <button 
//                 onClick={() => setIsEditMode(true)}
//                 disabled={user?.role === 'Approver'}
//                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 ${isEditMode ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
//               >
//                 Edit Text
//               </button>
//             </div>
//           </div>
          
//           <div className={`neomorphic-raised rounded-[2rem] p-10 border-0 flex flex-col relative h-[650px] ${isEditMode ? 'pb-32' : 'pb-10'}`}>
//             {/* CRITICAL FIX: overflow-y-auto enables scrolling! */}
//             <div className="pr-4 relative z-10 h-full overflow-y-auto flex flex-col">
//               <div className="max-w-3xl items-start w-full mx-auto space-y-6 text-on-surface leading-relaxed font-normal text-[16px] flex-1 flex flex-col">
                
//                 {isLoading ? (
//                   <p className="animate-pulse text-on-surface-variant">Loading SAR Draft from Sentinel AI...</p>
//                 ) : isEditMode ? (
//                   /* RAW TEXTAREA MODE */
//                   <textarea
//                     className="w-full flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface leading-relaxed font-normal text-[16px] resize-none overflow-y-auto break-words whitespace-pre-wrap min-h-[300px]"
//                     value={sarData.narrative}
//                     onChange={(e) => setSarData({...sarData, narrative: e.target.value})}
//                   />
//                 ) : (
//                   /* INTERACTIVE CLICKABLE MODE */
//                   <div className="w-full bg-transparent border-none text-on-surface leading-relaxed font-normal text-[16px] break-words whitespace-pre-wrap h-max">
//                     {renderInteractiveText(sarData.narrative)}
//                   </div>
//                 )}
                
//               </div>
//             </div>

//             {/* Floating Toolbar inside block (RESTORED) */}
//             {isEditMode && (
//               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-none">
//                 <div className="flex items-center gap-2 p-2 liquid-glass rounded-full border border-white/40 shadow-ambient-float pointer-events-auto">
//                   <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
//                     <span className="material-symbols-outlined text-[20px] block">attachment</span>
//                   </button>
//                   <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
//                     <span className="material-symbols-outlined text-[20px] block">translate</span>
//                   </button>
//                   <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
//                     <span className="material-symbols-outlined text-[20px] block">balance</span>
//                   </button>
//                   <button className="p-2.5 rounded-full hover:bg-surface/50 transition-colors text-on-surface-variant hover:text-primary">
//                     <span className="material-symbols-outlined text-[20px] block">spellcheck</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

          
//         </section>

//         {/* Right Panel: Audit Trail (Intelligence Stream) */}
//         <aside className="w-[400px] flex flex-col gap-6 shrink-0 sticky top-28">
//           <div className="flex items-center justify-between px-2">
//             <h2 className="font-display font-extrabold text-[22px] tracking-tight text-on-surface">Intelligence Stream</h2>
//             {/* Show clear button if a filter is active */}
//             {activeRef && (
//               <button 
//                 onClick={() => setActiveRef(null)}
//                 className="text-[10px] bg-error/10 text-error px-2 py-1 rounded font-bold uppercase hover:bg-error/20 transition-colors"
//               >
//                 Clear Filter
//               </button>
//             )}
//           </div>
          
//           <div className="neomorphic-raised rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden border-0 h-[650px]">
            
//             <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-2">
//               {isLoading ? (
//                 <p className="text-sm text-on-surface-variant animate-pulse">Loading Vector DB evidence...</p>
//               ) : displayLogs.length > 0 ? (
//                 displayLogs.map((log, index) => (
//                   <div key={index} className={`neo-inset p-3.5 rounded-2xl flex items-start gap-4 border transition-all duration-300 ${activeRef ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-white/20 bg-surface-container-low/50'}`}>
//                     <div className={`${activeRef ? 'bg-primary text-white' : 'bg-error/10 text-error'} p-2 rounded-xl flex items-center justify-center border border-error/10 transition-colors`}>
//                       <span className="material-symbols-outlined block text-[20px]">
//                         {log.type === 'database' ? 'database' : 'fact_check'}
//                       </span>
//                     </div>
//                     <div>
//                       {/* Accommodates both RAG outputs and DB sources */}
//                       <h4 className="font-display font-bold text-[13px] text-on-surface">{log.source_name || log.domain || 'Verified Evidence'}</h4>
//                       <p className="text-[11px] text-on-surface-variant mt-1 leading-snug font-bold text-primary/80">{log.ref_id || 'Reference ID Attached'}</p>
//                       <p className="text-[10px] text-on-surface-variant mt-2 italic">"{log.snippet || log.evidence}"</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="neo-inset p-3.5 rounded-2xl flex items-start gap-4 border border-white/20 bg-surface-container-low/50">
//                    <p className="text-xs text-on-surface-variant">
//                      {activeRef ? "No specific evidence found for this citation." : "No regulatory citations found for this case."}
//                    </p>
//                 </div>
//               )}
//             </div>

//             {/* Original Timeline Component preserved exactly as you had it below... */}
//             {/* ... (Timeline code omitted for brevity but remains untouched) ... */}
//           </div>
//         </aside>
//       </main>

//       {/* Footer / Submission Bar (Preserved Exactly) */}
//       <footer className="fixed bottom-0 left-0 w-full z-50">
//         <div className="bg-surface/80 backdrop-blur-xl py-6 rounded-t-[2.5rem] border-t border-white/40 shadow-[0_-15px_40px_rgba(53,41,59,0.04)] w-full flex flex-col items-center">
//           <div className="relative w-full max-w-4xl group">
//             <div className="flex flex-col items-center gap-3">
              
//               {/* Dynamic Role-Based Buttons preserving your exact CSS classes */}
//               {user?.role === 'Analyst' && sarData.status !== 'UNDER_REVIEW' && (
//                 <button 
//                   onClick={submitToApprover}
//                   disabled={isSubmitting}
//                   className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed w-[280px] disabled:opacity-50"
//                 >
//                   <span className="material-symbols-outlined text-[20px]">send</span>
//                   <span className="font-display font-bold uppercase tracking-widest text-[15px]">
//                     {isSubmitting ? 'Submitting...' : 'Send to Approver'}
//                   </span>
//                 </button>
//               )}

//               {user?.role === 'Approver' && sarData.status === 'UNDER_REVIEW' && (
//                 <div className="flex flex-row items-center justify-center gap-4 w-full max-w-2xl">
                  
//                   {/* REJECT BUTTON: Sends the case back to the Analyst */}
//                   <button 
//                     onClick={handleReject}
//                     disabled={isSubmitting}
//                     className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-red-500 border border-red-100 hover:bg-red-50/50 w-[240px] disabled:opacity-50 shadow-sm"
//                   >
//                     <span className="material-symbols-outlined text-[20px]">keyboard_return</span>
//                     <span className="font-display font-bold uppercase tracking-widest text-[13px]">
//                       {isSubmitting ? 'Processing...' : 'Reject Draft'}
//                     </span>
//                   </button>

//                   {/* APPROVE BUTTON: Files the case officially */}
//                   <button 
//                     onClick={approveAndFile}
//                     disabled={isSubmitting}
//                     className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-white bg-primary shadow-lg hover:brightness-110 w-[280px] disabled:opacity-50"
//                   >
//                     <span className="material-symbols-outlined text-[20px]">verified</span>
//                     <span className="font-display font-bold uppercase tracking-widest text-[13px]">
//                       {isSubmitting ? 'Filing...' : 'Approve and File'}
//                     </span>
//                   </button>
                  
//                 </div>
//               )}

//               {/* Failsafe Button if already filed */}
//               {sarData.status === 'FILED' && (
//                 <button 
//                   onClick={() => navigate('/dashboard')}
//                   className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-on-primary-fixed w-[280px]"
//                 >
//                   <span className="material-symbols-outlined text-[20px]">arrow_back</span>
//                   <span className="font-display font-bold uppercase tracking-widest text-[15px]">Return to Queue</span>
//                 </button>
//               )}

//               <p className="text-center text-[9px] text-on-surface-variant font-body tracking-wider uppercase font-medium">
//                 Compliance Verification ID: {alertId ? `SAR-2024-X992-${alertId}` : 'PENDING'}
//               </p>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default NarrativeEditor;

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

  // --- NEW: INTERACTIVE XAI STATE ---
  const [activeRef, setActiveRef] = useState(null); // Tracks which citation is clicked
  const [isEditMode, setIsEditMode] = useState(false); // Toggles between clickable text and textarea

  useEffect(() => {
    const fetchSAR = async () => {
      try {
        const response = await apiClient.get(`/alerts/${alertId}`);
        setSarData({
          narrative: response.data.sar_narrative || 'No narrative generated yet. Please run the AI Risk Engine.',
          // Ensure your backend adds a "ref_id" to these logs to match the text tags!
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

  const submitToApprover = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/generate/${alertId}/submit`);
      setMessage("Success: Case handed off to Manager Queue.");
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/alerts/${alertId}/reject`);
      setMessage("Success: Case returned to Analyst for correction.");
      // After 2 seconds, send them back to the queue
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMessage("Error: Failed to reject case.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // --- NEW: THE MAGIC REGEX PARSER ---
  const renderInteractiveText = (text) => {
    if (!text) return null;
    
    const parts = text.split(/(\[REF:.*?\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[REF:') && part.endsWith(']')) {
        // CRITICAL FIX: Strip out BOTH the brackets AND the "REF: " prefix
        const refId = part.replace(/\[REF:\s*|\s*\]/g, '').trim(); 
        const isActive = activeRef === refId;
        
        return (
          <span
            key={index}
            onClick={() => setActiveRef(refId)}
            className={`cursor-pointer mx-1 px-1.5 py-0.5 rounded text-[12px] font-bold transition-colors shadow-sm inline-flex items-center gap-1 ${
              isActive 
                ? 'bg-primary text-white scale-105 transform' 
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">link</span>
            {refId}
          </span>
        );
      }
      return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
    });
  };

  // --- NEW: FILTER AUDIT TRAIL BASED ON CLICK ---
  const displayLogs = activeRef
    ? sarData.audit_trail.filter((log) => log.ref_id === activeRef || log.id === activeRef)
    : sarData.audit_trail;

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
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs">
            {user?.role === 'Approver' ? 'AP' : 'AN'}
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content Area - Corrected flex-col for vertical stacking */}
      <main className="flex-1 lg:pl-[220px] pt-28 pb-[11rem] px-8 z-10 w-full max-w-[1600px] mx-auto relative flex flex-col gap-6">
        
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        {/* 1. THE REJECTED BANNER (Stays on top across full width) */}
        {sarData.status === 'REJECTED' && (
          <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <span className="material-symbols-outlined text-red-500">report</span>
            <div>
              <p className="text-red-800 font-bold text-sm underline uppercase tracking-tight">Action Required: Case Rejected</p>
              <p className="text-red-600 text-xs mt-0.5 font-medium">The Approver has returned this SAR for corrections. Please review the narrative and resubmit.</p>
            </div>
          </div>
        )}

        {/* 2. WRAPPER FOR HORIZONTAL PANELS (Keeps layout side-by-side) */}
        <div className="flex flex-row items-start gap-8 w-full">
          
          {/* Left Panel: Narrative Editor */}
          <section className="flex-1 flex flex-col gap-6 relative">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <h2 className="font-display text-4xl font-black text-on-surface tracking-tight">Narrative Investigation</h2>
                {message && (
                  <span className={`text-sm font-bold mt-1 ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </span>
                )}
              </div>
              
              {/* View / Edit Mode Toggle */}
              <div className="flex gap-2 bg-surface-container-low p-1 rounded-full border border-outline-variant/20">
                <button 
                  onClick={() => setIsEditMode(false)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${!isEditMode ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Read Mode
                </button>
                <button 
                  onClick={() => setIsEditMode(true)}
                  disabled={user?.role === 'Approver'}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-30 ${isEditMode ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  Edit Text
                </button>
              </div>
            </div>
            
            <div className={`neomorphic-raised rounded-[2rem] p-10 border-0 flex flex-col relative h-[650px] ${isEditMode ? 'pb-32' : 'pb-10'}`}>
              <div className="pr-4 relative z-10 h-full overflow-y-auto flex flex-col">
                <div className="max-w-3xl items-start w-full mx-auto space-y-6 text-on-surface leading-relaxed font-normal text-[16px] flex-1 flex flex-col">
                  
                  {isLoading ? (
                    <p className="animate-pulse text-on-surface-variant">Loading SAR Draft from Sentinel AI...</p>
                  ) : isEditMode ? (
                    <textarea
                      className="w-full flex-1 bg-transparent border-none outline-none focus:ring-0 text-on-surface leading-relaxed font-normal text-[16px] resize-none overflow-y-auto break-words whitespace-pre-wrap min-h-[300px]"
                      value={sarData.narrative}
                      onChange={(e) => setSarData({...sarData, narrative: e.target.value})}
                    />
                  ) : (
                    <div className="w-full bg-transparent border-none text-on-surface leading-relaxed font-normal text-[16px] break-words whitespace-pre-wrap h-max">
                      {renderInteractiveText(sarData.narrative)}
                    </div>
                  )}
                  
                </div>
              </div>

              {isEditMode && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-none">
                  <div className="flex items-center gap-2 p-2 liquid-glass rounded-full border border-white/40 shadow-ambient-float pointer-events-auto">
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
                </div>
              )}
            </div>
          </section>

          {/* Right Panel: Audit Trail (Intelligence Stream) */}
          <aside className="w-[400px] flex flex-col gap-6 shrink-0 sticky top-28">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-display font-extrabold text-[22px] tracking-tight text-on-surface">Intelligence Stream</h2>
              {activeRef && (
                <button 
                  onClick={() => setActiveRef(null)}
                  className="text-[10px] bg-error/10 text-error px-2 py-1 rounded font-bold uppercase hover:bg-error/20 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>
            
            <div className="neomorphic-raised rounded-[2rem] p-6 flex flex-col gap-5 relative overflow-hidden border-0 h-[650px]">
              <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-2">
                {isLoading ? (
                  <p className="text-sm text-on-surface-variant animate-pulse">Loading Vector DB evidence...</p>
                ) : displayLogs.length > 0 ? (
                  displayLogs.map((log, index) => (
                    <div key={index} className={`neo-inset p-3.5 rounded-2xl flex items-start gap-4 border transition-all duration-300 ${activeRef ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-white/20 bg-surface-container-low/50'}`}>
                      <div className={`${activeRef ? 'bg-primary text-white' : 'bg-error/10 text-error'} p-2 rounded-xl flex items-center justify-center border border-error/10 transition-colors`}>
                        <span className="material-symbols-outlined block text-[20px]">
                          {log.type === 'database' ? 'database' : 'fact_check'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-[13px] text-on-surface">{log.source_name || log.domain || 'Verified Evidence'}</h4>
                        <p className="text-[11px] text-on-surface-variant mt-1 leading-snug font-bold text-primary/80">{log.ref_id || 'Reference ID Attached'}</p>
                        <p className="text-[10px] text-on-surface-variant mt-2 italic">"{log.snippet || log.evidence}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="neo-inset p-3.5 rounded-2xl flex items-start gap-4 border border-white/20 bg-surface-container-low/50">
                     <p className="text-xs text-on-surface-variant">
                       {activeRef ? "No specific evidence found for this citation." : "No regulatory citations found for this case."}
                     </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer / Submission Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-50">
        <div className="bg-surface/80 backdrop-blur-xl py-6 rounded-t-[2.5rem] border-t border-white/40 shadow-[0_-15px_40px_rgba(53,41,59,0.04)] w-full flex flex-col items-center">
          <div className="relative w-full max-w-4xl group">
            <div className="flex flex-col items-center gap-3">
              
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
                <div className="flex flex-row items-center justify-center gap-4 w-full max-w-2xl">
                  <button 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-red-500 border border-red-100 hover:bg-red-50/50 w-[240px] disabled:opacity-50 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">keyboard_return</span>
                    <span className="font-display font-bold uppercase tracking-widest text-[13px]">
                      {isSubmitting ? 'Processing...' : 'Reject Draft'}
                    </span>
                  </button>

                  <button 
                    onClick={approveAndFile}
                    disabled={isSubmitting}
                    className="neomorphic-pill px-8 h-14 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all text-white bg-primary shadow-lg hover:brightness-110 w-[280px] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span className="font-display font-bold uppercase tracking-widest text-[13px]">
                      {isSubmitting ? 'Filing...' : 'Approve and File'}
                    </span>
                  </button>
                </div>
              )}

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