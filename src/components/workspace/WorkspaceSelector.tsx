import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import './workspace-selector.css';

export const WorkspaceSelector: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspaces();

  const handleWorkspaceSelect = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setIsExpanded(false);
  };

  return (
    <div className="workspace-selector">
      <button
        className="workspace-selector-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Seleccionar espacio de trabajo"
      >
        <span className="workspace-selector-name">
          {activeWorkspace?.name || 'Seleccionar...'}
        </span>
        {isExpanded ? <ChevronUp size={16} className="workspace-selector-icon" /> : <ChevronDown size={16} className="workspace-selector-icon" />}
      </button>

      {isExpanded && (
        <div className="workspace-dropdown">
          <div className="workspace-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-item ${
                  workspace.id === activeWorkspace?.id ? 'active' : ''
                }`}
                onClick={() => handleWorkspaceSelect(workspace.id)}
              >
                <span className="workspace-item-name">{workspace.name}</span>
                {workspace.id === activeWorkspace?.id && (
                  <Check size={16} className="workspace-check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div
          className="workspace-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
