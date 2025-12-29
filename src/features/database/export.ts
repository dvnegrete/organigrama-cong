import { db } from '../../db/schema';
import type { DatabaseBackup, ExportResult } from './types';

export const exportDatabase = async (): Promise<ExportResult> => {
  try {
    // Fetch all data from database
    const [persons, departments, assignments] = await Promise.all([
      db.persons.toArray(),
      db.departments.toArray(),
      db.assignments.toArray()
    ]);

    const backup: DatabaseBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        persons,
        departments,
        assignments
      }
    };

    return {
      success: true,
      message: `Successfully exported ${persons.length} persons, ${departments.length} departments, and ${assignments.length} assignments`,
      data: backup
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during export';
    return {
      success: false,
      message: `Failed to export database: ${message}`
    };
  }
};

export const exportWorkspace = async (workspaceId: string): Promise<ExportResult> => {
  try {
    const [persons, departments, assignments, workspace] = await Promise.all([
      db.persons.where('workspaceId').equals(workspaceId).toArray(),
      db.departments.where('workspaceId').equals(workspaceId).toArray(),
      db.assignments.where('workspaceId').equals(workspaceId).toArray(),
      db.workspaces.get(workspaceId)
    ]);

    if (!workspace) {
      return {
        success: false,
        message: `Workspace con ID ${workspaceId} no encontrado`
      };
    }

    const backup: DatabaseBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      workspaceId,
      workspaceName: workspace.name,
      isWorkspaceExport: true,
      data: {
        persons,
        departments,
        assignments,
        workspace
      }
    };

    return {
      success: true,
      message: `Successfully exported workspace "${workspace.name}" with ${persons.length} persons, ${departments.length} departments, and ${assignments.length} assignments`,
      data: backup
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during export';
    return {
      success: false,
      message: `Failed to export workspace: ${message}`
    };
  }
};

export const exportAllWorkspaces = async (): Promise<ExportResult> => {
  try {
    const [persons, departments, assignments, workspaces] = await Promise.all([
      db.persons.toArray(),
      db.departments.toArray(),
      db.assignments.toArray(),
      db.workspaces.toArray()
    ]);

    const backup: DatabaseBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      isWorkspaceExport: false,
      isMultiWorkspaceExport: true,
      data: {
        persons,
        departments,
        assignments,
        workspaces
      }
    };

    return {
      success: true,
      message: `Successfully exported ${workspaces.length} workspaces with ${persons.length} total persons, ${departments.length} total departments, and ${assignments.length} total assignments`,
      data: backup
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during export';
    return {
      success: false,
      message: `Failed to export all workspaces: ${message}`
    };
  }
};

export const downloadBackup = (backup: DatabaseBackup): void => {
  try {
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let filename = `organigrama_backup_${timestamp}.json`;

    // If it's a workspace export, include the workspace name in the filename
    if (backup.isWorkspaceExport && backup.workspaceName) {
      const sanitizedName = backup.workspaceName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      filename = `organigrama_${sanitizedName}_${timestamp}.json`;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
