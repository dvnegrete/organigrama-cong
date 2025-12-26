import React from 'react';
import { PersonForm } from '../person/PersonForm';
import { PersonList } from '../person/PersonList';
import '../../../src/styles/dashboard.css';

interface SidebarProps {
  draggingPersonId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ draggingPersonId }) => {
  return (
    <aside className="dashboard-sidebar sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Personas</h2>
      </div>

      <div className="sidebar-content">
        <div>
          <PersonForm />
        </div>

        <div className="flex-grow overflow-y-auto padding-bottom-lg">
          <PersonList draggingPersonId={draggingPersonId} />
        </div>
      </div>
    </aside>
  );
};
