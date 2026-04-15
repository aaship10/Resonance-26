import React from 'react';
import { MoreVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockAlerts = [
  { id: 'SAR-2026-890', entity: 'Stark Industries', risk: 'High', date: 'Oct 14, 2026', status: 'Pending', amount: '$4.2M' },
  { id: 'SAR-2026-891', entity: 'Wayne Enterprises', risk: 'Medium', date: 'Oct 13, 2026', status: 'Under Review', amount: '$850K' },
  { id: 'SAR-2026-892', entity: 'LexCorp Financial', risk: 'High', date: 'Oct 12, 2026', status: 'Pending', amount: '$12.5M' },
  { id: 'SAR-2026-893', entity: 'Daily Planet', risk: 'Low', date: 'Oct 10, 2026', status: 'Resolved', amount: '$15K' },
];

const AlertTable = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-semibold text-on-surface">Alert Queue</h2>
        <div className="flex space-x-3">
          <input type="text" placeholder="Search entity or ID..." className="recessed-input w-64" />
          <button className="neomorphic-btn px-6 py-2 text-sm font-semibold">Filter</button>
        </div>
      </div>

      <div className="bg-surface-container-highest rounded-[1.5rem] p-3 shadow-ambient-float ghost-border">
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            <div className="col-span-1">Alert ID</div>
            <div className="col-span-2">Subject Entity</div>
            <div className="col-span-1">Risk Assessment</div>
            <div className="col-span-1">Current Status</div>
            <div className="col-span-1 text-right">Involved Amount</div>
          </div>
          
          {/* Rows */}
          <div className="flex flex-col space-y-3">
            {mockAlerts.map((alert, index) => (
              <div 
                key={alert.id} 
                onClick={() => navigate('/investigation')}
                className={`grid grid-cols-6 gap-4 items-center px-6 py-4 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(53,41,59,0.06)] cursor-pointer hover:scale-[1.01]
                  ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                `}
              >
                <div className="col-span-1 font-display font-bold text-primary-dim">{alert.id}</div>
                <div className="col-span-2 font-semibold text-on-surface">{alert.entity}</div>
                <div className="col-span-1 flex items-center">
                  {alert.risk === 'High' ? (
                     <span className="risk-pillow flex items-center gap-1.5"><AlertTriangle size={14}/> High Risk</span>
                  ) : alert.risk === 'Low' ? (
                     <span className="safe-pillow flex items-center gap-1.5"><CheckCircle2 size={14}/> Low Risk</span>
                  ) : (
                     <span className="bg-surface-container-high px-3 py-1 rounded-full text-sm shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05),_1px_1px_2px_rgba(255,255,255,0.7)] text-on-surface-variant font-semibold">Medium</span>
                  )}
                </div>
                <div className="col-span-1 text-sm font-medium text-on-surface-variant">{alert.status}</div>
                <div className="col-span-1 text-right font-display font-semibold text-on-surface flex items-center justify-end">
                  {alert.amount}
                  <button className="ml-3 p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertTable;
