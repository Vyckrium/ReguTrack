import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, FileSpreadsheet, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col p-4 text-white fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">
          R
        </div>
        <h1 className="text-xl font-bold tracking-tight">ReguTrack</h1>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink to="/" className={linkClasses}>
          <LayoutDashboard size={20} />
          <span>Tableau de Bord</span>
        </NavLink>
        <NavLink to="/manage" className={linkClasses}>
          <Database size={20} />
          <span>Gérer les Données</span>
        </NavLink>
        <NavLink to="/import-export" className={linkClasses}>
          <FileSpreadsheet size={20} />
          <span>Import / Export</span>
        </NavLink>
        <NavLink to="/settings" className={linkClasses}>
          <Settings size={20} />
          <span>Configuration</span>
        </NavLink>
      </nav>

      <div className="mt-auto px-4 py-4 text-xs text-gray-500 border-t border-gray-800">
        <p>Mode Local (Sécurisé)</p>
        <p>v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
