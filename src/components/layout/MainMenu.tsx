import React, { useState } from 'react';
import { Menu, List, Eye, EyeOff, Database, Layers } from 'lucide-react';
import '../../styles/main-menu.css';

interface MainMenuProps {
  onToggleStructureView: () => void;
  onToggleSidebar: () => void;
  onOpenDatabaseModal: () => void;
  onOpenWorkspaceManager: () => void;
  isSidebarVisible: boolean;
  isStructureViewOpen: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onToggleStructureView,
  onToggleSidebar,
  onOpenDatabaseModal,
  onOpenWorkspaceManager,
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
        <Menu size={24} />
      </button>

      {isMenuOpen && (
        <div className="main-menu-dropdown">
          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onToggleStructureView)}
          >
            <List size={20} className="menu-icon" />
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
            {isSidebarVisible ? <EyeOff size={20} className="menu-icon" /> : <Eye size={20} className="menu-icon" />}
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
            <Database size={20} className="menu-icon" />
            <span>Importar/Exportar Base de Datos</span>
          </button>

          <button
            className="menu-item"
            onClick={() => handleMenuItemClick(onOpenWorkspaceManager)}
          >
            <Layers size={20} className="menu-icon" />
            <span>Gestionar Espacios de Trabajo</span>
          </button>
        </div>
      )}

      {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />}
    </div>
  );
};
