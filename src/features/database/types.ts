import type { Person, Department, Assignment } from '../../types';

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  data: {
    persons: Person[];
    departments: Department[];
    assignments: Assignment[];
  };
}

export interface ImportOptions {
  mode: 'replace' | 'merge';
  clearBefore: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  summary?: {
    personsImported: number;
    departmentsImported: number;
    assignmentsImported: number;
    errors: string[];
  };
}

export interface ExportResult {
  success: boolean;
  message: string;
  data?: DatabaseBackup;
}
