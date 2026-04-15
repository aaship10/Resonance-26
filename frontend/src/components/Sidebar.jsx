import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon, label, path, aliases = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path || aliases.includes(location.pathname);

  return (
    <a 
      onClick={() => navigate(path)} 
      className={`flex items-center space-x-3 px-6 py-3 transition-transform duration-200 hover:translate-x-1 cursor-pointer pr-4 ${
        active 
          ? 'bg-primary-container/30 text-primary font-bold rounded-r-full border-l-4 border-primary' 
          : 'text-on-surface-variant hover:bg-surface-container-high rounded-r-full'
      }`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className={`font-body text-sm ${active ? 'font-bold' : ''}`}>{label}</span>
    </a>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="h-screen w-[220px] fixed left-0 top-0 z-40 bg-[#f3eff6] border-r border-[#cbbec9]/10 shadow-[10px_0_30px_rgba(53,41,59,0.03)] hidden lg:flex flex-col py-20 shrink-0">
      <div className="px-6 mb-8 mt-4">
        <h2 className="text-lg font-bold text-on-surface font-display tracking-tight">Sentinel<span className="font-light">SAR</span></h2>
        <p className="text-xs text-on-surface-variant font-medium">Intelligence Unit</p>
      </div>
      
      <nav className="space-y-1 flex-1 pr-6">
        <SidebarItem icon="dashboard" label="Dashboard" path="/dashboard" />
        <SidebarItem icon="notification_important" label="Alert Queue" path="/alerts" />
        <SidebarItem icon="manage_search" label="Investigations" path="/investigation" aliases={['/generating', '/narrative']} />
        <SidebarItem icon="inventory_2" label="Archive" path="/archive" />
        <SidebarItem icon="admin_panel_settings" label="Compliance Hub" path="/compliance" />
        <SidebarItem icon="security" label="Risk Engine" path="/risk" />
      </nav>
      
      <div className="mt-auto space-y-1 pb-4 px-6">
        <a className="flex items-center space-x-3 py-2 text-on-surface-variant hover:text-on-surface text-sm transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Help Center</span>
        </a>
        <a onClick={() => navigate('/login')} className="flex items-center space-x-3 py-2 text-on-surface-variant hover:text-on-surface text-sm transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
