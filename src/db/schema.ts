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
  }
}

export const db = new OrganigramaDatabase();
