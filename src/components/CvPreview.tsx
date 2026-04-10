import React from 'react';
import type { CVData } from '../App';
import type { TemplateName } from './TemplateSelector';
import { Edit3, Download, ExternalLink } from 'lucide-react';
import './CvPreview.css';

interface CvPreviewProps {
  data: CVData;
  template: TemplateName;
  onEdit: () => void;
}

const CvPreview: React.FC<CvPreviewProps> = ({ data, template, onEdit }) => {
  return (
    <div className="preview-container animate-fade-in">
      <div className="preview-controls">
        <button className="btn btn-secondary" onClick={onEdit}>
          <Edit3 size={18} style={{ marginRight: '8px' }} />
          Edit Data
        </button>
        <div className="actions">
          <button className="btn btn-secondary">
            <Download size={18} style={{ marginRight: '8px' }} />
            Export PDF
          </button>
          <button className="btn">
            <ExternalLink size={18} style={{ marginRight: '8px' }} />
            Publish Webpage
          </button>
        </div>
      </div>

      <div className="preview-canvas">
        <div className={`webpage-mockup template-${template}`}>
          <div className="browser-header">
            <div className="browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="browser-url">candi.data/{data.name.toLowerCase().replace(/\s+/g, '-') || 'your-name'}</div>
          </div>

          {template === 'modern' && <ModernTemplate data={data} />}
          {template === 'bold' && <BoldTemplate data={data} />}
          {template === 'classic' && <ClassicTemplate data={data} />}
          {template === 'minimal' && <MinimalTemplate data={data} />}
        </div>
      </div>
    </div>
  );
};

/* ─── Helpers ─── */
const hasContent = (arr: any[]) => arr && arr.length > 0 && arr.some((item: any) => {
  if (typeof item === 'string') return item.trim().length > 0;
  return Object.values(item).some((v: any) => v && v.trim && v.trim().length > 0);
});

/* ─── MODERN TEMPLATE ─── */
const ModernTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="cv-content cv-modern">
    <div className="cv-header">
      <div className="cv-profile-img modern-avatar">{(data.name || 'U').charAt(0)}</div>
      <div className="cv-header-text">
        <h1>{data.name || 'Your Name'}</h1>
        <p className="role-title">{data.role || 'Your Role'}</p>
        <div className="modern-contact">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>
    </div>
    <div className="cv-body">
      <div className="cv-main-col">
        {data.objective && (
          <section className="cv-section">
            <h2>About Me</h2>
            <p className="objective-text">{data.objective}</p>
          </section>
        )}
        {hasContent(data.experience) && (
          <section className="cv-section">
            <h2>Experience</h2>
            <div className="timeline">
              {data.experience.filter(e => e.position || e.company).map((exp, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h3>{exp.position}</h3>
                    <h4>{exp.company}{exp.duration && ` | ${exp.duration}`}</h4>
                    <p>{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {hasContent(data.education) && (
          <section className="cv-section">
            <h2>Education</h2>
            <div className="timeline">
              {data.education.filter(e => e.institution || e.degree).map((edu, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-dot" style={{ background: '#10b981' }}></div>
                  <div className="timeline-content">
                    <h3>{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                    <h4>{edu.institution}{edu.duration && ` | ${edu.duration}`}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="cv-side-col">
        {hasContent(data.skills) && (
          <section className="cv-section">
            <h2>Skills</h2>
            <div className="skills-tags">{data.skills.filter(Boolean).map((s, i) => <span className="skill-tag" key={i}>{s}</span>)}</div>
          </section>
        )}
        {hasContent(data.languages) && (
          <section className="cv-section">
            <h2>Languages</h2>
            <div className="lang-list">
              {data.languages.filter(l => l.name).map((l, i) => (
                <div className="lang-item" key={i}><strong>{l.name}</strong>{l.level && <span> — {l.level}</span>}</div>
              ))}
            </div>
          </section>
        )}
        {hasContent(data.certifications) && (
          <section className="cv-section">
            <h2>Certifications</h2>
            <ul className="cert-list">{data.certifications.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>
        )}
        {hasContent(data.interests) && (
          <section className="cv-section">
            <h2>Interests</h2>
            <div className="skills-tags">{data.interests.filter(Boolean).map((s, i) => <span className="skill-tag" key={i}>{s}</span>)}</div>
          </section>
        )}
        <section className="cv-section">
          <h2>Contact</h2>
          <div className="contact-info">
            {data.email && <p>{data.email}</p>}
            {data.website && <p>{data.website}</p>}
            {data.linkedin && <p>{data.linkedin}</p>}
          </div>
        </section>
      </div>
    </div>
  </div>
);

/* ─── BOLD TEMPLATE ─── */
const BoldTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="cv-content cv-bold">
    <div className="bold-hero">
      <div className="bold-avatar">{(data.name || 'U').charAt(0)}</div>
      <h1>{data.name || 'Your Name'}</h1>
      <p className="bold-role">{data.role || 'Your Role'}</p>
      <div className="bold-contact">
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}
      </div>
    </div>
    <div className="bold-body">
      {data.objective && (
        <div className="bold-section"><h2>Profile</h2><p>{data.objective}</p></div>
      )}
      {hasContent(data.experience) && (
        <div className="bold-section">
          <h2>Career</h2>
          {data.experience.filter(e => e.position || e.company).map((exp, idx) => (
            <div className="bold-exp" key={idx}>
              <div className="bold-exp-header"><strong>{exp.position}</strong><span className="bold-duration">{exp.duration}</span></div>
              <p className="bold-company">{exp.company}</p>
              <p className="bold-desc">{exp.description}</p>
            </div>
          ))}
        </div>
      )}
      {hasContent(data.education) && (
        <div className="bold-section">
          <h2>Education</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, idx) => (
            <div className="bold-exp" key={idx}>
              <div className="bold-exp-header"><strong>{edu.degree}{edu.field && ` — ${edu.field}`}</strong><span className="bold-duration">{edu.duration}</span></div>
              <p className="bold-company">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}
      <div className="bold-section-row">
        {hasContent(data.skills) && (
          <div className="bold-section"><h2>Skills</h2><div className="bold-skills">{data.skills.filter(Boolean).map((s, i) => <span key={i} className="bold-skill-chip">{s}</span>)}</div></div>
        )}
        {hasContent(data.languages) && (
          <div className="bold-section"><h2>Languages</h2><div className="bold-skills">{data.languages.filter(l => l.name).map((l, i) => <span key={i} className="bold-skill-chip">{l.name} {l.level && `(${l.level})`}</span>)}</div></div>
        )}
      </div>
    </div>
  </div>
);

/* ─── CLASSIC TEMPLATE ─── */
const ClassicTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="cv-content cv-classic">
    <div className="classic-header">
      <h1>{data.name || 'Your Name'}</h1>
      <div className="classic-divider"></div>
      <p className="classic-role">{data.role || 'Your Role'}</p>
      <div className="classic-contact">
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}
      </div>
    </div>
    <div className="classic-body">
      <div className="classic-left">
        {data.objective && (<section><h2>Summary</h2><p>{data.objective}</p></section>)}
        {hasContent(data.experience) && (
          <section>
            <h2>Experience</h2>
            {data.experience.filter(e => e.position || e.company).map((exp, idx) => (
              <div className="classic-exp" key={idx}>
                <h3>{exp.position}</h3>
                <p className="classic-meta">{exp.company} — {exp.duration}</p>
                <p>{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        {hasContent(data.education) && (
          <section>
            <h2>Education</h2>
            {data.education.filter(e => e.institution || e.degree).map((edu, idx) => (
              <div className="classic-exp" key={idx}>
                <h3>{edu.degree}{edu.field && ` in ${edu.field}`}</h3>
                <p className="classic-meta">{edu.institution} — {edu.duration}</p>
              </div>
            ))}
          </section>
        )}
      </div>
      <div className="classic-right">
        {hasContent(data.skills) && (<section><h2>Skills</h2><ul className="classic-skills">{data.skills.filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}</ul></section>)}
        {hasContent(data.languages) && (<section><h2>Languages</h2><ul className="classic-skills">{data.languages.filter(l => l.name).map((l, i) => <li key={i}>{l.name} {l.level && `— ${l.level}`}</li>)}</ul></section>)}
        {hasContent(data.certifications) && (<section><h2>Certifications</h2><ul className="classic-skills">{data.certifications.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}</ul></section>)}
        <section><h2>Contact</h2>{data.email && <p>{data.email}</p>}{data.website && <p>{data.website}</p>}{data.linkedin && <p>{data.linkedin}</p>}</section>
      </div>
    </div>
  </div>
);

/* ─── MINIMAL TEMPLATE ─── */
const MinimalTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <div className="cv-content cv-minimal">
    <div className="minimal-header">
      <h1>{data.name || 'Your Name'}</h1>
      <span className="minimal-role">{data.role || 'Your Role'}</span>
    </div>
    <div className="minimal-contact-bar">
      {data.email && <span>{data.email}</span>}
      {data.phone && <span>{data.phone}</span>}
      {data.location && <span>{data.location}</span>}
    </div>
    <div className="minimal-divider"></div>
    {data.objective && <><p className="minimal-summary">{data.objective}</p><div className="minimal-divider"></div></>}
    {hasContent(data.experience) && (
      <div className="minimal-section">
        <h2>Experience</h2>
        {data.experience.filter(e => e.position || e.company).map((exp, idx) => (
          <div className="minimal-exp" key={idx}>
            <div className="minimal-exp-top"><strong>{exp.position}</strong><span>{exp.duration}</span></div>
            <p className="minimal-company">{exp.company}</p>
            <p>{exp.description}</p>
          </div>
        ))}
      </div>
    )}
    {hasContent(data.education) && (
      <>
        <div className="minimal-divider"></div>
        <div className="minimal-section">
          <h2>Education</h2>
          {data.education.filter(e => e.institution || e.degree).map((edu, idx) => (
            <div className="minimal-exp" key={idx}>
              <div className="minimal-exp-top"><strong>{edu.degree}{edu.field && ` — ${edu.field}`}</strong><span>{edu.duration}</span></div>
              <p className="minimal-company">{edu.institution}</p>
            </div>
          ))}
        </div>
      </>
    )}
    <div className="minimal-divider"></div>
    <div className="minimal-footer-grid">
      {hasContent(data.skills) && (<div className="minimal-section"><h2>Skills</h2><p className="minimal-skills-text">{data.skills.filter(Boolean).join(' · ')}</p></div>)}
      {hasContent(data.languages) && (<div className="minimal-section"><h2>Languages</h2><p className="minimal-skills-text">{data.languages.filter(l => l.name).map(l => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(' · ')}</p></div>)}
    </div>
  </div>
);

export default CvPreview;
