import React, { useState } from 'react';

export default function AddCourseModal({ isOpen, onClose, onAddCourse }) {
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    category: 'Web Development',
    status: 'Active',
    level: 'Intermediate',
    duration: '',
    enrolledStudents: 0,
    rating: 5.0,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Title is required (minimum 3 characters)';
    }
    if (!formData.instructor.trim()) {
      errs.instructor = 'Instructor name is required';
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      errs.description = 'Description is required (minimum 5 characters)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onAddCourse({
        ...formData,
        duration: formData.duration.trim() || 'Self-Paced',
        enrolledStudents: parseInt(formData.enrolledStudents, 10) || 0,
        rating: parseFloat(formData.rating) || 5.0
      });
      // reset form
      setFormData({
        title: '',
        instructor: '',
        category: 'Web Development',
        status: 'Active',
        level: 'Intermediate',
        duration: '',
        enrolledStudents: 0,
        rating: 5.0,
        description: ''
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="add-course-modal"
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
            <i className="fa-solid fa-book-medical" style={{ color: 'var(--primary)' }}></i> Add New Course
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <form id="add-course-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="add-title">
                Course Title <span className="req">*</span>
              </label>
              <input
                type="text"
                id="add-title"
                name="title"
                className="form-control"
                placeholder="e.g. Cloud Native Microservices Architecture"
                value={formData.title}
                onChange={handleChange}
                required
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-row">
              <div className={`form-group ${errors.instructor ? 'has-error' : ''}`}>
                <label className="form-label" htmlFor="add-instructor">
                  Instructor <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="add-instructor"
                  name="instructor"
                  className="form-control"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={formData.instructor}
                  onChange={handleChange}
                  required
                />
                {errors.instructor && <div className="form-error">{errors.instructor}</div>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="add-category">
                  Category
                </label>
                <select
                  id="add-category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Data Engineering">Data Engineering</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="add-status">
                  Course Status
                </label>
                <select
                  id="add-status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="add-level">
                  Difficulty Level
                </label>
                <select
                  id="add-level"
                  name="level"
                  className="form-control"
                  value={formData.level}
                  onChange={handleChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="add-duration">
                  Duration
                </label>
                <input
                  type="text"
                  id="add-duration"
                  name="duration"
                  className="form-control"
                  placeholder="e.g. 8 Weeks (40 Hours)"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="add-students">
                  Initial Enrolled Students
                </label>
                <input
                  type="number"
                  id="add-students"
                  name="enrolledStudents"
                  className="form-control"
                  min="0"
                  value={formData.enrolledStudents}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="add-rating">
                Rating (1.0 to 5.0)
              </label>
              <input
                type="number"
                id="add-rating"
                name="rating"
                className="form-control"
                min="1.0"
                max="5.0"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
              />
            </div>

            <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="add-description">
                Course Description &amp; Syllabus <span className="req">*</span>
              </label>
              <textarea
                id="add-description"
                name="description"
                className="form-control"
                placeholder="Provide course objectives, topics covered, and key outcomes..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              {errors.description && <div className="form-error">{errors.description}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <i className="fa-solid fa-plus"></i> {submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
