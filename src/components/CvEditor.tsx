import React, { useRef, useState, useCallback } from 'react';
import type { CVData, Experience, Education, Language } from '../App';
import { Save, User, Briefcase, GraduationCap, Award, Globe, Heart, Plus, Trash2, Upload, FileText, X, CloudUpload } from 'lucide-react';
import './CvEditor.css';

interface CvEditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onPreview: () => void;
  onSave: (data: CVData) => void;
  onReset: () => void;
  onImport: (files: File[]) => void;
  isImporting?: boolean;
}

const TagInput: React.FC<{
  tags: string[];
  placeholder: string;
  onChange: (tags: string[]) => void;
}> = ({ tags, placeholder, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="tag-input-wrapper">
      <div className="tag-list">
        {tags.map((tag, idx) => (
          <span key={idx} className="tag-pill">
            {tag}
            <button className="tag-remove" onClick={() => removeTag(tag)}><X size={12} /></button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="tag-bare-input"
        />
      </div>
    </div>
  );
};

const CvEditor: React.FC<CvEditorProps> = ({ data, onChange, onPreview, onSave, onReset, onImport, isImporting = false }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
        .includes(f.type) || f.name.match(/\.(pdf|docx|doc)$/i)
    );
    if (files.length) setStagedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setStagedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeStaged = (idx: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleExtract = () => {
    if (!stagedFiles.length) return;
    setShowImportModal(false);
    setStagedFiles([]);
    onImport(stagedFiles);
  };
  const updateField = (field: keyof CVData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateExperience = (idx: number, field: keyof Experience, value: string) => {
    const updated = [...data.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('experience', updated);
  };

  const addExperience = () => {
    updateField('experience', [...data.experience, { company: '', position: '', duration: '', description: '' }]);
  };

  const removeExperience = (idx: number) => {
    updateField('experience', data.experience.filter((_, i) => i !== idx));
  };

  const updateEducation = (idx: number, field: keyof Education, value: string) => {
    const updated = [...data.education];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('education', updated);
  };

  const addEducation = () => {
    updateField('education', [...data.education, { institution: '', degree: '', field: '', duration: '' }]);
  };

  const removeEducation = (idx: number) => {
    updateField('education', data.education.filter((_, i) => i !== idx));
  };

  const updateLanguage = (idx: number, field: keyof Language, value: string) => {
    const updated = [...data.languages];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField('languages', updated);
  };

  const addLanguage = () => {
    updateField('languages', [...data.languages, { name: '', level: '' }]);
  };

  const removeLanguage = (idx: number) => {
    updateField('languages', data.languages.filter((_, i) => i !== idx));
  };

  const handleLocalSave = () => {
    onSave(data);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="editor-container animate-fade-in">
      {/* ─── Import Modal ─── */}
      {showImportModal && (
        <div className="import-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="import-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="import-modal-header">
              <div className="import-modal-title">
                <CloudUpload size={22} />
                <span>Import from CV / Motivational Letter</span>
              </div>
              <button className="btn-icon" onClick={() => setShowImportModal(false)}><X size={20} /></button>
            </div>
            <p className="import-modal-sub">Upload your existing CV and/or Motivational Letter. Gemini AI will read the documents and automatically fill your profile fields.</p>

            {/* Drop zone */}
            <div
              className={`import-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} />
              <span>Drag &amp; drop files here, or <strong>click to browse</strong></span>
              <span className="import-drop-hint">Supported: PDF, DOCX, DOC</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
            </div>

            {/* Staged files list */}
            {stagedFiles.length > 0 && (
              <ul className="import-file-list">
                {stagedFiles.map((f, i) => (
                  <li key={i} className="import-file-item">
                    <FileText size={16} />
                    <span className="import-file-name">{f.name}</span>
                    <span className="import-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                    <button className="btn-icon danger" onClick={() => removeStaged(i)}><X size={14} /></button>
                  </li>
                ))}
              </ul>
            )}

            <div className="import-modal-actions">
              <button className="btn secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
              <button
                className="btn"
                disabled={stagedFiles.length === 0}
                onClick={handleExtract}
              >
                <Upload size={16} style={{ marginRight: '6px' }} />
                Extract &amp; Fill Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="editor-header">
        <h2>Edit Your <span className="gradient-text">Profile</span></h2>
        <div className="editor-header-actions">
          <button className="btn secondary reset-btn" onClick={onReset} title="Clear all data">
            <Trash2 size={16} />
          </button>
          <button className="btn secondary import-btn" onClick={() => setShowImportModal(true)} disabled={isImporting}>
            <Upload size={16} style={{ marginRight: '8px' }} />
            {isImporting ? 'Extracting…' : 'Import'}
          </button>
          <button className={`btn save-btn ${isSaved ? 'success' : ''}`} onClick={handleLocalSave}>
            <Save size={18} style={{ marginRight: '8px' }} />
            {isSaved ? 'Saved!' : 'Save Profile'}
          </button>
          <button className="btn primary-gradient" onClick={onPreview}>
            Choose Template
          </button>
        </div>
      </div>

      {/* ─── Personal Information ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><User size={20} /> Personal Information</div>
        <div className="field-grid cols-2">
          <div className="field-group">
            <label>Full Name</label>
            <input value={data.name} onChange={e => updateField('name', e.target.value)} placeholder="John Doe" />
          </div>
          <div className="field-group">
            <label>Professional Title</label>
            <input value={data.role} onChange={e => updateField('role', e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input type="email" value={data.email} onChange={e => updateField('email', e.target.value)} placeholder="john@example.com" />
          </div>
          <div className="field-group">
            <label>Phone</label>
            <input type="tel" value={data.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+1 234 567 890" />
          </div>
          <div className="field-group">
            <label>Location</label>
            <input value={data.location} onChange={e => updateField('location', e.target.value)} placeholder="New York, USA" />
          </div>
          <div className="field-group">
            <label>Website</label>
            <input value={data.website} onChange={e => updateField('website', e.target.value)} placeholder="https://johndoe.com" />
          </div>
          <div className="field-group full-width">
            <label>LinkedIn</label>
            <input value={data.linkedin} onChange={e => updateField('linkedin', e.target.value)} placeholder="https://linkedin.com/in/johndoe" />
          </div>
        </div>
      </section>

      {/* ─── Professional Summary ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><User size={20} /> Professional Summary</div>
        <div className="field-group">
          <label>Objective / Summary</label>
          <textarea rows={4} value={data.objective} onChange={e => updateField('objective', e.target.value)} placeholder="A brief professional summary that highlights your key strengths and career goals..." />
        </div>
      </section>

      {/* ─── Work Experience ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><Briefcase size={20} /> Work Experience</div>
        {data.experience.map((exp, idx) => (
          <div className="repeatable-block" key={idx}>
            <div className="block-header">
              <span className="block-number">{idx + 1}</span>
              {data.experience.length > 1 && (
                <button className="btn-icon danger" onClick={() => removeExperience(idx)}><Trash2 size={16} /></button>
              )}
            </div>
            <div className="field-grid cols-2">
              <div className="field-group">
                <label>Company</label>
                <input value={exp.company} onChange={e => updateExperience(idx, 'company', e.target.value)} placeholder="Company Name" />
              </div>
              <div className="field-group">
                <label>Position</label>
                <input value={exp.position} onChange={e => updateExperience(idx, 'position', e.target.value)} placeholder="Job Title" />
              </div>
              <div className="field-group full-width">
                <label>Duration</label>
                <input value={exp.duration} onChange={e => updateExperience(idx, 'duration', e.target.value)} placeholder="Jan 2020 - Present" />
              </div>
              <div className="field-group full-width">
                <label>Description</label>
                <textarea rows={3} value={exp.description} onChange={e => updateExperience(idx, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." />
              </div>
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={addExperience}><Plus size={16} /> Add Experience</button>
      </section>

      {/* ─── Education ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><GraduationCap size={20} /> Education</div>
        {data.education.map((edu, idx) => (
          <div className="repeatable-block" key={idx}>
            <div className="block-header">
              <span className="block-number">{idx + 1}</span>
              {data.education.length > 1 && (
                <button className="btn-icon danger" onClick={() => removeEducation(idx)}><Trash2 size={16} /></button>
              )}
            </div>
            <div className="field-grid cols-2">
              <div className="field-group">
                <label>Institution</label>
                <input value={edu.institution} onChange={e => updateEducation(idx, 'institution', e.target.value)} placeholder="University Name" />
              </div>
              <div className="field-group">
                <label>Degree</label>
                <input value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} placeholder="Bachelor of Science" />
              </div>
              <div className="field-group">
                <label>Field of Study</label>
                <input value={edu.field} onChange={e => updateEducation(idx, 'field', e.target.value)} placeholder="Computer Science" />
              </div>
              <div className="field-group">
                <label>Duration</label>
                <input value={edu.duration} onChange={e => updateEducation(idx, 'duration', e.target.value)} placeholder="2016 - 2020" />
              </div>
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={addEducation}><Plus size={16} /> Add Education</button>
      </section>

      {/* ─── Skills ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><Award size={20} /> Skills</div>
        <div className="field-group">
          <label>Professional Skills</label>
          <TagInput
            tags={data.skills}
            onChange={tags => updateField('skills', tags)}
            placeholder="Type a skill and press Enter (e.g. React, TypeScript...)"
          />
        </div>
      </section>

      {/* ─── Languages ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><Globe size={20} /> Languages</div>
        {data.languages.map((lang, idx) => (
          <div className="repeatable-block inline-block" key={idx}>
            <div className="field-grid cols-3">
              <div className="field-group">
                <label>Language</label>
                <input value={lang.name} onChange={e => updateLanguage(idx, 'name', e.target.value)} placeholder="English" />
              </div>
              <div className="field-group">
                <label>Proficiency</label>
                <select value={lang.level} onChange={e => updateLanguage(idx, 'level', e.target.value)}>
                  <option value="">Select level</option>
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              <div className="field-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                {data.languages.length > 1 && (
                  <button className="btn-icon danger" onClick={() => removeLanguage(idx)}><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={addLanguage}><Plus size={16} /> Add Language</button>
      </section>

      {/* ─── Certifications ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><Award size={20} /> Certifications</div>
        <div className="field-group">
          <label>Licenses & Certifications</label>
          <TagInput
            tags={data.certifications}
            onChange={tags => updateField('certifications', tags)}
            placeholder="Type a certification and press Enter..."
          />
        </div>
      </section>

      {/* ─── Interests ─── */}
      <section className="editor-section glass-panel">
        <div className="section-title"><Heart size={20} /> Interests</div>
        <div className="field-group">
          <label>Personal Interests</label>
          <TagInput
            tags={data.interests}
            onChange={tags => updateField('interests', tags)}
            placeholder="Type an interest and press Enter (e.g. Open Source, Hiking...)"
          />
        </div>
      </section>
    </div>
  );
};

export default CvEditor;
