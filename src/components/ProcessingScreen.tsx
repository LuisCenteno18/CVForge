import React from 'react';
import { Loader2, Zap, BrainCircuit, FileSearch } from 'lucide-react';
import './ProcessingScreen.css';

interface ProcessingScreenProps {
  status?: string;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ status }) => {
  return (
    <div className="processing-container animate-fade-in">
      <div className="processing-card glass-panel">
        <div className="loader-orbit">
          <div className="center-node pulse">
            <BrainCircuit size={40} color="var(--accent-primary)" />
          </div>
          <div className="orbit orbit-1">
            <div className="orbit-item"><FileSearch size={20} color="var(--accent-secondary)" /></div>
          </div>
          <div className="orbit orbit-2">
            <div className="orbit-item shadow"><Zap size={20} color="#f59e0b" /></div>
          </div>
        </div>

        <h2>Synthesizing Data...</h2>
        <p className="subtitle">{status || "AI is extracting your experience and analyzing the motivation letter to craft the perfect profile."}</p>
        
        <div className="progress-bar-container">
          <div className="progress-bar-fill"></div>
        </div>
        
        <div className="status-steps">
          <div className="step active"><Loader2 size={16} className="spin" /> Extraction Status</div>
          <div className="extraction-log glass-panel">
            <code>{status || "Waiting for signal..."}</code>
          </div>
          <div className="step pending">Structuring Experience Timeline</div>
          <div className="step pending">Applying Motivational Insights</div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
