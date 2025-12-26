import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Person, Department, Assignment } from '../types';

export class OrganigramaDatabase extends Dexie {
  persons!: Table<Person, string>;
  departments!: Table<Department, string>;
  assignments!: Table<Assignment, string>;

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
  }
}

export const db = new OrganigramaDatabase();
