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

    // Get the current max order for this department
    const departmentAssignments = await db.assignments
      .where('departmentId')
      .equals(departmentId)
      .toArray();

    const maxOrder = departmentAssignments.length > 0
      ? Math.max(...departmentAssignments.map(a => a.order || 0))
      : -1;

    const assignment: Assignment = {
      id: generateUUID(),
      personId,
      departmentId,
      order: maxOrder + 1,
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
    const departmentAssignments = assignments
      .filter((a) => a.departmentId === departmentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return departmentAssignments
      .map((a) => persons.find((p) => p.id === a.personId))
      .filter((p): p is typeof persons[0] => p !== undefined);
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

  const reorderPeopleInDepartment = async (departmentId: string, orderedPersonIds: string[]) => {
    const updates = orderedPersonIds.map((personId, index) => {
      const assignment = assignments.find(
        (a) => a.personId === personId && a.departmentId === departmentId
      );

      if (!assignment) throw new Error(`Assignment not found for person ${personId}`);

      return {
        ...assignment,
        order: index
      };
    });

    await db.assignments.bulkPut(updates);
  };

  return {
    assignments,
    assignPersonToDepartment,
    unassignPersonFromDepartment,
    getPeopleByDepartment,
    getDepartmentsByPerson,
    getAssignmentCount,
    isPersonAssignedToDepartment,
    unassignPersonFromAllDepartments,
    reorderPeopleInDepartment
  };
};
