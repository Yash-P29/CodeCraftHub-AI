import React from 'react';
import { getInitials } from '../../utils/markdown';

export default function CourseCard({ course, onViewDetails, onEdit, onDelete }) {
  const statusClass = (course.status || 'Active').toLowerCase();
  const initials = getInitials(course.instructor || 'Staff');
  const rating = typeof course.rating === 'number' ? course.rating.toFixed(1) : '5.0';
  const students = typeof course.enrolledStudents === 'number' ? course.enrolledStudents.toLocaleString() : '0';

  // handleDelete matches the mandatory handler pattern
  const handleDelete = (id) => {
    onDelete(id);
  };

  return (
    <article className="course-card" data-id={course.id}>
      <div>
        <div className="card-top">
          <span className={`badge-status ${statusClass}`}>
            <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem' }}></i>{' '}
            {course.status || 'Active'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge-category">{course.category || 'General'}</span>
            <span className="card-id-tag">{course.id}</span>
          </div>
        </div>

        <h3 className="card-title">{course.title}</h3>

        <div className="card-instructor">
          <div className="instructor-avatar">{initials}</div>
          <span>{course.instructor || 'TBD'}</span>
        </div>

        <p className="card-desc">{course.description || ''}</p>
      </div>

      <div>
        <div className="card-meta-row">
          <span className="meta-item">
            <i className="fa-regular fa-clock"></i>
            {course.duration || 'Self-paced'}
          </span>
          <span className="meta-item">
            <i className="fa-solid fa-layer-group"></i>
            {course.level || 'Intermediate'}
          </span>
          <span className="meta-item">
            <i className="fa-solid fa-user-graduate"></i>
            {students}
          </span>
          <span className="meta-item">
            <i className="fa-solid fa-star rating-star"></i>
            {rating}
          </span>
        </div>

        <div className="card-actions">
          <div className="card-actions-left">
            <button className="btn-secondary" onClick={() => onViewDetails(course.id)} title="View Details">
              <i className="fa-solid fa-circle-info"></i> Details
            </button>
            <button className="btn-secondary" onClick={() => onEdit(course.id)} title="Edit Course">
              <i className="fa-regular fa-pen-to-square"></i> Edit
            </button>
          </div>
          {/* MANDATORY: button class btn-danger and onClick with handleDelete(course.id) */}
          <button className="btn-danger" onClick={() => handleDelete(course.id)}>
            <i className="fa-regular fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    </article>
  );
}
