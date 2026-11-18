import React from 'react';

export default function DeleteConfirmModal({ isOpen, course, onClose, onConfirmDelete, deleting }) {
  if (!isOpen || !course) return null;

  return (
    <div
      id="delete-modal"
      className="modal-backdrop open"
      aria-hidden="false"
      role="dialog"
      onClick={(e) => {
        if (e.target.classList.contains('modal-backdrop')) onClose();
      }}
    >
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--danger)' }}></i>{' '}
            Confirm Course Deletion
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            Are you sure you want to delete this course from the persistent catalog?
          </p>
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              borderLeft: '3px solid var(--danger)',
              padding: '0.875rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem'
            }}
          >
            <div style={{ fontWeight: 600, color: '#ffffff' }} id="delete-course-title">
              {course.title}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Course ID: <span id="delete-course-id">{course.id}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--danger)' }}>
            <i className="fa-solid fa-circle-exclamation"></i> This operation will immediately remove the
            record from <code>data/courses.json</code>.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            className="btn-danger"
            onClick={onConfirmDelete}
            disabled={deleting}
          >
            <i className="fa-regular fa-trash-can"></i> {deleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
