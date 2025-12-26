import { db } from '../../db/schema';
import type { DatabaseBackup, ImportOptions, ImportResult } from './types';
import { validateBackup } from './validation';

export const parseBackupFile = async (file: File): Promise<{ success: boolean; data?: DatabaseBackup; error?: string }> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const validation = validateBackup(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid backup file:\n${validation.errors.join('\n')}`
      };
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to parse backup file: ${message}`
    };
  }
};

export const importDatabase = async (
  backup: DatabaseBackup,
  options: ImportOptions
): Promise<ImportResult> => {
  try {
    // Clear database if needed
    if (options.clearBefore) {
      await Promise.all([
        db.persons.clear(),
        db.departments.clear(),
        db.assignments.clear()
      ]);
    }

    const errors: string[] = [];
    let personsImported = 0;
    let departmentsImported = 0;
    let assignmentsImported = 0;

    // Import persons
    for (const person of backup.data.persons) {
      try {
        if (options.mode === 'replace') {
          await db.persons.put(person);
        } else {
          // In merge mode, only add if not exists
          const existing = await db.persons.get(person.id);
          if (!existing) {
            await db.persons.put(person);
          }
        }
        personsImported++;
      } catch (error) {
        errors.push(`Failed to import person ${person.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import departments
    for (const department of backup.data.departments) {
      try {
        if (options.mode === 'replace') {
          await db.departments.put(department);
        } else {
          const existing = await db.departments.get(department.id);
          if (!existing) {
            await db.departments.put(department);
          }
        }
        departmentsImported++;
      } catch (error) {
        errors.push(`Failed to import department ${department.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import assignments
    for (const assignment of backup.data.assignments) {
      try {
        // Verify person and department exist
        const personExists = await db.persons.get(assignment.personId);
        const deptExists = await db.departments.get(assignment.departmentId);

        if (personExists && deptExists) {
          if (options.mode === 'replace') {
            await db.assignments.put(assignment);
          } else {
            const existing = await db.assignments.get(assignment.id);
            if (!existing) {
              await db.assignments.put(assignment);
            }
          }
          assignmentsImported++;
        } else {
          errors.push(
            `Skipping assignment ${assignment.id}: person or department not found`
          );
        }
      } catch (error) {
        errors.push(`Failed to import assignment ${assignment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Import completed with ${errors.length} errors`,
      summary: {
        personsImported,
        departmentsImported,
        assignmentsImported,
        errors
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to import database: ${message}`
    };
  }
};
