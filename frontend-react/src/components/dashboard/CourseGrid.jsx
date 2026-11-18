import React from 'react';
import CourseCard from './CourseCard';

export default function CourseGrid({ courses, onViewDetails, onEdit, onDelete }) {
  return (
    <div id="courses-grid" className="courses-grid">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
