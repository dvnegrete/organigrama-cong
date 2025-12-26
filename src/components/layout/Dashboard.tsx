import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Sidebar } from './Sidebar';
import { DepartmentCanvas } from '../department/DepartmentCanvas';
import { PersonCard } from '../person/PersonCard';
import { useAssignments } from '../../hooks/useAssignments';
import type { Person, DragItem } from '../../types';
import {
  DRAG_ACTIVATION_DISTANCE,
  TOUCH_ACTIVATION_DELAY,
  TOUCH_ACTIVATION_TOLERANCE
} from '../../utils/constants';
import '../../../src/styles/dashboard.css';

export const Dashboard: React.FC = () => {
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const { assignPersonToDepartment, reorderPeopleInDepartment, getPeopleByDepartment } = useAssignments();

  // Configure sensors for drag and drop (mouse and touch)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: TOUCH_ACTIVATION_DELAY,
        tolerance: TOUCH_ACTIVATION_TOLERANCE
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;

    if (data?.type === 'person') {
      setActiveDragItem({
        type: 'person',
        person: data.person
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    // Handle person reordering within a department
    if (typeof active.id === 'string' && active.id.startsWith('sortable-person-') && over.data.current?.type === 'Department') {
      const departmentId = over.data.current.departmentId;
      const draggedPersonId = active.id.replace('sortable-person-', '');

      try {
        // Get the current order of people in the department
        const people = getPeopleByDepartment(departmentId);
        const currentOrder = people.map((p) => p.id);

        // Find the index of the dragged person
        const draggedIndex = currentOrder.indexOf(draggedPersonId);

        // Get the position to insert (based on over element)
        let insertIndex = 0;
        if (typeof over.id === 'string' && over.id.startsWith('sortable-person-')) {
          const overPersonId = over.id.replace('sortable-person-', '');
          insertIndex = currentOrder.indexOf(overPersonId);
        }

        if (draggedIndex !== -1 && draggedIndex !== insertIndex) {
          // Reorder the array
          const newOrder = currentOrder.filter((id) => id !== draggedPersonId);
          newOrder.splice(insertIndex > draggedIndex ? insertIndex - 1 : insertIndex, 0, draggedPersonId);

          // Update the order in the database
          await reorderPeopleInDepartment(departmentId, newOrder);
        }
      } catch (error) {
        console.error('Error reordering people:', error);
      }
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle person drag events from sidebar
    if (activeData?.type !== 'person' || !overData) return;

    const person = activeData.person as Person;

    // Check if dropped over a department
    if (overData.type === 'Department') {
      const departmentId = overData.departmentId;
      try {
        await assignPersonToDepartment(person.id, departmentId);
      } catch (error) {
        console.error('Error assigning person to department:', error);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="dashboard">
        <Sidebar draggingPersonId={activeDragItem?.type === 'person' ? activeDragItem.person.id : null} />
        <DepartmentCanvas draggingPersonId={activeDragItem?.type === 'person' ? activeDragItem.person.id : null} />
      </div>

      <DragOverlay>
        {activeDragItem && activeDragItem.type === 'person' ? (
          <div className="drag-overlay-item">
            <PersonCard
              person={activeDragItem.person}
              isDragging={true}
              showDeleteButton={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
