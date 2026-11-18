import React from 'react';

export default function Toolbar({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange
}) {
  return (
    <section className="toolbar-section" aria-label="Filters and Search Controls">
      <div className="toolbar-filters">
        {/* Live Search */}
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            id="search-input"
            className="search-input"
            placeholder="Search courses, instructors, keywords..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Category Dropdown */}
        <select
          id="category-filter"
          className="filter-select"
          aria-label="Filter by Category"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="AI & Machine Learning">AI & Machine Learning</option>
          <option value="DevOps">DevOps</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="Data Engineering">Data Engineering</option>
        </select>

        {/* Status Dropdown */}
        <select
          id="status-filter"
          className="filter-select"
          aria-label="Filter by Status"
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Level Dropdown */}
        <select
          id="level-filter"
          className="filter-select"
          aria-label="Filter by Difficulty Level"
          value={filters.level}
          onChange={(e) => onFilterChange('level', e.target.value)}
        >
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        {/* Clear Filters */}
        <button
          id="clear-filters-btn"
          className="btn-subtle"
          onClick={onResetFilters}
          title="Clear All Active Filters"
        >
          <i className="fa-solid fa-xmark"></i> Clear
        </button>
      </div>

      <div className="toolbar-actions">
        {/* View Mode Switcher */}
        <button
          id="grid-view-btn"
          className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => onViewModeChange('grid')}
          title="Grid View"
          aria-label="Grid View"
        >
          <i className="fa-solid fa-grip"></i>
        </button>
        <button
          id="table-view-btn"
          className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => onViewModeChange('table')}
          title="Table View"
          aria-label="Table View"
        >
          <i className="fa-solid fa-list"></i>
        </button>
      </div>
    </section>
  );
}
