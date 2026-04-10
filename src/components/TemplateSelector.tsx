import React from 'react';
import { Layout, Palette, Sparkles, Monitor } from 'lucide-react';
import './TemplateSelector.css';

export type TemplateName = 'modern' | 'bold' | 'classic' | 'minimal';

interface TemplateSelectorProps {
  selected: TemplateName;
  onSelect: (template: TemplateName) => void;
  onPreview: () => void;
}

const templates: { id: TemplateName; name: string; description: string; icon: React.ReactNode; colors: string[] }[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean layout with gradient accents and a professional feel.',
    icon: <Layout size={24} />,
    colors: ['#8b5cf6', '#3b82f6', '#ffffff'],
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Dark theme with strong typography and vibrant highlights.',
    icon: <Sparkles size={24} />,
    colors: ['#f59e0b', '#ef4444', '#0f172a'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless serif design with elegant spacing and subtle tones.',
    icon: <Palette size={24} />,
    colors: ['#1e3a5f', '#c9a96e', '#faf8f5'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean with maximum whitespace and crisp mono accents.',
    icon: <Monitor size={24} />,
    colors: ['#111827', '#6b7280', '#ffffff'],
  },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selected, onSelect, onPreview }) => {
  return (
    <div className="template-selector-container animate-fade-in">
      <div className="template-header">
        <h2>Choose Your <span className="gradient-text">Template</span></h2>
        <p>Select a design that best represents your professional identity.</p>
      </div>

      <div className="templates-grid">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className={`template-card glass-panel ${selected === tmpl.id ? 'selected' : ''}`}
            onClick={() => onSelect(tmpl.id)}
          >
            <div className="template-preview">
              {/* Mini CV mockup */}
              <div className="mini-mockup" style={{ background: tmpl.colors[2] }}>
                <div className="mini-header" style={{ background: tmpl.colors[0] }}></div>
                <div className="mini-body">
                  <div className="mini-avatar" style={{ background: tmpl.colors[0] }}></div>
                  <div className="mini-lines">
                    <div className="mini-line" style={{ background: tmpl.colors[0], width: '70%' }}></div>
                    <div className="mini-line" style={{ background: tmpl.colors[1], width: '50%', opacity: 0.5 }}></div>
                  </div>
                </div>
                <div className="mini-content">
                  <div className="mini-line-sm" style={{ background: tmpl.colors[0], opacity: 0.2 }}></div>
                  <div className="mini-line-sm" style={{ background: tmpl.colors[0], opacity: 0.15 }}></div>
                  <div className="mini-line-sm" style={{ background: tmpl.colors[0], opacity: 0.1 }}></div>
                  <div className="mini-tags">
                    <span style={{ background: tmpl.colors[0], opacity: 0.15 }}></span>
                    <span style={{ background: tmpl.colors[1], opacity: 0.15 }}></span>
                    <span style={{ background: tmpl.colors[0], opacity: 0.1 }}></span>
                  </div>
                </div>
              </div>
              {selected === tmpl.id && (
                <div className="selected-badge">
                  <Sparkles size={14} /> Selected
                </div>
              )}
            </div>
            <div className="template-info">
              <div className="template-name">
                {tmpl.icon}
                <h3>{tmpl.name}</h3>
              </div>
              <p>{tmpl.description}</p>
              <div className="color-swatches">
                {tmpl.colors.map((c, i) => (
                  <span key={i} className="swatch" style={{ background: c }}></span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="template-actions">
        <button className="btn" onClick={onPreview}>
          Generate Webpage Preview
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;
