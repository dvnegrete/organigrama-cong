import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { PersonForm } from '../person/PersonForm';
import { SidebarTabs } from './SidebarTabs';
import '../../../src/styles/dashboard.css';

interface SidebarProps {
  draggingPersonId?: string | null;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ draggingPersonId, onToggleSidebar }) => {
  return (
    <aside className="dashboard-sidebar sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Organizador</h2>
        <button
          className="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          title="Ocultar panel lateral"
          aria-label="Ocultar panel lateral"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>

      <div className="sidebar-content">
        <div>
          <PersonForm />
        </div>

        <SidebarTabs draggingPersonId={draggingPersonId} />
      </div>
    </aside>
  );
};
