// src/pages/Archive.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Archive = () => {
  const [filedCases, setFiledCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchive = async () => {
      try {
        const response = await apiClient.get('/alerts/archive');
        setFiledCases(response.data);
      } catch (err) {
        console.error("Failed to fetch archive:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchive();
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Sidebar />
      <main className="flex-1 lg:pl-[220px] pt-28 px-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-black text-on-surface uppercase tracking-tight">Regulatory Archive</h1>
          <p className="text-on-surface-variant text-sm mt-1">Official Repository of Filed Suspicious Activity Reports (Immutable Records)</p>
        </header>

        <div className="neomorphic-raised rounded-[2rem] p-6 overflow-hidden border-0">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20">
                <th className="pb-4 px-4">Case ID</th>
                <th className="pb-4 px-4">Alert Type</th>
                <th className="pb-4 px-4">Risk Score</th>
                <th className="pb-4 px-4">Filed Date</th>
                <th className="pb-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse">Accessing Secure Vault...</td></tr>
              ) : filedCases.map((item) => (
                <tr key={item.id} className="group hover:bg-surface-container-low transition-colors">
                  <td className="py-5 px-4 font-mono text-xs font-bold">{item.case_id}</td>
                  <td className="py-5 px-4 text-sm font-medium">{item.alert_type}</td>
                  <td className="py-5 px-4 text-sm">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black">{item.risk_score}</span>
                  </td>
                  <td className="py-5 px-4 text-xs text-on-surface-variant">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button 
                      onClick={() => navigate(`/editor/${item.id}`)}
                      className="text-[10px] font-black text-primary uppercase tracking-tighter hover:underline"
                    >
                      View Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Archive;