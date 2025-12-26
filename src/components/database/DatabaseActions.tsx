import { useState } from 'react';
import { DatabaseBackupButton } from './DatabaseBackupButton';
import { DatabaseImportDialog } from './DatabaseImportDialog';
import '../styles/database.css';

export const DatabaseActions: React.FC = () => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <div className="database-actions">
      <div className="db-actions-header">
        <h3>📊 Copia de Seguridad</h3>
      </div>

      <div className="db-actions-content">
        <DatabaseBackupButton />

        <button
          onClick={() => setIsImportDialogOpen(true)}
          className="btn-import"
          title="Import database from JSON file"
        >
          ⬆️ Importar BD
        </button>
      </div>

      <DatabaseImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      <div className="db-actions-info">
        <small>
          💡 Tip: Haz backup regularmente. Usa "Reemplazar" con cuidado ya que elimina todos los datos actuales.
        </small>
      </div>
    </div>
  );
};
