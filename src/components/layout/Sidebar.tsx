import React from 'react';
import { PersonForm } from '../person/PersonForm';
import { SidebarTabs } from './SidebarTabs';
import '../../../src/styles/dashboard.css';

interface SidebarProps {
  draggingPersonId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ draggingPersonId }) => {
  return (
    <aside className="dashboard-sidebar sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Organizador</h2>
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
