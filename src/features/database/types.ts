import type { Person, Department, Assignment, Workspace } from '../../types';

export interface DatabaseBackup {
  version: string;
  exportedAt: string;
  workspaceId?: string;
  workspaceName?: string;
  isWorkspaceExport?: boolean;
  isMultiWorkspaceExport?: boolean;
  data: {
    persons: Person[];
    departments: Department[];
    assignments: Assignment[];
    workspace?: Workspace;
    workspaces?: Workspace[];
  };
}

export interface ImportOptions {
  mode: 'replace' | 'merge';
  clearBefore: boolean;
  targetWorkspaceId?: string;
  createNewWorkspace?: boolean;
  newWorkspaceName?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  summary?: {
    personsImported: number;
    departmentsImported: number;
    assignmentsImported: number;
    workspaceId?: string;
    workspaceName?: string;
    errors: string[];
  };
}

export interface ExportResult {
  success: boolean;
  message: string;
  data?: DatabaseBackup;
}

export interface ExportOptions {
  exportType: 'current' | 'all';
}
