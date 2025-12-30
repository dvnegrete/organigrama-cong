import { useState } from 'react';
import { Filter } from 'lucide-react';
import type { PersonWithDepartments } from '../../types';
import { PersonCard } from './PersonCard';
import '../../styles/dashboard.css';

interface PersonFilterProps {
  persons: PersonWithDepartments[];
  draggingPersonId?: string | null;
}

export const PersonFilter: React.FC<PersonFilterProps> = ({ persons, draggingPersonId }) => {
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredPersons = filterText.trim()
    ? persons.filter(
      person =>
        person.name.toLowerCase().includes(filterText.toLowerCase()) ||
        person.role.toLowerCase().includes(filterText.toLowerCase())
    )
    : persons;

  return (
    <>
      <div className="person-list-header">
        <div className="filter-header-container">
          <span>Total personas: {persons.length}</span>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`btn-filter ${showFilter ? 'active' : ''}`}
            title={showFilter ? 'Ocultar filtro' : 'Mostrar filtro'}
          >
            <Filter size={16} />
          </button>
        </div>
        {showFilter && (
          <input
            type="text"
            placeholder="Filtrar por nombre o rol..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
            autoFocus
          />
        )}
      </div>

      {filteredPersons.length === 0 && filterText ? (
        <div className="no-results-message">
          No se encontraron personas que coincidan con "{filterText}"
        </div>
      ) : (
        filteredPersons.map((person, index) => (
          <PersonCard
            key={person.id}
            person={person}
            isDragging={draggingPersonId === person.id}
            context="sidebar"
            showDeleteButton={true}
            personIndex={index + 1}
          />
        ))
      )}
    </>
  );
};
