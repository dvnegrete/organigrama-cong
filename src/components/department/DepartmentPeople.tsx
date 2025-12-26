import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PersonCard } from '../person/PersonCard';
import { useAssignments } from '../../hooks/useAssignments';

interface DepartmentPeopleProps {
  departmentId: string;
  draggingPersonId?: string | null;
}

export const DepartmentPeople: React.FC<DepartmentPeopleProps> = ({ departmentId, draggingPersonId: _draggingPersonId }) => {
  const { getPeopleByDepartment, unassignPersonFromDepartment } = useAssignments();
  const { setNodeRef, isOver } = useDroppable({
    id: `department-drop-${departmentId}`,
    data: {
      type: 'Department',
      departmentId
    }
  });

  const people = getPeopleByDepartment(departmentId);

  const handleUnassign = async (personId: string) => {
    try {
      await unassignPersonFromDepartment(personId, departmentId);
    } catch (error) {
      console.error('Error unassigning person:', error);
      alert('Error al desasignar la persona');
    }
  };

  const containerClass = [
    'department-people',
    people.length === 0 && 'empty',
    isOver && 'drag-over'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={setNodeRef} className={containerClass}>
      {people.length === 0 ? (
        <div style={{ textAlign: 'center', fontSize: '12px' }}>
          Arrastra personas aquí
        </div>
      ) : (
        people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            isDragging={false}
            context="department"
            showDeleteButton={false}
            departmentId={departmentId}
            onUnassign={handleUnassign}
          />
        ))
      )}
    </div>
  );
};
