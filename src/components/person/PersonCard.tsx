import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Person, PersonWithDepartments } from '../../types';
import { usePersons } from '../../hooks/usePersons';

interface PersonCardProps {
  person: Person | PersonWithDepartments;
  onDelete?: (personId: string) => void;
  onUnassign?: (personId: string) => void;
  isDragging?: boolean;
  showDeleteButton?: boolean;
  context?: 'sidebar' | 'department';
  departmentId?: string;
  personIndex?: number;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onDelete,
  onUnassign,
  isDragging = false,
  showDeleteButton = true,
  context = 'sidebar',
  departmentId: _departmentId,
  personIndex,
}) => {
  const { deletePerson } = usePersons();

  // Solo hacer draggable en el sidebar
  const isDraggableContext = context === 'sidebar';

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `person-${person.id}`,
    data: {
      type: 'person',
      person
    },
    disabled: !isDraggableContext
  });

  const isAssigned = 'isAssigned' in person ? person.isAssigned : false;
  const departmentCount = 'departmentIds' in person ? person.departmentIds.length : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${person.name}?`)) {
      try {
        await deletePerson(person.id);
        onDelete?.(person.id);
      } catch (error) {
        console.error('Error deleting person:', error);
        alert('Error al eliminar la persona');
      }
    }
  };

  const handleUnassign = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      onUnassign?.(person.id);
    } catch (error) {
      console.error('Error unassigning person:', error);
      alert('Error al desasignar la persona');
    }
  };

  // Solo aplicar transform cuando es draggable (sidebar)
  const style = isDraggableContext && transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1
      }
    : undefined;

  const cardClass = [
    'person-card',
    isAssigned && 'assigned',
    isDragging && isDraggableContext && 'dragging',
    context && `context-${context}`
  ]
    .filter(Boolean)
    .join(' ');

  const cardStyle = {
    ...style,
    cursor: isDraggableContext ? 'grab' : 'default'
  };

  return (
    <div
      ref={setNodeRef}
      className={cardClass}
      style={cardStyle}
      {...(isDraggableContext ? attributes : {})}
      {...(isDraggableContext ? listeners : {})}
    >
      <div className="person-info">
        <div className="person-name">
          <span className='person-index'>{personIndex}</span>
          {person.name}
        </div>
        {person.role && context === 'department' && <div className="person-role">{person.role}</div>}
      </div>

      <div className="person-actions">
        {context === 'sidebar' && isAssigned && departmentCount > 0 && (
          <span className="person-badge">{departmentCount}</span>
        )}
        {context === 'department' && (
          <button
            onClick={handleUnassign}
            className="btn-icon danger"
            title="Desasignar de este departamento"
            type="button"
          >
            ×
          </button>
        )}
        {showDeleteButton && context === 'sidebar' && (
          <button
            onClick={handleDelete}
            className="btn-icon danger"
            title="Eliminar persona"
            type="button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
