import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import type { Workspace } from '../types';
import { generateUUID } from '../utils/uuid';
import { useWorkspaceContext } from '../contexts/WorkspaceContext';

export const useWorkspaces = () => {
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceContext();

  // Get all workspaces
  const workspaces = useLiveQuery(() =>
    db.workspaces.orderBy('createdAt').toArray()
  ) || [];

  // Get active workspace
  const activeWorkspace = useLiveQuery(
    () => (activeWorkspaceId ? db.workspaces.get(activeWorkspaceId) : undefined),
    [activeWorkspaceId]
  );

  const createWorkspace = async (name: string, description: string = '') => {
    const now = new Date();
    const workspace: Workspace = {
      id: generateUUID(),
      name,
      description,
      createdAt: now,
      updatedAt: now,
      isDefault: false
    };
    await db.workspaces.add(workspace);
    return workspace;
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    await db.workspaces.update(id, { ...data, updatedAt: new Date() });
  };

  const deleteWorkspace = async (id: string) => {
    // Prevent deleting the active workspace
    if (id === activeWorkspaceId) {
      throw new Error('No se puede eliminar el espacio de trabajo activo. Por favor, cambia a otro primero.');
    }

    // Delete all related data in a transaction
    await db.transaction('rw', [db.persons, db.departments, db.assignments, db.workspaces], async () => {
      await db.persons.where('workspaceId').equals(id).delete();
      await db.departments.where('workspaceId').equals(id).delete();
      await db.assignments.where('workspaceId').equals(id).delete();
      await db.workspaces.delete(id);
    });
  };

  const renameWorkspace = async (id: string, name: string) => {
    await updateWorkspace(id, { name });
  };

  const switchWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
  };

  // Ensure we have at least one workspace, select first if activeWorkspaceId is null
  if (!activeWorkspaceId && workspaces.length > 0) {
    switchWorkspace(workspaces[0].id);
  }

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    renameWorkspace,
    switchWorkspace
  };
};
