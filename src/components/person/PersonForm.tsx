import React, { useState } from 'react';
import { usePersons } from '../../hooks/usePersons';

interface PersonFormProps {
  onPersonAdded?: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({ onPersonAdded }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createPerson } = usePersons();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor ingresa un nombre');
      return;
    }

    try {
      setIsLoading(true);
      await createPerson({
        name: name.trim(),
        role: role.trim()
      });

      // Reset form
      setName('');
      setRole('');
      onPersonAdded?.();
      setIsExpanded(false);
    } catch (error) {
      console.error('Error creating person:', error);
      alert('Error al crear la persona');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="person-form">
      {!isExpanded ? (
        <button
          type="button"
          className="btn btn-primary full-width"
          onClick={() => setIsExpanded(true)}
        >
          + Agregar Persona
        </button>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label" htmlFor="person-name">
              Nombre
            </label>
            <input
              id="person-name"
              type="text"
              className="form-input"
              placeholder="Ej: Juan García"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="person-role">
              Privilegio/Rol
            </label>
            <input
              id="person-role"
              type="text"
              className="form-input"
              placeholder="Ej: Administrador"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex-row">
            <button
              type="submit"
              className="btn btn-primary flex-grow"
              disabled={isLoading}
            >
              {isLoading ? 'Agregando...' : 'Agregar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary flex-grow"
              onClick={() => setIsExpanded(false)}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </form>
  );
};
