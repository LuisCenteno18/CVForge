import React from 'react';
import { X, Plus, Clock, Trash2, FileText, Settings } from 'lucide-react';
import type { Session } from '../App';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  activeSessionId: string | null;
  onSwitch: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreate: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSwitch,
  onDelete,
  onCreate,
  onOpenSettings
}) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Saved <span className="gradient-text">Sessions</span></h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <button className="btn sidebar-add-btn" onClick={onCreate}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          New Session
        </button>

        <div className="sidebar-list">
          {sessions.length === 0 ? (
            <div className="sidebar-empty">
              <FileText size={48} />
              <p>No saved sessions yet.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`sidebar-item ${activeSessionId === session.id ? 'active' : ''}`}
                onClick={() => onSwitch(session.id)}
              >
                <div className="sidebar-item-info">
                  <div className="sidebar-item-name">{session.name || 'Untitled Profile'}</div>
                  <div className="sidebar-item-date">
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    {formatDate(session.updatedAt)}
                  </div>
                </div>
                <button
                  className="btn-icon danger sidebar-item-delete"
                  onClick={(e) => onDelete(session.id, e)}
                  title="Delete session"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-settings-btn" onClick={onOpenSettings}>
            <Settings size={18} style={{ marginRight: '8px' }} />
            API Settings
          </button>
          <div className="sidebar-stats">
            <p>{sessions.length} sessions stored locally</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
