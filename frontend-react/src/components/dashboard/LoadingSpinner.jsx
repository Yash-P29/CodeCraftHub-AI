import React from 'react';

export default function LoadingSpinner() {
  return (
    <div id="loading-state" className="state-container">
      <div className="loading-spinner"></div>
      <h3 className="state-title">Loading Course Catalog</h3>
      <p className="state-desc">
        Synchronizing with Node.js/Express REST API and JSON persistence store...
      </p>
    </div>
  );
}
