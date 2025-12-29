import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { exportDatabase, downloadBackup, exportWorkspace, exportAllWorkspaces } from '../../features/database';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import '../styles/database.css';

type ExportType = 'current-workspace' | 'all-workspaces' | 'all-data';

export const DatabaseBackupButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportType, setExportType] = useState<ExportType>('current-workspace');
  const { activeWorkspace } = useWorkspaces();

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      let result;

      if (exportType === 'current-workspace' && activeWorkspace) {
        result = await exportWorkspace(activeWorkspace.id);
      } else if (exportType === 'all-workspaces') {
        result = await exportAllWorkspaces();
      } else {
        result = await exportDatabase();
      }

      if (result.success && result.data) {
        setMessage(result.message);
        downloadBackup(result.data);
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="database-backup-button">
      <div className="export-options">
        <label>
          <input
            type="radio"
            value="current-workspace"
            checked={exportType === 'current-workspace'}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            disabled={isLoading}
          />
          Espacio actual ({activeWorkspace?.name || 'Sin nombre'})
        </label>
        <label>
          <input
            type="radio"
            value="all-workspaces"
            checked={exportType === 'all-workspaces'}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            disabled={isLoading}
          />
          Todos los espacios
        </label>
        <label>
          <input
            type="radio"
            value="all-data"
            checked={exportType === 'all-data'}
            onChange={(e) => setExportType(e.target.value as ExportType)}
            disabled={isLoading}
          />
          Toda la base de datos (compatible v1.0)
        </label>
      </div>

      <button
        onClick={handleExport}
        disabled={isLoading}
        className="btn-export"
        title="Export database as JSON file"
      >
        <FontAwesomeIcon icon={faCloudArrowDown} />
        {isLoading ? ' Exportando...' : ' Exportar'}
      </button>

      {message && <div className="db-message success">{message}</div>}
      {error && <div className="db-message error">{error}</div>}
    </div>
  );
};
