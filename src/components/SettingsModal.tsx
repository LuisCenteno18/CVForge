import React, { useState, useEffect } from 'react';
import { X, Key, Shield, ExternalLink, Eye, EyeOff, Save } from 'lucide-react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedToken = localStorage.getItem('cvforge_github_token') || '';
      setToken(savedToken);
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('cvforge_github_token', token);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose} />
      <div className="modal-content settings-modal animate-slide-up glass-panel">
        <div className="modal-header">
          <div className="header-title">
            <Shield className="gradient-text" size={24} />
            <h3>API <span className="gradient-text">Settings</span></h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <section className="settings-section">
            <div className="section-info">
              <label>GitHub Personal Access Token</label>
              <p className="text-muted">
                Required for high-speed AI extraction and job matching via GitHub Models. 
                Stored only in your browser.
              </p>
            </div>

            <div className="token-input-wrapper">
              <div className="input-with-icon">
                <Key size={18} className="input-icon" />
                <input
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="settings-input"
                />
                <button 
                  className="input-action" 
                  onClick={() => setShowToken(!showToken)}
                  title={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="settings-help">
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="help-link"
              >
                Get a token from GitHub <ExternalLink size={14} />
              </a>
              <span className="help-tip">Requires <code>models:read</code> scope</span>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-info">
              <label>Privacy & Security</label>
              <p className="text-muted">
                Your key is never sent to our servers. It is used directly from your browser to call the AI endpoints.
                This prevents your key from being leaked in the website's source code.
              </p>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`btn btn-primary ${isSaved ? 'success' : ''}`} 
            onClick={handleSave}
            disabled={isSaved}
          >
            {isSaved ? (
              <span className="flex-center"><Save size={18} style={{marginRight: '8px'}}/> Saved!</span>
            ) : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
