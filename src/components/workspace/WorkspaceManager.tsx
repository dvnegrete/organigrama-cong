import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import './workspace-manager.css';

interface WorkspaceManagerProps {
  onClose: () => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ onClose }) => {
  const { workspaces, activeWorkspace, createWorkspace, renameWorkspace, deleteWorkspace } =
    useWorkspaces();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setError('El nombre del espacio de trabajo es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createWorkspace(newWorkspaceName, newWorkspaceDescription);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      // Close modal after successful creation
      setTimeout(() => onClose(), 300);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el espacio de trabajo';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRenameWorkspace = async (id: string, newName: string) => {
    if (!newName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await renameWorkspace(id, newName);
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al renombrar el espacio de trabajo';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteWorkspace(id);
      setDeleteConfirmId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el espacio de trabajo';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startEditingWorkspace = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
    setError(null);
  };

  const cancelEditingWorkspace = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="workspace-manager-overlay">
      <div className="workspace-manager-modal">
        <div className="workspace-manager-header">
          <h2>Gestionar Espacios de Trabajo</h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="workspace-manager-content">
          {/* Create Workspace Section */}
          <div className="create-workspace-section">
            <h3>Crear Nuevo Espacio de Trabajo</h3>
            <div className="form-group">
              <label htmlFor="workspace-name">Nombre</label>
              <input
                id="workspace-name"
                type="text"
                placeholder="Nombre del espacio de trabajo"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workspace-description">Descripción (opcional)</label>
              <textarea
                id="workspace-description"
                placeholder="Descripción del espacio de trabajo"
                value={newWorkspaceDescription}
                onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>

            <button
              className="create-button"
              onClick={handleCreateWorkspace}
              disabled={loading || !newWorkspaceName.trim()}
            >
              <Plus size={16} />
              Crear Espacio de Trabajo
            </button>
          </div>

          {/* Workspaces List Section */}
          <div className="workspaces-list-section">
            <h3>Espacios de Trabajo Existentes ({workspaces.length})</h3>

            {workspaces.length === 0 ? (
              <div className="empty-workspaces">
                <p>No hay espacios de trabajo disponibles</p>
              </div>
            ) : (
              <div className="workspaces-list">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`workspace-card ${
                      workspace.id === activeWorkspace?.id ? 'active' : ''
                    }`}
                  >
                    <div className="workspace-info">
                      {editingId === workspace.id ? (
                        <input
                          type="text"
                          className="workspace-name-edit"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          disabled={loading}
                        />
                      ) : (
                        <div className="workspace-details">
                          <div className="workspace-name">
                            {workspace.name}
                            {workspace.id === activeWorkspace?.id && (
                              <span className="active-badge">Activo</span>
                            )}
                          </div>
                          {workspace.description && (
                            <div className="workspace-description">{workspace.description}</div>
                          )}
                          <div className="workspace-meta">
                            Creado: {new Date(workspace.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="workspace-actions">
                      {editingId === workspace.id ? (
                        <>
                          <button
                            className="action-button confirm"
                            onClick={() => handleRenameWorkspace(workspace.id, editingName)}
                            disabled={loading}
                            title="Guardar"
                          >
                            ✓
                          </button>
                          <button
                            className="action-button cancel"
                            onClick={cancelEditingWorkspace}
                            disabled={loading}
                            title="Cancelar"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-button edit"
                            onClick={() => startEditingWorkspace(workspace.id, workspace.name)}
                            disabled={loading}
                            title="Renombrar"
                          >
                            <Pencil size={16} />
                          </button>

                          {deleteConfirmId === workspace.id ? (
                            <>
                              <button
                                className="action-button confirm-delete"
                                onClick={() => handleDeleteWorkspace(workspace.id)}
                                disabled={loading}
                                title="Confirmar eliminación"
                              >
                                Confirmar
                              </button>
                              <button
                                className="action-button cancel"
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={loading}
                                title="Cancelar"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              className="action-button delete"
                              onClick={() => setDeleteConfirmId(workspace.id)}
                              disabled={workspace.id === activeWorkspace?.id || loading}
                              title={
                                workspace.id === activeWorkspace?.id
                                  ? 'No se puede eliminar el espacio activo'
                                  : 'Eliminar'
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Cerrar</button>
            </div>
          )}
        </div>

        <div className="workspace-manager-footer">
          <button className="close-modal-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
