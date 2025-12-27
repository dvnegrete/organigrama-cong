import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Department } from './Department';
import { CreateDepartmentButton } from './CreateDepartmentButton';
import { DatabaseBackupModal } from '../database/DatabaseBackupModal';
import { useDepartments } from '../../hooks/useDepartments';

interface DepartmentCanvasProps {
  draggingPersonId?: string | null;
  onToggleSidebar: () => void;
  isSidebarVisible: boolean;
}

export const DepartmentCanvas: React.FC<DepartmentCanvasProps> = ({ draggingPersonId, onToggleSidebar, isSidebarVisible }) => {
  const { departments } = useDepartments();
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="dashboard-canvas-container">
      <div className="top-toolbar">
        {!isSidebarVisible && (
          <button
            className="btn-toggle-sidebar"
            onClick={onToggleSidebar}
            title="Mostrar panel lateral"
            aria-label="Mostrar panel lateral"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}
        <CreateDepartmentButton containerRef={containerRef} />
        <DatabaseBackupModal />
      </div>

      <div className="department-canvas" ref={containerRef}>
        {departments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">
              No hay departamentos. Crea uno para comenzar.
            </div>
          </div>
        ) : (
          departments.map((department) => (
            <Department key={department.id} department={department} draggingPersonId={draggingPersonId} />
          ))
        )}
      </div>
    </div>
  );
};
