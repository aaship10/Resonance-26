import React, { useContext } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SidebarItem = ({ icon, label, path, aliases = [] }) => {
  const location = useLocation();
  
  // Logic to check if the current route matches the path or any aliases
  // This ensures /investigation stays active when you are in /editor/13
  const isCurrentlyActive = location.pathname === path || 
                             aliases.some(alias => location.pathname.startsWith(alias));

  return (
    <NavLink
      to={path}
      className={`flex items-center gap-4 px-6 py-3.5 rounded-r-full transition-all duration-300 group ${
        isCurrentlyActive 
          ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-[4px_0_10px_rgba(var(--primary-rgb),0.1)]' 
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      }`}
    >
      <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110 ${isCurrentlyActive ? 'fill-1' : ''}`}>
        {icon}
      </span>
      <span className={`text-sm font-bold tracking-tight ${isCurrentlyActive ? 'font-black' : 'font-medium'}`}>
        {label}
      </span>
    </NavLink>
  );
};

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className="h-screen w-[220px] fixed left-0 top-0 z-40 bg-[#f3eff6] border-r border-[#cbbec9]/10 shadow-[10px_0_30px_rgba(53,41,59,0.03)] hidden lg:flex flex-col py-20 shrink-0">
      <div className="px-6 mb-8 mt-4">
        <h2 className="text-lg font-bold text-on-surface font-display tracking-tight">
          Sentinel<span className="font-light">SAR</span>
        </h2>
        <p className="text-xs text-on-surface-variant font-medium">Intelligence Unit</p>
      </div>
      
      <nav className="space-y-1 flex-1 pr-6">
        {/* Shared Views */}
        {user?.role !== 'Admin' && (
          <SidebarItem icon="dashboard" label="Dashboard" path="/dashboard" />
        )}

        {/* Analyst Only Views */}
        {user?.role === 'Analyst' && (
          <>
            <SidebarItem icon="notification_important" label="Alert Queue" path="/alert-queue" />
            <SidebarItem icon="manage_search" label="Investigations" path="/investigation" aliases={['/generating', '/editor', '/narrative']} />
          </>
        )}

        {/* Approver Only Views */}
        {user?.role === 'Approver' && (
          <>
            <SidebarItem icon="admin_panel_settings" label="Compliance Hub" path="/compliance" />
            <SidebarItem icon="inventory_2" label="Archive" path="/archive" />
          </>
        )}

        {/* Admin Only Views */}
        {user?.role === 'Admin' && (
          <>
            <SidebarItem icon="settings" label="System Config" path="/admin/settings" />
            <SidebarItem icon="security" label="Risk Engine" path="/risk" />
          </>
        )}
      </nav>
      
      <div className="mt-auto space-y-1 pb-4 px-6">
        <a className="flex items-center space-x-3 py-2 text-on-surface-variant hover:text-on-surface text-sm transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">help</span>
          <span>Help Center</span>
        </a>
        
        <a onClick={logout} className="flex items-center space-x-3 py-2 text-on-surface-variant hover:text-on-surface text-sm transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;