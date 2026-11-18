import React from 'react';

export default function EmptyState({ onResetFilters, onOpenAddModal }) {
  return (
    <div id="empty-state" className="state-container">
      <div className="state-icon">
        <i className="fa-regular fa-folder-open"></i>
      </div>
      <h3 className="state-title">No Courses Found</h3>
      <p className="state-desc">
        No courses match your current search and filter criteria, or the catalog is empty.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button onClick={onResetFilters} className="btn-secondary">
          <i className="fa-solid fa-arrows-rotate"></i> Reset Filters
        </button>
        <button onClick={onOpenAddModal} className="btn-primary">
          <i className="fa-solid fa-plus"></i> Add Course
        </button>
      </div>
    </div>
  );
}
