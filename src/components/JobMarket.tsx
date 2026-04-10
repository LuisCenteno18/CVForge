import React from 'react';
import type { JobOpportunity } from '../App';
import { Briefcase, MapPin, DollarSign, ExternalLink, RefreshCw } from 'lucide-react';
import './JobMarket.css';

interface JobMarketProps {
  opportunities: JobOpportunity[];
  isScouring: boolean;
  onRefresh: () => void;
}

const JobMarket: React.FC<JobMarketProps> = ({ opportunities, isScouring, onRefresh }) => {
  return (
    <div className="job-market-container animate-fade-in">
      <div className="job-market-header">
        <div className="header-text">
          <h2>Job Market <span className="gradient-text">Scout</span></h2>
          <p>AI-scoured opportunities tailored for your unique profile.</p>
        </div>
        <button 
          className={`btn btn-secondary ${isScouring ? 'loading' : ''}`} 
          onClick={onRefresh}
          disabled={isScouring}
        >
          <RefreshCw size={18} className={isScouring ? 'spin' : ''} />
          {isScouring ? 'Scouring...' : 'Refresh Search'}
        </button>
      </div>

      <div className="opportunities-grid">
        {opportunities.length === 0 && !isScouring ? (
          <div className="empty-state glass-panel">
            <Briefcase size={48} />
            <h3>No opportunities found yet</h3>
            <p>Click "Refresh Search" to begin scouring the market.</p>
          </div>
        ) : (
          opportunities.map((job, idx) => (
            <div key={idx} className="opportunity-card glass-panel animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="card-header">
                <div className="company-logo">
                  {job.company.charAt(0)}
                </div>
                <div className="title-area">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company}</p>
                </div>
                <div className="external-link">
                  <ExternalLink size={18} />
                </div>
              </div>
              
              <div className="card-body">
                <p className="match-reason">{job.matchReason}</p>
                <div className="job-meta">
                  <div className="meta-item">
                    <DollarSign size={16} />
                    <span>{job.salaryRange}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>Remote / Hybrid</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button className="btn btn-full">Apply Now</button>
              </div>
            </div>
          ))
        )}
        
        {isScouring && opportunities.length === 0 && (
          [1, 2, 3].map((n) => (
            <div key={n} className="opportunity-card glass-panel skeleton">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line text"></div>
              <div className="skeleton-line text"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobMarket;
