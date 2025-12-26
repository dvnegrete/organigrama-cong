import React from 'react';
import { PersonFilter } from './PersonFilter';
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
      <PersonFilter persons={persons} draggingPersonId={draggingPersonId} />
    </div>
  );
};
