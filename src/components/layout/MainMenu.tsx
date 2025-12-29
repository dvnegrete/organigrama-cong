import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faList, faEye, faEyeSlash, faDatabase } from '@fortawesome/free-solid-svg-icons';
import '../../styles/main-menu.css';

interface MainMenuProps {
  onToggleStructureView: () => void;
  onToggleSidebar: () => void;
  onOpenDatabaseModal: () => void;
  isSidebarVisible: boolean;
  isStructureViewOpen: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onToggleStructureView,
  onToggleSidebar,
  onOpenDatabaseModal,
  isSidebarVisible,
  isStructureViewOpen
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    // Don't close menu immediately to allow user to see changes
    setTimeout(() => setIsMenuOpen(false), 100);
  };

  return (
    <div className="main-menu">
      <button
        className="main-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Abrir menú"
        aria-label="Abrir menú"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {isMenuOpen && (
        <div className="main-menu-dropdown">
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onToggleStructureView)}
          >
            <FontAwesomeIcon icon={faList} className="menu-icon" />
            <span>
              {isStructureViewOpen
                ? 'Ver Tablero (Editar)'
                : 'Ver Estructura Organizacional'}
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onToggleSidebar)}
          >
            <FontAwesomeIcon
              icon={isSidebarVisible ? faEyeSlash : faEye}
              className="menu-icon"
            />
            <span>
              {isSidebarVisible
                ? 'Ocultar Barra Lateral'
                : 'Mostrar Barra Lateral'}
            </span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onOpenDatabaseModal)}
          >
            <FontAwesomeIcon icon={faDatabase} className="menu-icon" />
            <span>Importar/Exportar Base de Datos</span>
          </button>
        </div>
      )}

      {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
    </div>
  );
};
