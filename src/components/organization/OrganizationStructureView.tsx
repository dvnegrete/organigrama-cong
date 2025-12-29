import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useDepartments } from '../../hooks/useDepartments';
import { useAssignments } from '../../hooks/useAssignments';
import '../styles/organization.css';

export const OrganizationStructureView: React.FC = () => {
  const { departments } = useDepartments();
  const { getPeopleByDepartment } = useAssignments();
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Initialize all departments as expanded when they change
    setExpandedDepartments(new Set(departments.map(d => d.id)));
  }, [departments]);

  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  return (
    <div className="organization-structure-view">
      <div className="structure-header">
        <h2 className="structure-title">Estructura Organizacional</h2>
      </div>

      <div className="structure-content">
        {departments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">
              No hay departamentos para mostrar
            </div>
          </div>
        ) : (
          <div className="departments-list">
            {departments.map((department) => {
              const deptPeople = getPeopleByDepartment(department.id);
              const isExpanded = expandedDepartments.has(department.id);

              return (
                <div key={department.id} className="department-structure-item">
                  <button
                    className="department-structure-header"
                    onClick={() => toggleDepartment(department.id)}
                  >
                    <div className="department-structure-title">
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className="chevron-icon"
                      />
                      <span className="department-name">{department.name}</span>
                      <span className="department-counter">
                        {deptPeople.length}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="department-structure-content">
                      {deptPeople.length === 0 ? (
                        <div className="no-people">
                          <span>Sin personas asignadas</span>
                        </div>
                      ) : (
                        <div className="people-list">
                          {deptPeople.map((person) => (
                            <div
                              key={person.id}
                              className="person-structure-item"
                            >
                              <div className="person-structure-info">
                                <div className="person-structure-name">
                                  {person.name}
                                </div>
                                <div className="person-structure-role">
                                  {person.role}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
