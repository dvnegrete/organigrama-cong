import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PersonCard } from '../person/PersonCard';
import { useAssignments } from '../../hooks/useAssignments';
import type { Person } from '../../types';

interface DepartmentPeopleProps {
  departmentId: string;
  draggingPersonId?: string | null;
}

interface SortablePersonCardProps {
  person: Person;
  departmentId: string;
  onUnassign: (personId: string) => void;
}

const SortablePersonCard: React.FC<SortablePersonCardProps> = ({ person, departmentId, onUnassign }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ id: `sortable-person-${person.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-person-wrapper ${isDragging ? 'dragging' : ''} ${isOver ? 'over' : ''}`}
      {...attributes}
      {...listeners}
    >
      <PersonCard
        person={person}
        isDragging={isDragging}
        context="department"
        showDeleteButton={false}
        departmentId={departmentId}
        onUnassign={onUnassign}
      />
    </div>
  );
};

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
  const personIds = people.map((p) => `sortable-person-${p.id}`);

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
        <div className="text-center text-small">
          Arrastra personas aquí
        </div>
      ) : (
        <SortableContext
          items={personIds}
          strategy={verticalListSortingStrategy}
        >
          {people.map((person) => (
            <SortablePersonCard
              key={person.id}
              person={person}
              departmentId={departmentId}
              onUnassign={handleUnassign}
            />
          ))}
        </SortableContext>
      )}
    </div>
  );
};
