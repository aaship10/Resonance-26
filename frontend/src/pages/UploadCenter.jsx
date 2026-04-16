// src/pages/UploadCenter.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import apiClient from '../api/axios';

const UploadCenter = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setStatus("Please select a CSV file first.");

    setIsUploading(true);
    setStatus("Sentinel AI is parsing data...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Hit the unified upload endpoint we wrote in alerts.py
      const response = await apiClient.post('/alerts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus("Data Ingested Successfully.");
      
      // If the backend generated an alert, take us straight to investigation
      if (response.data.alerts_generated > 0) {
        // We wait a second so the user sees the success message
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setStatus("Upload failed. Ensure CSV headers match the schema.");
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar />
      <main className="flex-1 lg:pl-[220px] flex items-center justify-center p-8 relative">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-container opacity-20 blur-[100px] rounded-full -z-10"></div>
        
        <div className="neomorphic-raised rounded-[3rem] p-12 max-w-xl w-full flex flex-col items-center text-center border-0 relative z-10">
          <div className="w-20 h-20 rounded-full neomorphic-inset flex items-center justify-center mb-8 bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-[40px]">cloud_upload</span>
          </div>

          <h2 className="font-display text-3xl font-black mb-2">Ingestion Center</h2>
          <p className="text-on-surface-variant mb-10">Upload the Unified Investigation CSV (KYC + Transactions) to initialize a new SAR Case.</p>

          <form onSubmit={handleUpload} className="w-full space-y-8">
            <div className="neomorphic-recessed rounded-2xl p-8 border-2 border-dashed border-outline-variant/30 hover:bg-surface-container-low transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant/60 group-hover:text-primary transition-colors text-[32px]">
                  {file ? 'description' : 'upload_file'}
                </span>
                <p className="text-sm font-bold text-on-surface-variant">
                  {file ? file.name : 'Click to browse or drag CSV'}
                </p>
              </div>
            </div>

            {status && (
              <p className={`text-xs font-bold uppercase tracking-widest ${status.includes('fail') ? 'text-error' : 'text-primary'}`}>
                {status}
              </p>
            )}

            <div className="flex gap-4">
               <button 
                type="button"
                onClick={() => navigate(-1)}
                className="neomorphic-pill flex-1 py-4 rounded-xl font-bold text-on-surface-variant text-sm active:scale-95 transition-all"
               >
                Cancel
               </button>
               <button 
                type="submit"
                disabled={isUploading}
                className="neomorphic-pill flex-1 py-4 rounded-xl font-bold text-on-primary-fixed text-sm active:scale-95 transition-all bg-primary/10"
               >
                {isUploading ? 'Ingesting...' : 'Start Investigation'}
               </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UploadCenter;