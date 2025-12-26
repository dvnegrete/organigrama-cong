import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowDown } from '@fortawesome/free-solid-svg-icons';
import { exportDatabase, downloadBackup } from '../../features/database';
import '../styles/database.css';

export const DatabaseBackupButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await exportDatabase();

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
      <button
        onClick={handleExport}
        disabled={isLoading}
        className="btn-export"
        title="Export database as JSON file"
      >
        <FontAwesomeIcon icon={faCloudArrowDown} />
        {isLoading ? ' Exportando...' : ' Exportar BD'}
      </button>

      {message && <div className="db-message success">{message}</div>}
      {error && <div className="db-message error">{error}</div>}
    </div>
  );
};
