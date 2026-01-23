import React, { useState, useEffect, useRef } from 'react';
import { usePersons } from '../../hooks/usePersons';
import { useAssignments } from '../../hooks/useAssignments';

interface PersonPickerProps {
  departmentId: string;
  onSelect: (personId: string) => void;
  onClose: () => void;
}

export const PersonPicker: React.FC<PersonPickerProps> = ({
  departmentId,
  onSelect,
  onClose,
}) => {
  const [searchText, setSearchText] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { persons } = usePersons();
  const { isPersonAssignedToDepartment } = useAssignments();

  // Filter persons: not assigned to this department and matching search
  const filteredPersons = persons.filter((person) => {
    const isAssigned = isPersonAssignedToDepartment(person.id, departmentId);
    if (isAssigned) return false;

    if (!searchText.trim()) return true;

    const searchLower = searchText.toLowerCase();
    const nameMatch = person.name.toLowerCase().includes(searchLower);
    const roleMatch = person.role?.toLowerCase().includes(searchLower);

    return nameMatch || roleMatch;
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = (personId: string) => {
    onSelect(personId);
    onClose();
  };

  return (
    <div className="person-picker-dropdown" ref={pickerRef}>
      <input
        ref={inputRef}
        type="text"
        className="person-picker-search"
        placeholder="Buscar persona..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
      <div className="person-picker-list">
        {filteredPersons.length === 0 ? (
          <div className="person-picker-empty">
            {searchText ? 'No se encontraron personas' : 'No hay personas disponibles'}
          </div>
        ) : (
          filteredPersons.map((person) => (
            <div
              key={person.id}
              className="person-picker-item"
              onClick={() => handleSelect(person.id)}
            >
              <div className="person-picker-item-name">{person.name}</div>
              {person.role && (
                <div className="person-picker-item-role">{person.role}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
