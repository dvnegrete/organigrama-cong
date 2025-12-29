import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Person, Department, Assignment, Workspace } from '../types';
import { generateUUID } from '../utils/uuid';

export class OrganigramaDatabase extends Dexie {
  persons!: Table<Person, string>;
  departments!: Table<Department, string>;
  assignments!: Table<Assignment, string>;
  workspaces!: Table<Workspace, string>;

  constructor() {
    super('OrganigramaDB');

    this.version(1).stores({
      persons: 'id, name, createdAt',
      departments: 'id, name, createdAt',
      assignments: 'id, personId, departmentId, [personId+departmentId]'
    });

    this.version(2)
      .stores({
        persons: 'id, name, createdAt',
        departments: 'id, name, createdAt',
        assignments: 'id, personId, departmentId, [personId+departmentId], [departmentId+order]'
      })
      .upgrade(async (tx) => {
        const assignments = await tx.table('assignments').toArray();
        for (let i = 0; i < assignments.length; i++) {
          const assignment = assignments[i] as any;
          if (!('order' in assignment)) {
            assignment.order = i;
            await tx.table('assignments').put(assignment);
          }
        }
      });

    this.version(3)
      .stores({
        persons: 'id, workspaceId, name, createdAt, [workspaceId+name]',
        departments: 'id, workspaceId, name, createdAt, [workspaceId+name]',
        assignments: 'id, workspaceId, personId, departmentId, [personId+departmentId], [departmentId+order], [workspaceId+departmentId]',
        workspaces: 'id, name, createdAt, isDefault'
      })
      .upgrade(async (tx) => {
        // Create default workspace
        const defaultWorkspace: Workspace = {
          id: generateUUID(),
          name: 'Mi Organigrama',
          description: 'Espacio de trabajo principal',
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: true
        };

        await tx.table('workspaces').add(defaultWorkspace);
        localStorage.setItem('activeWorkspaceId', defaultWorkspace.id);

        // Migrate existing persons to default workspace
        const persons = await tx.table('persons').toArray();
        for (const person of persons) {
          const updatedPerson = { ...person, workspaceId: defaultWorkspace.id };
          await tx.table('persons').put(updatedPerson);
        }

        // Migrate existing departments to default workspace
        const departments = await tx.table('departments').toArray();
        for (const department of departments) {
          const updatedDepartment = { ...department, workspaceId: defaultWorkspace.id };
          await tx.table('departments').put(updatedDepartment);
        }

        // Migrate existing assignments to default workspace
        const assignments = await tx.table('assignments').toArray();
        for (const assignment of assignments) {
          const updatedAssignment = { ...assignment, workspaceId: defaultWorkspace.id };
          await tx.table('assignments').put(updatedAssignment);
        }
      });
  }
}

export const db = new OrganigramaDatabase();
