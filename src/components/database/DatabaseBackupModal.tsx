import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { DatabaseBackupButton } from './DatabaseBackupButton';
import { DatabaseImportDialog } from './DatabaseImportDialog';
import '../styles/database.css';

export const DatabaseBackupModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-backup-modal"
        title="Exportar o importar base de datos"
      >
        <FontAwesomeIcon icon={faCloudArrowUp} />
      </button>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content backup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📊 Copia de Seguridad</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="backup-modal-content">
              <div className="backup-section">
                <h4>Exportar Base de Datos</h4>
                <p>Descarga una copia de seguridad de todos tus datos</p>
                <DatabaseBackupButton />
              </div>

              <div className="backup-divider"></div>

              <div className="backup-section">
                <h4>Importar Base de Datos</h4>
                <p>Carga una copia de seguridad anterior</p>
                <button
                  onClick={() => setIsImportDialogOpen(true)}
                  className="btn-import"
                >
                  <FontAwesomeIcon icon={faCloudArrowUp} />
                  {' Importar BD'}
                </button>
              </div>

              <div className="backup-info">
                💡 Usa "Reemplazar" con cuidado ya que elimina todos los datos actuales.
              </div>
            </div>
          </div>
        </div>
      )}

      <DatabaseImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImportSuccess={() => {
          setIsImportDialogOpen(false);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};
