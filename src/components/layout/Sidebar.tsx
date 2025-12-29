import React from 'react';
import { PersonForm } from '../person/PersonForm';
import { SidebarTabs } from './SidebarTabs';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';
import '../../../src/styles/dashboard.css';

interface SidebarProps {
  draggingPersonId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ draggingPersonId }) => {

  return (
    <aside className="dashboard-sidebar sidebar">
      <div className="sidebar-header">
        <WorkspaceSelector />
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
