import { useState, useEffect } from 'react';
import DragDropZone from './components/DragDropZone';
import ProcessingScreen from './components/ProcessingScreen';
import CvEditor from './components/CvEditor';
import TemplateSelector from './components/TemplateSelector';
import CvPreview from './components/CvPreview';
import JobMarket from './components/JobMarket';
import { extractAndStructureCV, scourJobOpportunities } from './utils/gemini';
import type { TemplateName } from './components/TemplateSelector';

export type AppState = 'upload' | 'processing' | 'editor' | 'templates' | 'preview' | 'jobs';

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface CVData {
  // Personal Info
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  // Summary
  objective: string;
  // Sections
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  certifications: string[];
  interests: string[];
}

export interface JobOpportunity {
  title: string;
  company: string;
  matchReason: string;
  salaryRange: string;
}

const emptyCvData: CVData = {
  name: "",
  role: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  objective: "",
  experience: [{ company: "", position: "", duration: "", description: "" }],
  education: [{ institution: "", degree: "", field: "", duration: "" }],
  skills: [],
  languages: [{ name: "", level: "" }],
  certifications: [],
  interests: [],
};

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [cvData, setCvData] = useState<CVData>(emptyCvData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('modern');
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [isScouring, setIsScouring] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  useEffect(() => {
    let interval: any;
    if (appState === 'preview' || appState === 'jobs') {
      interval = setInterval(() => { refreshJobs(); }, 5 * 60 * 1000);
    }
    return () => clearInterval(interval);
  }, [appState, cvData]);

  const refreshJobs = async () => {
    try {
      setIsScouring(true);
      const jobs = await scourJobOpportunities(cvData);
      setJobOpportunities(jobs.opportunities);
    } catch (err) { console.error("Failed to refresh jobs", err); }
    finally { setIsScouring(false); }
  };

  const handleFilesDropped = async (files: File[]) => {
    setAppState('processing');
    setExtractionStatus("Preparing documents for AI analysis...");
    try {
      const structured = await extractAndStructureCV(
        Array.from(files), (msg) => setExtractionStatus(msg)
      );
      // Merge AI result into the full CVData shape (AI may not return all fields)
      setCvData({ ...emptyCvData, ...structured });
      setExtractionStatus("Profile extracted successfully!");
      setAppState('editor');
    } catch (error) {
      console.error("Extraction failed:", error);
      setExtractionStatus(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setAppState('editor'), 3000);
    }
  };

  const handleManualEntry = () => {
    setCvData(emptyCvData);
    setAppState('editor');
  };

  const handleEditorImport = async (files: File[]) => {
    setIsImporting(true);
    setImportStatus("Preparing documents for AI analysis...");
    try {
      const structured = await extractAndStructureCV(
        Array.from(files), (msg) => setImportStatus(msg)
      );
      // Deep merge: preserve any fields the user already filled that AI didn't return
      setCvData(prev => ({ ...emptyCvData, ...prev, ...structured }));
      setImportStatus("✓ Profile updated from your documents!");
    } catch (error) {
      console.error("Import failed:", error);
      setImportStatus(`⚠ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportStatus(""), 5000);
    }
  };

  const showNav = ['editor', 'templates', 'preview', 'jobs'].includes(appState);

  return (
    <div className="app-container">
      <header className="header animate-fade-in" style={{ cursor: 'pointer' }} onClick={() => setAppState('upload')}>
        <h1>CV<span className="gradient-text">Forge</span></h1>
        <p>AI-Powered CV Synthesis & Design</p>
      </header>

      {showNav && (
        <nav className="app-nav glass-panel animate-fade-in">
          <button className={appState === 'editor' ? 'active' : ''} onClick={() => setAppState('editor')}>Editor</button>
          <button className={appState === 'templates' ? 'active' : ''} onClick={() => setAppState('templates')}>Templates</button>
          <button className={appState === 'preview' ? 'active' : ''} onClick={() => setAppState('preview')}>Preview</button>
          <button className={appState === 'jobs' ? 'active' : ''} onClick={() => {
            setAppState('jobs');
            if (jobOpportunities.length === 0) refreshJobs();
          }}>Job Market {isScouring && "..."}</button>
        </nav>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {appState === 'upload' && (
          <DragDropZone onFilesAccepted={handleFilesDropped} onManualEntry={handleManualEntry} />
        )}
        {appState === 'processing' && (
          <ProcessingScreen status={extractionStatus} />
        )}
        {appState === 'editor' && (
          <>
            {importStatus && (
              <div className={`import-status-bar ${isImporting ? 'importing' : importStatus.startsWith('✓') ? 'success' : 'error'}`}>
                {isImporting && <span className="import-spinner" />}
                {importStatus}
              </div>
            )}
            <CvEditor
              data={cvData}
              onChange={setCvData}
              onPreview={() => setAppState('templates')}
              onImport={handleEditorImport}
              isImporting={isImporting}
            />
          </>
        )}
        {appState === 'templates' && (
          <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} onPreview={() => setAppState('preview')} />
        )}
        {appState === 'preview' && (
          <CvPreview data={cvData} template={selectedTemplate} onEdit={() => setAppState('editor')} />
        )}
        {appState === 'jobs' && (
          <JobMarket opportunities={jobOpportunities} isScouring={isScouring} onRefresh={refreshJobs} />
        )}
      </main>
    </div>
  );
}

export default App;
