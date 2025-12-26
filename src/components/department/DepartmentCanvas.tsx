import React, { useRef } from 'react';
import { Department } from './Department';
import { CreateDepartmentButton } from './CreateDepartmentButton';
import { DatabaseBackupModal } from '../database/DatabaseBackupModal';
import { useDepartments } from '../../hooks/useDepartments';

interface DepartmentCanvasProps {
  draggingPersonId?: string | null;
}

export const DepartmentCanvas: React.FC<DepartmentCanvasProps> = ({ draggingPersonId }) => {
  const { departments } = useDepartments();
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="dashboard-canvas-container">
      <div className="top-toolbar">
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
