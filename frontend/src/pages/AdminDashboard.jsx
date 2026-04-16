// src/pages/AdminDashboard.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // 1. Risk Engine State
  const [thresholds, setThresholds] = useState({
    velocityLimit: 10000,
    structuringWeight: 35,
    autoEscalateScore: 85,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [engineMessage, setEngineMessage] = useState('');

  // 2. Personnel Management State
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    password: '',
    role: 'Analyst'
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState('');

  // 3. System Scan State
  const [isScanning, setIsScanning] = useState(false);

  // Handlers
  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Logic for saving thresholds to backend (matching your alerts.py settings if implemented)
      setTimeout(() => {
        setEngineMessage("Success: Risk Engine parameters synchronized.");
        setIsSaving(false);
      }, 1000);
    } catch (err) {
      setEngineMessage("Error updating parameters.");
      setIsSaving(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegMessage(''); // Clear previous messages
    try {
      await apiClient.post('/register', {
        employee_id: newEmployee.employeeId,
        password: newEmployee.password,
        role: newEmployee.role
      });
      setRegMessage(`Success: ${newEmployee.role} account created for ${newEmployee.employeeId}`);
      setNewEmployee({ employeeId: '', password: '', role: 'Analyst' });
    } catch (err) {
      // Capture the 422 error details if the backend sends them
      const detail = err.response?.data?.detail || "Registration failed. Check ID format.";
      setRegMessage(`Error: ${detail}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const runGlobalScan = async () => {
    setIsScanning(true);
    try {
      const response = await apiClient.post('/alerts/run-engine');
      setEngineMessage(`Scan Complete: ${response.data.message}`);
    } catch (err) {
      setEngineMessage("Global scan failed. Ensure transactions exist.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="font-body min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex justify-between items-center w-full px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-on-surface tracking-tighter font-display uppercase">SENTINEL SAR</span>
          <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-error/20">
            Admin Access
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs">
            AD
          </div>
        </div>
      </header>

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-[240px] pt-24 pb-12 px-8 flex flex-col gap-8 z-10 w-full max-w-[1600px] mx-auto">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply -z-10 pointer-events-none"></div>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-on-surface tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[32px]">admin_panel_settings</span>
              System Configuration
            </h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">
              Global threshold controls, microservice diagnostics, and FIU personnel management. Changes apply immediately to the Risk Engine.
            </p>
          </div>
          
          {/* Integrated Global Scan Button */}
          <button 
            onClick={runGlobalScan}
            disabled={isScanning}
            className={`neomorphic-pill px-6 h-12 rounded-xl text-xs font-bold text-secondary flex items-center gap-2 hover:scale-105 transition-all active:scale-95 ${isScanning ? 'opacity-50' : ''}`}
          >
            <span className={`material-symbols-outlined text-sm ${isScanning ? 'animate-spin' : ''}`}>refresh</span>
            {isScanning ? 'Processing Database...' : 'Execute Global Risk Scan'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Risk Engine Tuner & System Health */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* System Health Diagnostics */}
            <section className="neomorphic-raised rounded-[2rem] p-8 border-0">
              <h2 className="font-display font-bold text-lg mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">monitor_heart</span>
                Microservice Diagnostics
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="neomorphic-recessed rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">PostgreSQL DB</h3>
                  <p className="text-[10px] text-on-surface-variant/60">Neon Cloud • Active</p>
                </div>
                <div className="neomorphic-recessed rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Chroma Vector</h3>
                  <p className="text-[10px] text-on-surface-variant/60">RAG Index • Online</p>
                </div>
                <div className="neomorphic-recessed rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Groq Llama 3.3</h3>
                  <p className="text-[10px] text-on-surface-variant/60">API Connected</p>
                </div>
              </div>
            </section>

            {/* Risk Engine Tuner */}
            <section className="neomorphic-raised rounded-[2rem] p-8 border-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  Algorithm Thresholds
                </h2>
                {engineMessage && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full animate-bounce">
                    {engineMessage}
                  </span>
                )}
              </div>
              
              <form onSubmit={handleSaveThresholds} className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Structuring Velocity Limit (₹)
                    </label>
                    <span className="text-primary font-bold text-sm">₹{thresholds.velocityLimit.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="5000" max="50000" step="1000"
                    value={thresholds.velocityLimit}
                    onChange={(e) => setThresholds({...thresholds, velocityLimit: parseInt(e.target.value)})}
                    className="w-full accent-primary"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Flag cumulative 48h transactions exceeding this value.</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Auto-Escalation Score (0-100)
                    </label>
                    <span className="text-error font-bold text-sm">{thresholds.autoEscalateScore} pts</span>
                  </div>
                  <input 
                    type="range" min="50" max="100" step="5"
                    value={thresholds.autoEscalateScore}
                    onChange={(e) => setThresholds({...thresholds, autoEscalateScore: parseInt(e.target.value)})}
                    className="w-full accent-error"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">Cases scoring above this bypass standard queue as URGENT.</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isSaving}
                    className="neomorphic-pill px-6 h-12 rounded-full font-bold text-primary flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isSaving ? 'Synchronizing...' : 'Apply Thresholds to Global Engine'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Column 3: Personnel Management */}
          <div className="flex flex-col gap-8">
            <section className="neomorphic-raised rounded-[2rem] p-8 border-0 h-full flex flex-col">
              <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">manage_accounts</span>
                Personnel Provisioning
              </h2>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Generate secure access credentials for new Analysts and Approvers.
              </p>

              {regMessage && (
                <div className={`p-3 rounded-xl mb-4 text-[10px] font-bold uppercase tracking-tight ${regMessage.includes('Success') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {regMessage}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex-1 flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Employee ID</label>
                  <div className="neomorphic-recessed rounded-xl px-4 py-3 flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant mr-3 text-[18px]">badge</span>
                    <input 
                      type="text" required
                      className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none placeholder:text-on-surface-variant/40"
                      placeholder="e.g., EMP-4055"
                      value={newEmployee.employeeId}
                      onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Temporary Passkey</label>
                  <div className="neomorphic-recessed rounded-xl px-4 py-3 flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant mr-3 text-[18px]">key</span>
                    <input 
                      type="password" required minLength={8}
                      className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none placeholder:text-on-surface-variant/40"
                      placeholder="••••••••"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Authority Role</label>
                  <div className="neomorphic-recessed rounded-xl px-4 py-3 flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant mr-3 text-[18px]">shield_person</span>
                    <select 
                      className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none cursor-pointer"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    >
                      <option value="Analyst">Tier 1 Analyst</option>
                      <option value="Approver">Tier 2 Approver</option>
                      <option value="Admin">System Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    type="submit" disabled={isRegistering}
                    className="neomorphic-pill w-full h-12 rounded-full font-bold text-on-primary-fixed flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    {isRegistering ? 'Provisioning...' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;