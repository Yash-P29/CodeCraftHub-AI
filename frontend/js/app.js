/**
 * CodeCraftHub: Your Learning Management Platform
 * Main Frontend Application Script
 */

// Application State
const state = {
  courses: [],
  filteredCourses: [],
  loading: true,
  error: null,
  viewMode: 'grid', // 'grid' | 'table'
  activeFilters: {
    search: '',
    category: 'All',
    status: 'All',
    level: 'All'
  },
  activeEditId: null,
  activeDeleteId: null
};

// DOM Elements cache
const elements = {};

/**
 * Initialize elements and event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
  // Enforce mandatory document title
  document.title = 'CodeCraftHub: Your Learning Management Platform';

  cacheElements();
  bindEvents();
  checkBackendHealth();
  loadCourses();
});

function cacheElements() {
  elements.coursesGrid = document.getElementById('courses-grid');
  elements.coursesTable = document.getElementById('courses-table');
  elements.tableBody = document.getElementById('courses-table-body');
  elements.loadingState = document.getElementById('loading-state');
  elements.emptyState = document.getElementById('empty-state');
  elements.totalCount = document.getElementById('total-courses-count');
  elements.activeCount = document.getElementById('active-courses-count');
  elements.upcomingCount = document.getElementById('upcoming-courses-count');
  elements.learnersCount = document.getElementById('total-learners-count');
  elements.displayedCount = document.getElementById('displayed-count');

  // Filters
  elements.searchInput = document.getElementById('search-input');
  elements.categoryFilter = document.getElementById('category-filter');
  elements.statusFilter = document.getElementById('status-filter');
  elements.levelFilter = document.getElementById('level-filter');
  elements.clearFiltersBtn = document.getElementById('clear-filters-btn');

  // Modals
  elements.addModal = document.getElementById('add-course-modal');
  elements.editModal = document.getElementById('edit-course-modal');
  elements.detailsModal = document.getElementById('details-modal');
  elements.deleteModal = document.getElementById('delete-modal');

  // Forms
  elements.addForm = document.getElementById('add-course-form');
  elements.editForm = document.getElementById('edit-course-form');

  // View switches
  elements.gridViewBtn = document.getElementById('grid-view-btn');
  elements.tableViewBtn = document.getElementById('table-view-btn');

  // Server status badge
  elements.serverStatus = document.getElementById('server-status-pill');
  elements.toastContainer = document.getElementById('toast-container');
}

function bindEvents() {
  // Search and filters
  elements.searchInput.addEventListener('input', debounce((e) => {
    state.activeFilters.search = e.target.value.trim();
    applyFilters();
  }, 250));

  elements.categoryFilter.addEventListener('change', (e) => {
    state.activeFilters.category = e.target.value;
    applyFilters();
  });

  elements.statusFilter.addEventListener('change', (e) => {
    state.activeFilters.status = e.target.value;
    applyFilters();
  });

  if (elements.levelFilter) {
    elements.levelFilter.addEventListener('change', (e) => {
      state.activeFilters.level = e.target.value;
      applyFilters();
    });
  }

  elements.clearFiltersBtn.addEventListener('click', resetFilters);

  // View toggle
  elements.gridViewBtn.addEventListener('click', () => switchView('grid'));
  elements.tableViewBtn.addEventListener('click', () => switchView('table'));

  // Add course modal trigger
  document.getElementById('open-add-modal-btn').addEventListener('click', () => {
    resetFormErrors(elements.addForm);
    elements.addForm.reset();
    openModal(elements.addModal);
  });

  // Reset demo data trigger
  const resetDemoBtn = document.getElementById('reset-demo-btn');
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', handleResetDemoData);
  }

  // Form submit handlers
  elements.addForm.addEventListener('submit', handleAddCourseSubmit);
  elements.editForm.addEventListener('submit', handleEditCourseSubmit);

  // Confirm delete button in modal
  document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);

  // Close modal buttons (data-close-modal)
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  // Close modals on clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target);
    }
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });
}

/**
 * Periodically or on load check backend health
 */
async function checkBackendHealth() {
  try {
    const health = await window.CourseAPI.checkHealth();
    if (health && health.status === 'healthy') {
      elements.serverStatus.innerHTML = `
        <span class="status-dot"></span>
        <span>Backend Online (Port 5000)</span>
      `;
      elements.serverStatus.classList.remove('status-offline');
    } else {
      setServerOffline();
    }
  } catch {
    setServerOffline();
  }
}

function setServerOffline() {
  elements.serverStatus.innerHTML = `
    <span class="status-dot" style="background-color: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>
    <span style="color: #EF4444;">Backend Offline</span>
  `;
}

/**
 * Fetch courses from backend
 */
async function loadCourses() {
  state.loading = true;
  updateLoadingState(true);

  try {
    const courses = await window.CourseAPI.getAll();
    state.courses = courses;
    state.loading = false;
    updateLoadingState(false);
    updateMetrics();
    applyFilters();
  } catch (err) {
    state.loading = false;
    updateLoadingState(false);
    showToast('Failed to load courses', err.message, 'danger');
    renderCourses();
  }
}

/**
 * Filter state logic
 */
function applyFilters() {
  const { search, category, status, level } = state.activeFilters;
  const q = search.toLowerCase();

  state.filteredCourses = state.courses.filter(course => {
    // Search
    const matchesSearch = !q ||
      (course.title && course.title.toLowerCase().includes(q)) ||
      (course.instructor && course.instructor.toLowerCase().includes(q)) ||
      (course.description && course.description.toLowerCase().includes(q)) ||
      (course.id && course.id.toLowerCase().includes(q));

    // Category
    const matchesCategory = category === 'All' ||
      (course.category && course.category.toLowerCase() === category.toLowerCase());

    // Status
    const matchesStatus = status === 'All' ||
      (course.status && course.status.toLowerCase() === status.toLowerCase());

    // Level
    const matchesLevel = level === 'All' ||
      (course.level && course.level.toLowerCase() === level.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
  });

  renderCourses();
}

function resetFilters() {
  state.activeFilters = {
    search: '',
    category: 'All',
    status: 'All',
    level: 'All'
  };
  elements.searchInput.value = '';
  elements.categoryFilter.value = 'All';
  elements.statusFilter.value = 'All';
  if (elements.levelFilter) elements.levelFilter.value = 'All';
  applyFilters();
}

/**
 * Render courses in active view mode
 */
function renderCourses() {
  const courses = state.filteredCourses;
  elements.displayedCount.textContent = `${courses.length} of ${state.courses.length} courses`;

  if (courses.length === 0) {
    elements.coursesGrid.style.display = 'none';
    elements.coursesTable.style.display = 'none';
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  if (state.viewMode === 'grid') {
    elements.coursesTable.style.display = 'none';
    elements.coursesGrid.style.display = 'grid';
    renderGrid(courses);
  } else {
    elements.coursesGrid.style.display = 'none';
    elements.coursesTable.style.display = 'block';
    renderTable(courses);
  }
}

/**
 * Render cards grid
 * NOTE: The delete button markup MUST retain:
 * <button class="btn-danger" onclick="handleDelete('${course.id}')">
 */
function renderGrid(courses) {
  elements.coursesGrid.innerHTML = courses.map(course => {
    const statusClass = (course.status || 'Active').toLowerCase();
    const initials = getInitials(course.instructor || 'Staff');
    const rating = typeof course.rating === 'number' ? course.rating.toFixed(1) : '5.0';
    const students = typeof course.enrolledStudents === 'number' ? course.enrolledStudents.toLocaleString() : '0';

    return `
      <article class="course-card" data-id="${escapeHtml(course.id)}">
        <div>
          <div class="card-top">
            <span class="badge-status ${statusClass}">
              <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i>
              ${escapeHtml(course.status || 'Active')}
            </span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="badge-category">${escapeHtml(course.category || 'General')}</span>
              <span class="card-id-tag">${escapeHtml(course.id)}</span>
            </div>
          </div>

          <h3 class="card-title">${escapeHtml(course.title)}</h3>

          <div class="card-instructor">
            <div class="instructor-avatar">${escapeHtml(initials)}</div>
            <span>${escapeHtml(course.instructor || 'TBD')}</span>
          </div>

          <p class="card-desc">${escapeHtml(course.description || '')}</p>
        </div>

        <div>
          <div class="card-meta-row">
            <span class="meta-item">
              <i class="fa-regular fa-clock"></i>
              ${escapeHtml(course.duration || 'Self-paced')}
            </span>
            <span class="meta-item">
              <i class="fa-solid fa-layer-group"></i>
              ${escapeHtml(course.level || 'Intermediate')}
            </span>
            <span class="meta-item">
              <i class="fa-solid fa-user-graduate"></i>
              ${students}
            </span>
            <span class="meta-item">
              <i class="fa-solid fa-star rating-star"></i>
              ${rating}
            </span>
          </div>

          <div class="card-actions">
            <div class="card-actions-left">
              <button class="btn-secondary" onclick="handleViewDetails('${course.id}')" title="View Details">
                <i class="fa-solid fa-circle-info"></i> Details
              </button>
              <button class="btn-secondary" onclick="handleEdit('${course.id}')" title="Edit Course">
                <i class="fa-regular fa-pen-to-square"></i> Edit
              </button>
            </div>
            <button class="btn-danger" onclick="handleDelete('${course.id}')">
              <i class="fa-regular fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Render table view
 */
function renderTable(courses) {
  elements.tableBody.innerHTML = courses.map(course => {
    const statusClass = (course.status || 'Active').toLowerCase();
    const rating = typeof course.rating === 'number' ? course.rating.toFixed(1) : '5.0';

    return `
      <tr>
        <td>
          <span class="card-id-tag">${escapeHtml(course.id)}</span>
        </td>
        <td>
          <div class="table-course-title">${escapeHtml(course.title)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(course.instructor || '')}</div>
        </td>
        <td>
          <span class="badge-category">${escapeHtml(course.category || 'General')}</span>
        </td>
        <td>
          <span class="badge-status ${statusClass}">
            ${escapeHtml(course.status || 'Active')}
          </span>
        </td>
        <td>${escapeHtml(course.duration || 'Self-paced')}</td>
        <td>${escapeHtml(course.level || 'Intermediate')}</td>
        <td>
          <i class="fa-solid fa-star rating-star"></i> ${rating}
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-subtle" onclick="handleViewDetails('${course.id}')" title="View Details">
              <i class="fa-solid fa-circle-info"></i>
            </button>
            <button class="btn-subtle" onclick="handleEdit('${course.id}')" title="Edit Course">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button class="btn-danger" onclick="handleDelete('${course.id}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update top KPI metrics cards
 */
function updateMetrics() {
  const courses = state.courses;
  const total = courses.length;
  const active = courses.filter(c => (c.status || '').toLowerCase() === 'active').length;
  const upcoming = courses.filter(c => {
    const s = (c.status || '').toLowerCase();
    return s === 'upcoming' || s === 'draft';
  }).length;
  const totalLearners = courses.reduce((acc, c) => acc + (typeof c.enrolledStudents === 'number' ? c.enrolledStudents : 0), 0);

  elements.totalCount.textContent = total;
  elements.activeCount.textContent = active;
  elements.upcomingCount.textContent = upcoming;
  elements.learnersCount.textContent = totalLearners.toLocaleString();
}

/**
 * Handle Add Course Form Submission
 */
async function handleAddCourseSubmit(e) {
  e.preventDefault();
  const form = elements.addForm;

  if (!validateForm(form)) {
    return;
  }

  const formData = new FormData(form);
  const payload = {
    title: formData.get('title').trim(),
    instructor: formData.get('instructor').trim(),
    category: formData.get('category').trim(),
    status: formData.get('status'),
    level: formData.get('level'),
    duration: formData.get('duration').trim() || 'Self-Paced',
    enrolledStudents: parseInt(formData.get('enrolledStudents'), 10) || 0,
    rating: parseFloat(formData.get('rating')) || 5.0,
    description: formData.get('description').trim()
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';

  try {
    const newCourse = await window.CourseAPI.create(payload);
    state.courses.unshift(newCourse);
    updateMetrics();
    applyFilters();
    closeModal(elements.addModal);
    form.reset();
    showToast('Course Created Successfully', `"${newCourse.title}" has been saved to persistent storage.`, 'success');
  } catch (err) {
    showToast('Creation Failed', err.message, 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/**
 * Open and pre-fill Edit Course Modal
 */
window.handleEdit = function(courseId) {
  const course = state.courses.find(c => String(c.id) === String(courseId));
  if (!course) {
    showToast('Course not found', `ID: ${courseId}`, 'danger');
    return;
  }

  state.activeEditId = course.id;
  const form = elements.editForm;
  resetFormErrors(form);

  document.getElementById('edit-course-id-badge').textContent = course.id;
  form.title.value = course.title || '';
  form.instructor.value = course.instructor || '';
  form.category.value = course.category || 'Web Development';
  form.status.value = course.status || 'Active';
  form.level.value = course.level || 'Intermediate';
  form.duration.value = course.duration || '';
  form.enrolledStudents.value = course.enrolledStudents !== undefined ? course.enrolledStudents : 0;
  form.rating.value = course.rating !== undefined ? course.rating : 5.0;
  form.description.value = course.description || '';

  openModal(elements.editModal);
};

/**
 * Handle Edit Course Form Submission
 */
async function handleEditCourseSubmit(e) {
  e.preventDefault();
  const form = elements.editForm;
  const courseId = state.activeEditId;

  if (!courseId) return;
  if (!validateForm(form)) return;

  const formData = new FormData(form);
  const payload = {
    title: formData.get('title').trim(),
    instructor: formData.get('instructor').trim(),
    category: formData.get('category').trim(),
    status: formData.get('status'),
    level: formData.get('level'),
    duration: formData.get('duration').trim() || 'Self-Paced',
    enrolledStudents: parseInt(formData.get('enrolledStudents'), 10) || 0,
    rating: parseFloat(formData.get('rating')) || 5.0,
    description: formData.get('description').trim()
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  try {
    const updated = await window.CourseAPI.update(courseId, payload);
    const index = state.courses.findIndex(c => String(c.id) === String(courseId));
    if (index !== -1) {
      state.courses[index] = updated;
    }
    updateMetrics();
    applyFilters();
    closeModal(elements.editModal);
    showToast('Course Updated', `"${updated.title}" has been updated successfully.`, 'success');
  } catch (err) {
    showToast('Update Failed', err.message, 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
};

/**
 * Global handleDelete requirement
 * MANDATORY: <button class="btn-danger" onclick="handleDelete('${course.id}')">
 */
window.handleDelete = function(courseId) {
  const course = state.courses.find(c => String(c.id) === String(courseId));
  if (!course) {
    showToast('Course not found', `ID: ${courseId}`, 'danger');
    return;
  }

  state.activeDeleteId = courseId;
  document.getElementById('delete-course-title').textContent = course.title;
  document.getElementById('delete-course-id').textContent = course.id;
  openModal(elements.deleteModal);
};

/**
 * Confirm delete execution
 */
async function confirmDelete() {
  const courseId = state.activeDeleteId;
  if (!courseId) return;

  const confirmBtn = document.getElementById('confirm-delete-btn');
  const originalText = confirmBtn.innerHTML;
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

  try {
    const deleted = await window.CourseAPI.delete(courseId);
    state.courses = state.courses.filter(c => String(c.id) !== String(courseId));
    updateMetrics();
    applyFilters();
    closeModal(elements.deleteModal);
    showToast('Course Deleted', `"${deleted.title || courseId}" was permanently removed.`, 'info');
  } catch (err) {
    showToast('Deletion Failed', err.message, 'danger');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = originalText;
    state.activeDeleteId = null;
  }
}

/**
 * View Course Details
 */
window.handleViewDetails = async function(courseId) {
  try {
    const course = await window.CourseAPI.getById(courseId);
    if (!course) throw new Error('Course details could not be retrieved.');

    document.getElementById('detail-course-id').textContent = course.id;
    document.getElementById('detail-course-title').textContent = course.title;
    document.getElementById('detail-instructor').textContent = course.instructor;
    document.getElementById('detail-category').textContent = course.category;
    document.getElementById('detail-status').textContent = course.status;
    document.getElementById('detail-level').textContent = course.level;
    document.getElementById('detail-duration').textContent = course.duration;
    document.getElementById('detail-students').textContent = (course.enrolledStudents || 0).toLocaleString();
    document.getElementById('detail-rating').textContent = (course.rating || 5.0).toFixed(1);
    document.getElementById('detail-description').textContent = course.description;
    document.getElementById('detail-created-at').textContent = course.createdAt ? new Date(course.createdAt).toLocaleString() : 'N/A';
    document.getElementById('detail-updated-at').textContent = course.updatedAt ? new Date(course.updatedAt).toLocaleString() : 'N/A';

    const editFromDetailBtn = document.getElementById('detail-edit-btn');
    editFromDetailBtn.onclick = () => {
      closeModal(elements.detailsModal);
      window.handleEdit(course.id);
    };

    openModal(elements.detailsModal);
  } catch (err) {
    showToast('Error', err.message, 'danger');
  }
};

/**
 * Reset Demo Data
 */
async function handleResetDemoData() {
  if (!confirm('Reset the course catalog to the initial Coursera demonstration state? Any custom additions will be reverted.')) {
    return;
  }

  try {
    const resetCourses = await window.CourseAPI.resetDemoData();
    state.courses = resetCourses;
    resetFilters();
    updateMetrics();
    applyFilters();
    showToast('Catalog Reset', 'Course catalog restored to initial demonstration seed data.', 'success');
  } catch (err) {
    showToast('Reset Failed', err.message, 'danger');
  }
}

/**
 * Form validation helper
 */
function validateForm(form) {
  let isValid = true;
  resetFormErrors(form);

  const titleInput = form.title;
  if (!titleInput.value.trim() || titleInput.value.trim().length < 3) {
    showFieldError(titleInput, 'Title is required (minimum 3 characters)');
    isValid = false;
  }

  const instructorInput = form.instructor;
  if (!instructorInput.value.trim()) {
    showFieldError(instructorInput, 'Instructor name is required');
    isValid = false;
  }

  const descInput = form.description;
  if (!descInput.value.trim() || descInput.value.trim().length < 5) {
    showFieldError(descInput, 'Description is required (minimum 5 characters)');
    isValid = false;
  }

  return isValid;
}

function showFieldError(input, message) {
  const group = input.closest('.form-group');
  if (group) {
    group.classList.add('has-error');
    const errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = message;
  }
}

function resetFormErrors(form) {
  form.querySelectorAll('.form-group').forEach(group => {
    group.classList.remove('has-error');
  });
}

/**
 * View Switcher
 */
function switchView(mode) {
  state.viewMode = mode;
  if (mode === 'grid') {
    elements.gridViewBtn.classList.add('active');
    elements.tableViewBtn.classList.remove('active');
  } else {
    elements.tableViewBtn.classList.add('active');
    elements.gridViewBtn.classList.remove('active');
  }
  renderCourses();
}

/**
 * Loading state visual update
 */
function updateLoadingState(isLoading) {
  if (isLoading) {
    elements.loadingState.style.display = 'block';
    elements.coursesGrid.style.display = 'none';
    elements.coursesTable.style.display = 'none';
    elements.emptyState.style.display = 'none';
  } else {
    elements.loadingState.style.display = 'none';
  }
}

/**
 * Modal utilities
 */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/**
 * Modern Toast Notifications
 */
function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    danger: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };

  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-circle-info'} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" aria-label="Close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 300ms ease, transform 300ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Helpers
 */
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function getInitials(name) {
  if (!name) return 'CH';
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
