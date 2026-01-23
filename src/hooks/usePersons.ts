import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { Person, PersonWithDepartments } from '../types';
import { generateUUID } from '../utils/uuid';
import { useWorkspaceContext } from '../contexts/WorkspaceContext';

export const usePersons = () => {
  const { activeWorkspaceId } = useWorkspaceContext();

  // Get all persons for active workspace
  const persons = useLiveQuery(() => {
    if (!activeWorkspaceId) return [];
    return db.persons
      .where('workspaceId')
      .equals(activeWorkspaceId)
      .toArray();
  }, [activeWorkspaceId]) || [];

  // Get all assignments for active workspace
  const assignments = useLiveQuery(() => {
    if (!activeWorkspaceId) return [];
    return db.assignments
      .where('workspaceId')
      .equals(activeWorkspaceId)
      .toArray();
  }, [activeWorkspaceId]) || [];

  // Enrich persons with their department assignments
  const personsWithDepartments: PersonWithDepartments[] = persons.map((person) => {
    const departmentIds = assignments
      .filter((a) => a.personId === person.id)
      .map((a) => a.departmentId);

    return {
      ...person,
      departmentIds,
      isAssigned: departmentIds.length > 0
    };
  });

  const createPerson = async (data: Omit<Person, 'id' | 'workspaceId' | 'createdAt' | 'updatedAt'>) => {
    if (!activeWorkspaceId) {
      throw new Error('No hay espacio de trabajo activo');
    }

    const now = new Date();
    const person: Person = {
      id: generateUUID(),
      workspaceId: activeWorkspaceId,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    await db.persons.add(person);
    return person;
  };

  const updatePerson = async (id: string, data: Partial<Person>) => {
    await db.persons.update(id, { ...data, updatedAt: new Date() });
  };

  const deletePerson = async (id: string) => {
    // Delete all assignments for this person
    await db.assignments.where('personId').equals(id).delete();
    // Delete the person
    await db.persons.delete(id);
  };

  const getPersonById = (id: string) => {
    return personsWithDepartments.find((p) => p.id === id);
  };

  return {
    persons: personsWithDepartments,
    createPerson,
    updatePerson,
    deletePerson,
    getPersonById
  };
};
