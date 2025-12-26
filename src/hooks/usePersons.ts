import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { Person, PersonWithDepartments } from '../types';
import { generateUUID } from '../utils/uuid';

export const usePersons = () => {
  // Get all persons
  const persons = useLiveQuery(() => db.persons.toArray()) || [];

  // Get all assignments to enrich persons data
  const assignments = useLiveQuery(() => db.assignments.toArray()) || [];

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

  const createPerson = async (data: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const person: Person = {
      id: generateUUID(),
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
