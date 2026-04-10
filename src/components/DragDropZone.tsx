import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, PenTool } from 'lucide-react';
import './DragDropZone.css';

interface DragDropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  onManualEntry: () => void;
}

const DragDropZone: React.FC<DragDropZoneProps> = ({ onFilesAccepted, onManualEntry }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesAccepted(acceptedFiles);
    }
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <div className="drag-drop-container animate-fade-in">
      <div 
        {...getRootProps()} 
        className={`dropzone glass-panel ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="icon-container glass-panel">
            <UploadCloud size={48} className="upload-icon" />
          </div>
          <h2>{isDragActive ? "Drop files here..." : "Drag & Drop your files"}</h2>
          <p className="subtitle">Upload your CV and Motivational Letter (.pdf, .doc, .docx)</p>
          
          <div className="file-badges">
            <div className="badge"><FileText size={16} /> CV / Resume</div>
            <div className="badge"><FileText size={16} /> Motivational Letter</div>
          </div>
          
          <button className="btn mt-4">Browse Files</button>
        </div>
      </div>

      <div className="divider-row">
        <div className="divider-line"></div>
        <span className="divider-text">or</span>
        <div className="divider-line"></div>
      </div>

      <button className="manual-entry-btn glass-panel" onClick={(e) => { e.stopPropagation(); onManualEntry(); }}>
        <PenTool size={22} />
        <div>
          <strong>Build from Scratch</strong>
          <span>Manually fill in your CV details using our editor</span>
        </div>
      </button>
    </div>
  );
};

export default DragDropZone;
