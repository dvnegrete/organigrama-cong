import { useState } from 'react';
import { PersonList } from '../person/PersonList';
import { DepartmentFilter } from '../department/DepartmentFilter';
import { useDepartments } from '../../hooks/useDepartments';
import '../../styles/dashboard.css';

interface SidebarTabsProps {
  draggingPersonId?: string | null;
}

type TabType = 'personas' | 'departamentos';

export const SidebarTabs: React.FC<SidebarTabsProps> = ({ draggingPersonId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('personas');
  const { departments } = useDepartments();

  return (
    <>
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'personas' ? 'active' : ''}`}
          onClick={() => setActiveTab('personas')}
        >
          👥 Personas
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'departamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('departamentos')}
        >
          📋 Departamentos
        </button>
      </div>

      <div className="sidebar-tabs-content">
        {activeTab === 'personas' && (
          <PersonList draggingPersonId={draggingPersonId} />
        )}
        {activeTab === 'departamentos' && (
          <DepartmentFilter departments={departments} />
        )}
      </div>
    </>
  );
};
