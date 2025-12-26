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
  const { assignPersonToDepartment } = useAssignments();

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

    const activeData = active.data.current;
    const overData = over.data.current;

    // Only handle person drag events
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
