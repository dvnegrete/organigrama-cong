import React, { useState } from 'react';
import { useDepartments } from '../../hooks/useDepartments';

interface CreateDepartmentButtonProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const CreateDepartmentButton: React.FC<CreateDepartmentButtonProps> = ({
  containerRef
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { createDepartment } = useDepartments();

  const handleCreateDepartment = async () => {
    try {
      setIsLoading(true);

      // Calculate center position if we have a container
      let position = { x: 50, y: 50 };
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        position = {
          x: Math.max(50, rect.width / 2 - 150),
          y: Math.max(50, rect.height / 2 - 200)
        };
      }

      await createDepartment('Nuevo Departamento', position);
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Error al crear el departamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateDepartment}
      disabled={isLoading}
      className="btn btn-primary create-department-button"
      title="Crear un nuevo departamento"
    >
      {isLoading ? 'Creando...' : '+ Nuevo Departamento'}
    </button>
  );
};
