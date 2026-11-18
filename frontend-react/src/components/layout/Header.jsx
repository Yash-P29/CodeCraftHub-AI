import React from 'react';

export default function Header({
  serverOnline,
  aiHealth,
  onResetDemo,
  onOpenAddModal
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        <a href="/" className="brand-section">
          <div className="brand-logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="brand-text">
            <h1>CodeCraftHub AI</h1>
            <p>Your Intelligent Learning Management Platform</p>
          </div>
        </a>

        <div className="header-badges">
          <div className="badge-academic">
            <i className="fa-solid fa-award"></i>
            <span>IBM Full Stack Developer Capstone</span>
          </div>

          <div
            id="server-status-pill"
            className="server-status-pill"
            style={
              !serverOnline
                ? { backgroundColor: 'var(--danger-bg)', borderColor: 'var(--danger)', color: 'var(--danger)' }
                : {}
            }
            title="Backend Server Connectivity"
          >
            <span
              className="status-dot"
              style={!serverOnline ? { backgroundColor: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' } : {}}
            ></span>
            <span>{serverOnline ? 'Backend Online (Port 5000)' : 'Backend Offline'}</span>
          </div>

          <div
            id="ai-status-pill"
            className="ai-status-pill"
            style={
              !aiHealth?.aiService?.online
                ? { backgroundColor: 'var(--danger-bg)', borderColor: 'var(--danger)', color: 'var(--danger)' }
                : {}
            }
            title={aiHealth?.aiService?.online ? `Model: ${aiHealth.aiService.model}` : 'AI Microservice Offline'}
          >
            <span
              className="ai-status-dot"
              style={
                !aiHealth?.aiService?.online
                  ? { backgroundColor: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }
                  : {}
              }
            ></span>
            <span>
              {aiHealth?.aiService?.online
                ? `Gemini AI Online (${aiHealth.aiService.model || 'Gemini'})`
                : 'AI Microservice Offline'}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            id="reset-demo-btn"
            className="btn-subtle"
            onClick={onResetDemo}
            title="Reset Course Catalog to Default Seed Data"
          >
            <i className="fa-solid fa-arrows-rotate"></i>
            <span>Reset Demo Data</span>
          </button>
          <button id="open-add-modal-btn" className="btn-primary" onClick={onOpenAddModal}>
            <i className="fa-solid fa-plus"></i>
            <span>Add New Course</span>
          </button>
        </div>
      </div>
    </header>
  );
}
