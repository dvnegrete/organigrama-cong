import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { parseBackupFile, importDatabase, importToWorkspace, importAllWorkspaces } from '../../features/database';
import type { DatabaseBackup, ImportOptions } from '../../features/database';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import '../styles/database.css';

interface DatabaseImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

type DialogStep = 'file-select' | 'preview' | 'destination' | 'importing' | 'result';

const DEFAULT_WORKSPACE_NAME = 'Mi Organigrama';

// Detect if backup is from v1 (no workspace support)
const isLegacyV1Backup = (backup: DatabaseBackup): boolean => {
  // If it has workspace flags, it's not a v1 backup
  if (backup.isWorkspaceExport || backup.isMultiWorkspaceExport) {
    return false;
  }
  // If it has workspaceId, it's not a v1 backup
  if (backup.workspaceId) {
    return false;
  }
  // Check if data records have workspaceId - if first person doesn't have it, it's v1
  if (backup.data.persons.length > 0 && !backup.data.persons[0].workspaceId) {
    return true;
  }
  if (backup.data.departments.length > 0 && !backup.data.departments[0].workspaceId) {
    return true;
  }
  // If no data to check, assume it's v1 if no workspace fields
  return !backup.workspaceId && !backup.isWorkspaceExport;
};

export const DatabaseImportDialog: React.FC<DatabaseImportDialogProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [step, setStep] = useState<DialogStep>('file-select');
  const [backup, setBackup] = useState<DatabaseBackup | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [destinationMode, setDestinationMode] = useState<'current' | 'new'>('current');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { workspaces, activeWorkspace } = useWorkspaces();

  // Set initial workspace ID when workspaces change
  useEffect(() => {
    if (selectedWorkspaceId === '' && workspaces.length > 0) {
      setSelectedWorkspaceId(activeWorkspace?.id || workspaces[0].id);
    }
  }, [workspaces, activeWorkspace, selectedWorkspaceId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const parseResult = await parseBackupFile(file);

    if (parseResult.success && parseResult.data) {
      setBackup(parseResult.data);
      setStep('preview');
    } else {
      setError(parseResult.error || 'Failed to parse file');
    }
  };

  const handleImport = async () => {
    if (!backup) return;

    setIsImporting(true);
    setError(null);
    setStep('importing');

    try {
      let importResult;

      // Check if this is a multi-workspace export (Todos los espacios)
      if (backup.isMultiWorkspaceExport) {
        importResult = await importAllWorkspaces(backup);
      }
      // Check if this is a legacy v1 backup (no workspace support)
      else if (isLegacyV1Backup(backup)) {
        // Auto-create a new workspace with default name for v1 backups
        const options: ImportOptions = {
          mode: importMode,
          clearBefore: importMode === 'replace',
          createNewWorkspace: true,
          newWorkspaceName: DEFAULT_WORKSPACE_NAME
        };
        importResult = await importToWorkspace(backup, options);
      }
      // Check if this is a single workspace export and we're importing to a workspace
      else if (backup.isWorkspaceExport || destinationMode === 'new' || destinationMode === 'current') {
        const options: ImportOptions = {
          mode: importMode,
          clearBefore: importMode === 'replace',
          createNewWorkspace: destinationMode === 'new',
          newWorkspaceName: destinationMode === 'new' ? newWorkspaceName : undefined,
          targetWorkspaceId: destinationMode === 'current' ? selectedWorkspaceId : undefined
        };
        importResult = await importToWorkspace(backup, options);
      } else {
        // Full database import (backward compatible with v1.0)
        const options: ImportOptions = {
          mode: importMode,
          clearBefore: importMode === 'replace'
        };
        importResult = await importDatabase(backup, options);
      }

      setResult(importResult);
      setStep('result');

      // Close modal automatically after successful import
      if (importResult.success) {
        setTimeout(() => {
          const wasSuccessful = importResult.success;
          handleReset();
          onClose();
          if (wasSuccessful && onImportSuccess) {
            onImportSuccess();
          }
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error during import');
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep('file-select');
    setBackup(null);
    setImportMode('merge');
    setDestinationMode('current');
    setNewWorkspaceName('');
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    const wasSuccessful = step === 'result' && result?.success;
    handleReset();
    onClose();
    if (wasSuccessful && onImportSuccess) {
      onImportSuccess();
    }
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (step === 'preview') {
      // If it's a multi-workspace export, import directly
      if (backup?.isMultiWorkspaceExport) {
        handleImport();
      }
      // If it's a single workspace export, go to destination selection
      else if (backup?.isWorkspaceExport) {
        setStep('destination');
      } else {
        handleImport();
      }
    } else if (step === 'destination') {
      handleImport();
    } else if (step === 'result') {
      handleClose();
    }
  };

  const isDestinationValid = destinationMode === 'new' && !newWorkspaceName.trim() ? false : true;
  const isConfirmDisabled = isImporting || (step === 'file-select' && !backup) || (step === 'destination' && !isDestinationValid);
  const showConfirmButton = step !== 'file-select' || backup;
  const showCancelButton = step !== 'importing' && step !== 'result';

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Importar Base de Datos</h3>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="import-dialog-content">
        {step === 'file-select' && (
          <div className="import-step">
            <p>Selecciona un archivo de backup para importar:</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="file-input"
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {step === 'preview' && backup && (
          <div className="import-step">
            <h3>Vista Previa del Backup</h3>

            {isLegacyV1Backup(backup) && (
              <div className="workspace-import-info">
                <strong>Backup de versión anterior:</strong> Este archivo no contiene información de espacios de trabajo.
                Se creará automáticamente un nuevo espacio de trabajo llamado "{DEFAULT_WORKSPACE_NAME}".
              </div>
            )}

            {backup.isMultiWorkspaceExport && backup.data.workspaces && (
              <div className="workspace-import-info">
                <strong>Múltiples espacios de trabajo:</strong> Se importarán {backup.data.workspaces.length} espacios
                <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                  {backup.data.workspaces.map((ws) => (
                    <li key={ws.id}>{ws.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="preview-stats">
              <div className="stat">
                <strong>Personas:</strong> {backup.data.persons.length}
              </div>
              <div className="stat">
                <strong>Departamentos:</strong> {backup.data.departments.length}
              </div>
              <div className="stat">
                <strong>Asignaciones:</strong> {backup.data.assignments.length}
              </div>
              <div className="stat">
                <strong>Exportado:</strong> {new Date(backup.exportedAt).toLocaleString()}
              </div>
            </div>

            <div className="import-options">
              <label>
                <input
                  type="radio"
                  name="import-mode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) => setImportMode(e.target.value as 'merge')}
                />
                <strong>Fusionar:</strong> Añade datos sin eliminar existentes
              </label>
              <label>
                <input
                  type="radio"
                  name="import-mode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) => setImportMode(e.target.value as 'replace')}
                />
                <strong>Reemplazar:</strong> Elimina todo y carga el backup
              </label>
            </div>

            {importMode === 'replace' && (
              <div className="warning-message">
                ⚠️ Esto eliminará TODOS los datos del espacio de trabajo. Esta acción no se puede deshacer.
              </div>
            )}
          </div>
        )}

        {step === 'destination' && backup?.isWorkspaceExport && (
          <div className="import-step">
            <h3>Seleccionar Espacio de Trabajo Destino</h3>
            {backup.workspaceName && (
              <div className="source-info">
                <strong>Fuente:</strong> {backup.workspaceName} (exportado {new Date(backup.exportedAt).toLocaleString()})
              </div>
            )}

            <div className="destination-options">
              <label className="destination-option">
                <input
                  type="radio"
                  name="destination"
                  value="current"
                  checked={destinationMode === 'current'}
                  onChange={() => setDestinationMode('current')}
                />
                <div className="option-content">
                  <strong>Importar al espacio actual</strong>
                  {activeWorkspace && <p>{activeWorkspace.name}</p>}
                  {importMode === 'replace' && (
                    <p style={{ color: '#e74c3c', fontSize: '0.9em' }}>
                      ⚠️ Se reemplazarán todos los datos existentes en este espacio
                    </p>
                  )}
                </div>
              </label>

              <label className="destination-option">
                <input
                  type="radio"
                  name="destination"
                  value="new"
                  checked={destinationMode === 'new'}
                  onChange={() => setDestinationMode('new')}
                />
                <div className="option-content">
                  <strong>Crear nuevo espacio de trabajo</strong>
                  {destinationMode === 'new' && (
                    <input
                      type="text"
                      placeholder="Nombre del nuevo espacio (ej: Copia de Mi Organigrama)"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="workspace-name-input"
                      autoFocus
                    />
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="import-step">
            <p>⏳ Importando datos...</p>
          </div>
        )}

        {step === 'result' && result && (
          <div className="import-step">
            {result.success ? (
              <div className="success-result">
                <h3>✅ Importación Completada</h3>
                {result.summary?.workspaceName && (
                  <div className="workspace-import-info">
                    <strong>Espacio de trabajo:</strong> {result.summary.workspaceName}
                  </div>
                )}
                <div className="result-stats">
                  <div>Personas importadas: {result.summary?.personsImported || 0}</div>
                  <div>Departamentos importados: {result.summary?.departmentsImported || 0}</div>
                  <div>Asignaciones importadas: {result.summary?.assignmentsImported || 0}</div>
                </div>
                {result.summary?.errors && result.summary.errors.length > 0 && (
                  <div className="errors-section">
                    <strong>Errores ({result.summary.errors.length}):</strong>
                    <ul className="errors-list">
                      {result.summary.errors.slice(0, 5).map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                      {result.summary.errors.length > 5 && (
                        <li>... y {result.summary.errors.length - 5} más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="error-result">
                <h3>❌ Error en la Importación</h3>
                <p>{result.message}</p>
              </div>
            )}
          </div>
        )}
        </div>

        <div className="import-dialog-actions">
          {showCancelButton && (
            <button
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          )}
          {showConfirmButton && (
            <button
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={`btn ${(step === 'preview' || step === 'destination') && importMode === 'replace' ? 'btn-danger' : 'btn-primary'}`}
            >
              {step === 'preview' ? (backup?.isMultiWorkspaceExport ? 'Importar' : backup?.isWorkspaceExport ? 'Siguiente' : 'Importar') : step === 'destination' ? 'Importar' : step === 'result' ? 'Cerrar' : 'Siguiente'}
            </button>
          )}
          {step === 'importing' && (
            <span className="loading-text">
              ⏳ Procesando...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
