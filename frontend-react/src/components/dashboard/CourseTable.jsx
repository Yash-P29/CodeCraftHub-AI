import React from 'react';

export default function CourseTable({ courses, onViewDetails, onEdit, onDelete }) {
  const handleDelete = (id) => {
    onDelete(id);
  };

  return (
    <div id="courses-table" className="table-container">
      <table className="courses-table">
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Title &amp; Instructor</th>
            <th>Category</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Level</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="courses-table-body">
          {courses.map((course) => {
            const statusClass = (course.status || 'Active').toLowerCase();
            const rating = typeof course.rating === 'number' ? course.rating.toFixed(1) : '5.0';

            return (
              <tr key={course.id}>
                <td>
                  <span className="card-id-tag">{course.id}</span>
                </td>
                <td>
                  <div className="table-course-title">{course.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {course.instructor || ''}
                  </div>
                </td>
                <td>
                  <span className="badge-category">{course.category || 'General'}</span>
                </td>
                <td>
                  <span className={`badge-status ${statusClass}`}>
                    {course.status || 'Active'}
                  </span>
                </td>
                <td>{course.duration || 'Self-paced'}</td>
                <td>{course.level || 'Intermediate'}</td>
                <td>
                  <i className="fa-solid fa-star rating-star"></i> {rating}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-subtle"
                      onClick={() => onViewDetails(course.id)}
                      title="View Details"
                    >
                      <i className="fa-solid fa-circle-info"></i>
                    </button>
                    <button
                      className="btn-subtle"
                      onClick={() => onEdit(course.id)}
                      title="Edit Course"
                    >
                      <i className="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(course.id)}
                      title="Delete Course"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
