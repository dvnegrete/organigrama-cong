import { db } from '../../db/schema';
import type { DatabaseBackup, ImportOptions, ImportResult } from './types';
import type { Workspace } from '../../types';
import { validateBackup } from './validation';
import { generateUUID } from '../../utils/uuid';

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

export const importAllWorkspaces = async (
  backup: DatabaseBackup
): Promise<ImportResult> => {
  try {
    if (!backup.data.workspaces || backup.data.workspaces.length === 0) {
      return {
        success: false,
        message: 'El backup no contiene información de espacios de trabajo'
      };
    }

    const errors: string[] = [];
    let totalPersonsImported = 0;
    let totalDepartmentsImported = 0;
    let totalAssignmentsImported = 0;
    const importedWorkspaces: string[] = [];

    // Import each workspace with its data
    for (const workspace of backup.data.workspaces) {
      try {
        // Check if workspace already exists
        const existingWorkspace = await db.workspaces.get(workspace.id);

        if (!existingWorkspace) {
          // Create workspace
          await db.workspaces.add(workspace);
        }
        importedWorkspaces.push(workspace.name);

        // Import persons for this workspace
        for (const person of backup.data.persons) {
          if (person.workspaceId === workspace.id) {
            try {
              await db.persons.put(person);
              totalPersonsImported++;
            } catch (error) {
              errors.push(`Failed to import person ${person.id} to workspace ${workspace.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        // Import departments for this workspace
        for (const department of backup.data.departments) {
          if (department.workspaceId === workspace.id) {
            try {
              await db.departments.put(department);
              totalDepartmentsImported++;
            } catch (error) {
              errors.push(`Failed to import department ${department.id} to workspace ${workspace.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        // Import assignments for this workspace
        for (const assignment of backup.data.assignments) {
          if (assignment.workspaceId === workspace.id) {
            try {
              // Verify person and department exist
              const personExists = await db.persons.get(assignment.personId);
              const deptExists = await db.departments.get(assignment.departmentId);

              if (personExists && deptExists) {
                await db.assignments.put(assignment);
                totalAssignmentsImported++;
              } else {
                errors.push(`Skipping assignment ${assignment.id} in workspace ${workspace.name}: person or department not found`);
              }
            } catch (error) {
              errors.push(`Failed to import assignment ${assignment.id} to workspace ${workspace.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
      } catch (error) {
        errors.push(`Error processing workspace ${workspace.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Importación completada. Se importaron ${importedWorkspaces.length} espacios de trabajo${errors.length > 0 ? ` con ${errors.length} errores` : ''}`,
      summary: {
        personsImported: totalPersonsImported,
        departmentsImported: totalDepartmentsImported,
        assignmentsImported: totalAssignmentsImported,
        workspaceName: `${importedWorkspaces.length} espacios: ${importedWorkspaces.join(', ')}`,
        errors
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to import all workspaces: ${message}`
    };
  }
};

export const importToWorkspace = async (
  backup: DatabaseBackup,
  options: ImportOptions
): Promise<ImportResult> => {
  try {
    let targetWorkspaceId: string;
    let workspaceName: string;

    // Determine target workspace
    if (options.createNewWorkspace) {
      // Create a new workspace
      if (!options.newWorkspaceName) {
        return {
          success: false,
          message: 'El nombre del nuevo espacio de trabajo es requerido'
        };
      }

      const newWorkspace: Workspace = {
        id: generateUUID(),
        name: options.newWorkspaceName,
        description: backup.isWorkspaceExport
          ? `Importado desde: ${backup.workspaceName || 'Respaldo de espacio de trabajo'}`
          : 'Importado desde respaldo completo',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false
      };

      await db.workspaces.add(newWorkspace);
      targetWorkspaceId = newWorkspace.id;
      workspaceName = newWorkspace.name;
    } else if (options.targetWorkspaceId) {
      // Use specified workspace
      const workspace = await db.workspaces.get(options.targetWorkspaceId);
      if (!workspace) {
        return {
          success: false,
          message: `Espacio de trabajo con ID ${options.targetWorkspaceId} no encontrado`
        };
      }
      targetWorkspaceId = options.targetWorkspaceId;
      workspaceName = workspace.name;
    } else {
      return {
        success: false,
        message: 'Debe especificar el espacio de trabajo de destino o crear uno nuevo'
      };
    }

    // Clear workspace data if needed
    if (options.clearBefore) {
      await db.transaction('rw', [db.persons, db.departments, db.assignments], async () => {
        await db.persons.where('workspaceId').equals(targetWorkspaceId).delete();
        await db.departments.where('workspaceId').equals(targetWorkspaceId).delete();
        await db.assignments.where('workspaceId').equals(targetWorkspaceId).delete();
      });
    }

    const errors: string[] = [];
    let personsImported = 0;
    let departmentsImported = 0;
    let assignmentsImported = 0;

    // Generate mapping of old IDs to new IDs if creating new workspace
    const idMap = new Map<string, string>();

    // Import persons
    for (const person of backup.data.persons) {
      try {
        let newPersonId = person.id;

        if (options.createNewWorkspace) {
          // Regenerate IDs to avoid conflicts
          newPersonId = generateUUID();
          idMap.set(person.id, newPersonId);
        }

        const personToImport = {
          ...person,
          id: newPersonId,
          workspaceId: targetWorkspaceId
        };

        if (options.mode === 'replace' || options.createNewWorkspace) {
          await db.persons.put(personToImport);
        } else {
          // In merge mode, only add if not exists
          const existing = await db.persons.get(newPersonId);
          if (!existing) {
            await db.persons.put(personToImport);
          }
        }
        personsImported++;
      } catch (error) {
        errors.push(`Failed to import person: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import departments
    for (const department of backup.data.departments) {
      try {
        let newDepartmentId = department.id;

        if (options.createNewWorkspace) {
          // Regenerate IDs to avoid conflicts
          newDepartmentId = generateUUID();
          idMap.set(department.id, newDepartmentId);
        }

        const departmentToImport = {
          ...department,
          id: newDepartmentId,
          workspaceId: targetWorkspaceId
        };

        if (options.mode === 'replace' || options.createNewWorkspace) {
          await db.departments.put(departmentToImport);
        } else {
          const existing = await db.departments.get(newDepartmentId);
          if (!existing) {
            await db.departments.put(departmentToImport);
          }
        }
        departmentsImported++;
      } catch (error) {
        errors.push(`Failed to import department: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import assignments
    for (const assignment of backup.data.assignments) {
      try {
        let newPersonId = assignment.personId;
        let newDepartmentId = assignment.departmentId;

        // Map old IDs to new IDs if needed
        if (options.createNewWorkspace) {
          newPersonId = idMap.get(assignment.personId) || assignment.personId;
          newDepartmentId = idMap.get(assignment.departmentId) || assignment.departmentId;
        }

        // Verify person and department exist
        const personExists = await db.persons.get(newPersonId);
        const deptExists = await db.departments.get(newDepartmentId);

        if (personExists && deptExists) {
          const assignmentToImport = {
            id: options.createNewWorkspace ? generateUUID() : assignment.id,
            workspaceId: targetWorkspaceId,
            personId: newPersonId,
            departmentId: newDepartmentId,
            order: assignment.order,
            createdAt: assignment.createdAt
          };

          if (options.mode === 'replace' || options.createNewWorkspace) {
            await db.assignments.put(assignmentToImport);
          } else {
            const existing = await db.assignments.get(assignmentToImport.id);
            if (!existing) {
              await db.assignments.put(assignmentToImport);
            }
          }
          assignmentsImported++;
        } else {
          errors.push(
            `Skipping assignment: person or department not found`
          );
        }
      } catch (error) {
        errors.push(`Failed to import assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Importación a "${workspaceName}" completada con ${errors.length} errores`,
      summary: {
        personsImported,
        departmentsImported,
        assignmentsImported,
        workspaceId: targetWorkspaceId,
        workspaceName,
        errors
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to import to workspace: ${message}`
    };
  }
};
