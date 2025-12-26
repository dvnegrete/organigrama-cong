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

export const downloadBackup = (backup: DatabaseBackup): void => {
  try {
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `organigrama_backup_${timestamp}.json`;

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
