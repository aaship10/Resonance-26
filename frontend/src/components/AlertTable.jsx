import React from 'react';
import { MoreVertical, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Notice we added props here so the Dashboard can pass the live FastAPI data in!
const AlertTable = ({ alerts = [], isLoading, error, userRole }) => {
  const navigate = useNavigate();

  // Helper to translate FastAPI numerical risk scores into your UI categories
  const getRiskLevel = (score) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-semibold text-on-surface">Alert Queue</h2>
        <div className="flex space-x-3">
          <input type="text" placeholder="Search Case ID..." className="recessed-input w-64 px-4 py-2 rounded-lg outline-none" />
          <button className="neomorphic-btn px-6 py-2 text-sm font-semibold rounded-lg">Filter</button>
        </div>
      </div>

      <div className="bg-surface-container-highest rounded-[1.5rem] p-3 shadow-ambient-float ghost-border">
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <div className="col-span-1">Case ID</div>
            <div className="col-span-2">Typology Trigger</div>
            <div className="col-span-1">Risk Score</div>
            <div className="col-span-1">Current Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          
          {/* Error State */}
          {error && (
            <div className="p-8 text-center text-error font-bold">{error}</div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 flex justify-center items-center text-primary">
              <Loader2 className="animate-spin h-8 w-8" />
              <span className="ml-3 font-bold">Syncing with Risk Engine...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && alerts.length === 0 && !error && (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              Queue is currently empty.
            </div>
          )}

          {/* Live Rows */}
          {!isLoading && alerts.length > 0 && (
            <div className="flex flex-col space-y-3">
              {alerts.map((alert, index) => {
                const riskLevel = getRiskLevel(alert.risk_score);
                
                return (
                  <div 
                    key={alert.id} 
                    // DYNAMIC ROUTING: Approvers go to the editor, Analysts go to the AI generator
                    onClick={() => navigate(userRole === 'Approver' ? `/editor/${alert.id}` : `/investigate/${alert.id}`)}
                    className={`grid grid-cols-6 gap-4 items-center px-6 py-4 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(53,41,59,0.06)] cursor-pointer hover:scale-[1.01]
                      ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                    `}
                  >
                    <div className="col-span-1 font-display font-bold text-primary-dim">{alert.case_id}</div>
                    <div className="col-span-2 font-semibold text-on-surface">{alert.alert_type}</div>
                    
                    <div className="col-span-1 flex items-center">
                      {riskLevel === 'High' ? (
                         <span className="risk-pillow flex items-center gap-1.5 text-error font-bold"><AlertTriangle size={14}/> {alert.risk_score}/100</span>
                      ) : riskLevel === 'Low' ? (
                         <span className="safe-pillow flex items-center gap-1.5 text-emerald-600 font-bold"><CheckCircle2 size={14}/> {alert.risk_score}/100</span>
                      ) : (
                         <span className="bg-surface-container-high px-3 py-1 rounded-full text-sm shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05),_1px_1px_2px_rgba(255,255,255,0.7)] text-on-surface-variant font-semibold">
                           {alert.risk_score}/100
                         </span>
                      )}
                    </div>
                    
                    <div className="col-span-1 text-sm font-medium text-on-surface-variant">
                      {alert.status.replace('_', ' ')}
                    </div>
                    
                    <div className="col-span-1 text-right font-display font-semibold text-primary flex items-center justify-end">
                      {userRole === 'Approver' ? 'Review' : 'Investigate'}
                      <button className="ml-3 p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertTable;