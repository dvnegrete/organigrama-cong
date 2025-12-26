import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { Department } from '../types';
import { generateUUID } from '../utils/uuid';
import {
  DEFAULT_DEPARTMENT_WIDTH,
  DEFAULT_DEPARTMENT_HEIGHT,
  DEFAULT_DEPARTMENT_START_X,
  DEFAULT_DEPARTMENT_START_Y
} from '../utils/constants';

export const useDepartments = () => {
  // Get all departments
  const departments = useLiveQuery(() => db.departments.toArray()) || [];

  const createDepartment = async (
    name: string = 'Nuevo Departamento',
    position?: { x: number; y: number }
  ) => {
    const now = new Date();
    const department: Department = {
      id: generateUUID(),
      name,
      position: position || {
        x: DEFAULT_DEPARTMENT_START_X,
        y: DEFAULT_DEPARTMENT_START_Y
      },
      size: {
        width: DEFAULT_DEPARTMENT_WIDTH,
        height: DEFAULT_DEPARTMENT_HEIGHT
      },
      createdAt: now,
      updatedAt: now
    };
    await db.departments.add(department);
    return department;
  };

  const updateDepartment = async (id: string, data: Partial<Department>) => {
    await db.departments.update(id, { ...data, updatedAt: new Date() });
  };

  const deleteDepartment = async (id: string) => {
    // Delete all assignments for this department
    await db.assignments.where('departmentId').equals(id).delete();
    // Delete the department
    await db.departments.delete(id);
  };

  const getDepartmentById = (id: string) => {
    return departments.find((d) => d.id === id);
  };

  const moveDepartment = async (id: string, x: number, y: number) => {
    await updateDepartment(id, {
      position: { x, y }
    });
  };

  const resizeDepartment = async (id: string, width: number, height: number) => {
    await updateDepartment(id, {
      size: { width, height }
    });
  };

  const renameDepartment = async (id: string, name: string) => {
    await updateDepartment(id, { name });
  };

  return {
    departments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    moveDepartment,
    resizeDepartment,
    renameDepartment
  };
};
