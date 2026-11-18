import React from 'react';

export default function MetricsBar({ courses }) {
  const total = courses.length;
  const active = courses.filter((c) => (c.status || '').toLowerCase() === 'active').length;
  const upcoming = courses.filter((c) => {
    const s = (c.status || '').toLowerCase();
    return s === 'upcoming' || s === 'draft';
  }).length;
  const totalLearners = courses.reduce(
    (acc, c) => acc + (typeof c.enrolledStudents === 'number' ? c.enrolledStudents : 0),
    0
  );

  return (
    <section className="metrics-grid" aria-label="Course Management Statistics">
      <div className="metric-card">
        <div className="metric-icon-box metric-icon-purple">
          <i className="fa-solid fa-book-open"></i>
        </div>
        <div className="metric-info">
          <h3>Total Courses</h3>
          <div id="total-courses-count" className="metric-value">
            {total}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon-box metric-icon-green">
          <i className="fa-solid fa-circle-play"></i>
        </div>
        <div className="metric-info">
          <h3>Active Courses</h3>
          <div id="active-courses-count" className="metric-value">
            {active}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon-box metric-icon-blue">
          <i className="fa-solid fa-calendar-check"></i>
        </div>
        <div className="metric-info">
          <h3>Upcoming / Draft</h3>
          <div id="upcoming-courses-count" className="metric-value">
            {upcoming}
          </div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-icon-box metric-icon-amber">
          <i className="fa-solid fa-users-line"></i>
        </div>
        <div className="metric-info">
          <h3>Total Learners</h3>
          <div id="total-learners-count" className="metric-value">
            {totalLearners.toLocaleString()}
          </div>
        </div>
      </div>
    </section>
  );
}
