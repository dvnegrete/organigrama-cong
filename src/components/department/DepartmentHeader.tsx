import React, { useState } from 'react';
import type { Department } from '../../types';
import { useDepartments } from '../../hooks/useDepartments';
import { useAssignments } from '../../hooks/useAssignments';
import { PersonPicker } from '../person/PersonPicker';

interface DepartmentHeaderProps {
  department: Department;
  onDelete?: () => void;
}

export const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({ department, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(department.name);
  const [showPersonPicker, setShowPersonPicker] = useState(false);
  const { renameDepartment, deleteDepartment } = useDepartments();
  const { getAssignmentCount, assignPersonToDepartment } = useAssignments();

  const personCount = getAssignmentCount(department.id);

  const handleSaveName = async () => {
    if (name.trim() && name !== department.name) {
      try {
        await renameDepartment(department.id, name.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Error renaming department:', error);
        setName(department.name);
      }
    } else {
      setIsEditing(false);
      setName(department.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setName(department.name);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el departamento "${department.name}"?`)) {
      try {
        await deleteDepartment(department.id);
        onDelete?.();
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error al eliminar el departamento');
      }
    }
  };

  const handleAddPerson = () => {
    setShowPersonPicker(true);
  };

  const handleSelectPerson = async (personId: string) => {
    try {
      await assignPersonToDepartment(personId, department.id);
    } catch (error) {
      console.error('Error assigning person:', error);
      alert('Error al asignar la persona');
    }
  };

  return (
    <div className="department-header">
      <div className="department-title">
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleKeyDown}
            className="form-input flex-grow"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="department-title-text"
            onClick={() => setIsEditing(true)}
            title="Haz clic para editar el nombre"
          >
            {department.name}
            <span className="department-counter">{personCount}</span>
          </div>
        )}
      </div>

      <div className="department-actions">
        <div className="person-picker-container">
          <button
            onClick={handleAddPerson}
            className="btn-icon"
            title="Agregar Persona"
            type="button"
          >
            +
          </button>
          {showPersonPicker && (
            <PersonPicker
              departmentId={department.id}
              onSelect={handleSelectPerson}
              onClose={() => setShowPersonPicker(false)}
            />
          )}
        </div>
        <button
          onClick={handleDelete}
          className="btn-icon danger"
          title="Eliminar departamento"
          type="button"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
