import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { Assignment } from '../types';
import { generateUUID } from '../utils/uuid';
import { usePersons } from './usePersons';

export const useAssignments = () => {
  const { persons } = usePersons();

  // Get all assignments
  const assignments = useLiveQuery(() => db.assignments.toArray()) || [];

  const assignPersonToDepartment = async (personId: string, departmentId: string) => {
    // Check if assignment already exists
    const existing = await db.assignments
      .where('[personId+departmentId]')
      .equals([personId, departmentId])
      .first();

    if (existing) return; // Already assigned

    const assignment: Assignment = {
      id: generateUUID(),
      personId,
      departmentId,
      createdAt: new Date()
    };

    await db.assignments.add(assignment);
  };

  const unassignPersonFromDepartment = async (personId: string, departmentId: string) => {
    await db.assignments
      .where('[personId+departmentId]')
      .equals([personId, departmentId])
      .delete();
  };

  const getPeopleByDepartment = (departmentId: string) => {
    const personIds = assignments
      .filter((a) => a.departmentId === departmentId)
      .map((a) => a.personId);

    return persons.filter((p) => personIds.includes(p.id));
  };

  const getDepartmentsByPerson = (personId: string) => {
    return assignments
      .filter((a) => a.personId === personId)
      .map((a) => a.departmentId);
  };

  const getAssignmentCount = (departmentId: string) => {
    return assignments.filter((a) => a.departmentId === departmentId).length;
  };

  const isPersonAssignedToDepartment = (personId: string, departmentId: string) => {
    return assignments.some((a) => a.personId === personId && a.departmentId === departmentId);
  };

  const unassignPersonFromAllDepartments = async (personId: string) => {
    await db.assignments.where('personId').equals(personId).delete();
  };

  return {
    assignments,
    assignPersonToDepartment,
    unassignPersonFromDepartment,
    getPeopleByDepartment,
    getDepartmentsByPerson,
    getAssignmentCount,
    isPersonAssignedToDepartment,
    unassignPersonFromAllDepartments
  };
};
