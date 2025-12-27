import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { parseBackupFile, importDatabase } from '../../features/database';
import type { DatabaseBackup, ImportOptions } from '../../features/database';
import '../styles/database.css';

interface DatabaseImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

type DialogStep = 'file-select' | 'preview' | 'importing' | 'result';

export const DatabaseImportDialog: React.FC<DatabaseImportDialogProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [step, setStep] = useState<DialogStep>('file-select');
  const [backup, setBackup] = useState<DatabaseBackup | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const options: ImportOptions = {
      mode: importMode,
      clearBefore: importMode === 'replace'
    };

    const importResult = await importDatabase(backup, options);
    setResult(importResult);
    setStep('result');
    setIsImporting(false);
  };

  const handleReset = () => {
    setStep('file-select');
    setBackup(null);
    setImportMode('merge');
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
      handleImport();
    } else if (step === 'result') {
      handleClose();
    }
  };

  const isConfirmDisabled = isImporting || (step === 'file-select' && !backup);
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
            <FontAwesomeIcon icon={faTimes} />
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
                ⚠️ Esto eliminará TODOS los datos actuales. Esta acción no se puede deshacer.
              </div>
            )}
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
              className={`btn ${step === 'preview' && importMode === 'replace' ? 'btn-danger' : 'btn-primary'}`}
            >
              {step === 'preview' ? 'Importar' : step === 'result' ? 'Cerrar' : 'Siguiente'}
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
