import React from 'react';
import { Rnd } from 'react-rnd';
import type { RndResizeCallback, RndDragCallback } from 'react-rnd';
import { DepartmentHeader } from './DepartmentHeader';
import { DepartmentPeople } from './DepartmentPeople';
import type { Department as DepartmentType } from '../../types';
import { useDepartments } from '../../hooks/useDepartments';

interface DepartmentProps {
  department: DepartmentType;
  onDelete?: () => void;
  draggingPersonId?: string | null;
}

export const Department: React.FC<DepartmentProps> = ({ department, onDelete, draggingPersonId }) => {
  const { moveDepartment, resizeDepartment } = useDepartments();

  const handleDragStop: RndDragCallback = (_e, d) => {
    moveDepartment(department.id, d.x, d.y);
  };

  const handleResizeStop: RndResizeCallback = (_e, _direction, ref, _delta, _position) => {
    const width = parseInt(ref.style.width);
    const height = parseInt(ref.style.height);
    resizeDepartment(department.id, width, height);
  };

  return (
    <Rnd
      key={department.id}
      position={department.position}
      size={department.size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={200}
      minHeight={150}
      enableResizing={true}
      default={{
        x: department.position.x,
        y: department.position.y,
        width: department.size.width,
        height: department.size.height
      }}
      className="rnd-container cursor-grab z-index-base"
    >
      <div className="department">
        <DepartmentHeader department={department} onDelete={onDelete} />
        <DepartmentPeople departmentId={department.id} draggingPersonId={draggingPersonId} />
      </div>
    </Rnd>
  );
};
