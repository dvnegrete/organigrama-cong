import { useState } from 'react';
import { Filter, Trash2 } from 'lucide-react';
import type { Department } from '../../types';
import { useDepartments } from '../../hooks/useDepartments';
import { useAssignments } from '../../hooks/useAssignments';
import '../../styles/dashboard.css';

interface DepartmentFilterProps {
  departments: Department[];
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({ departments }) => {
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const { deleteDepartment } = useDepartments();
  const { getAssignmentCount } = useAssignments();

  const filteredDepartments = filterText.trim()
    ? departments.filter(
        dept =>
          dept.name.toLowerCase().includes(filterText.toLowerCase())
      )
    : departments;

  const handleDelete = async (dept: Department, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de que quieres eliminar el departamento "${dept.name}"?`)) {
      try {
        await deleteDepartment(dept.id);
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error al eliminar el departamento');
      }
    }
  };

  return (
    <>
      <div className="person-list-header">
        <div className="filter-header-container">
          <span>Total departamentos: {departments.length}</span>
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
            placeholder="Filtrar por nombre..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="filter-input"
            autoFocus
          />
        )}
      </div>

      {filteredDepartments.length === 0 && filterText ? (
        <div className="no-results-message">
          No se encontraron departamentos que coincidan con "{filterText}"
        </div>
      ) : (
        <div className="department-list">
          {filteredDepartments.map((dept, index) => {
            const personCount = getAssignmentCount(dept.id);
            return (
              <div key={dept.id} className="department-item">
                <div className="department-item-header">
                  <span className="department-item-index">{index + 1}</span>
                  <span className="department-item-name">{dept.name}</span>
                  {personCount > 0 && (
                    <span className="department-item-badge">{personCount}</span>
                  )}
                </div>
                <button
                  onClick={(e) => handleDelete(dept, e)}
                  className="btn-icon danger department-item-delete"
                  title="Eliminar departamento"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
