import React, { useState } from 'react';
import type { Department } from '../../types';
import { useDepartments } from '../../hooks/useDepartments';
import { useAssignments } from '../../hooks/useAssignments';

interface DepartmentHeaderProps {
  department: Department;
  onDelete?: () => void;
}

export const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({ department, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(department.name);
  const { renameDepartment, deleteDepartment } = useDepartments();
  const { getAssignmentCount } = useAssignments();

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
            className="form-input"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1 }}
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
