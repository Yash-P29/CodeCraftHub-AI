import React from 'react';

export default function CourseDetailsModal({ isOpen, course, onClose, onEdit }) {
  if (!isOpen || !course) return null;

  return (
    <div
      id="details-modal"
      className="modal-backdrop open"
      aria-hidden="false"
      role="dialog"
      onClick={(e) => {
        if (e.target.classList.contains('modal-backdrop')) onClose();
      }}
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }}></i>{' '}
            <span>Course Specification</span>
            <span id="detail-course-id" className="card-id-tag">
              {course.id}
            </span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <h2
            id="detail-course-title"
            style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}
          >
            {course.title}
          </h2>

          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">Instructor</div>
              <div id="detail-instructor" className="detail-value">
                {course.instructor}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Category</div>
              <div id="detail-category" className="detail-value">
                {course.category}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div id="detail-status" className="detail-value">
                {course.status}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Difficulty Level</div>
              <div id="detail-level" className="detail-value">
                {course.level}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Duration</div>
              <div id="detail-duration" className="detail-value">
                {course.duration}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Enrolled Learners</div>
              <div id="detail-students" className="detail-value">
                {(course.enrolledStudents || 0).toLocaleString()}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Rating</div>
              <div id="detail-rating" className="detail-value">
                {(course.rating || 5.0).toFixed(1)}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Last Updated</div>
              <div id="detail-updated-at" className="detail-value" style={{ fontSize: '0.8125rem' }}>
                {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="detail-desc-box">
            <div className="detail-label">Course Description &amp; Learning Outcomes</div>
            <p id="detail-description">{course.description}</p>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Created on:{' '}
            <span id="detail-created-at">
              {course.createdAt ? new Date(course.createdAt).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            id="detail-edit-btn"
            className="btn-primary"
            onClick={() => {
              onClose();
              onEdit(course.id);
            }}
          >
            <i className="fa-regular fa-pen-to-square"></i> Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}
