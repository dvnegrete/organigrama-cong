import React from 'react';
import { PersonCard } from './PersonCard';
import { usePersons } from '../../hooks/usePersons';

interface PersonListProps {
  draggingPersonId?: string | null;
}

export const PersonList: React.FC<PersonListProps> = ({ draggingPersonId }) => {
  const { persons } = usePersons();

  if (persons.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👥</div>
        <div className="empty-state-text">
          No hay personas aún. Crea una nueva para empezar.
        </div>
      </div>
    );
  }

  return (
    <div className="person-list">
      {persons.map((person) => (
        <PersonCard
          key={person.id}
          person={person}
          isDragging={draggingPersonId === person.id}
          context="sidebar"
          showDeleteButton={true}
        />
      ))}
    </div>
  );
};
