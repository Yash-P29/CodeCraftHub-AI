import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/layout/Header';
import NavTabs from './components/layout/NavTabs';
import Footer from './components/layout/Footer';
import MetricsBar from './components/dashboard/MetricsBar';
import Toolbar from './components/dashboard/Toolbar';
import CourseGrid from './components/dashboard/CourseGrid';
import CourseTable from './components/dashboard/CourseTable';
import EmptyState from './components/dashboard/EmptyState';
import LoadingSpinner from './components/dashboard/LoadingSpinner';
import AddCourseModal from './components/modals/AddCourseModal';
import EditCourseModal from './components/modals/EditCourseModal';
import CourseDetailsModal from './components/modals/CourseDetailsModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import ChatAssistant from './components/ai/ChatAssistant';
import StudyPlanner from './components/ai/StudyPlanner';
import CourseTutor from './components/ai/CourseTutor';
import Recommendations from './components/ai/Recommendations';
import ToastContainer from './components/shared/ToastContainer';
import { useToast } from './hooks/useToast';
import { courseApi } from './services/courseApi';
import { aiApi } from './services/aiApi';

export default function App() {
  // Session ID for SQLite database persistence
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

  // Active platform tab
  const [activeTab, setActiveTab] = useState('catalog');

  // Courses and UI state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [serverOnline, setServerOnline] = useState(true);
  const [aiHealth, setAiHealth] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    level: 'All'
  });

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [detailsCourse, setDetailsCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification hook
  const { toasts, showToast, removeToast } = useToast();

  // Enforce mandatory document title on mount
  useEffect(() => {
    document.title = 'CodeCraftHub: Your Learning Management Platform';
  }, []);

  // Check health and connectivity
  const checkHealth = useCallback(async () => {
    try {
      const sHealth = await courseApi.checkHealth();
      setServerOnline(!!(sHealth && sHealth.status === 'healthy'));
    } catch {
      setServerOnline(false);
    }

    try {
      const aHealth = await aiApi.checkHealth();
      setAiHealth(aHealth);
    } catch {
      setAiHealth(null);
    }
  }, []);

  // Fetch course catalog
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (err) {
      showToast('Connection Error', err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    checkHealth();
    fetchCourses();
  }, [checkHealth, fetchCourses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return courses.filter((c) => {
      const matchesSearch =
        !q ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.instructor && c.instructor.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q));

      const matchesCategory =
        filters.category === 'All' ||
        (c.category && c.category.toLowerCase() === filters.category.toLowerCase());

      const matchesStatus =
        filters.status === 'All' ||
        (c.status && c.status.toLowerCase() === filters.status.toLowerCase());

      const matchesLevel =
        filters.level === 'All' ||
        (c.level && c.level.toLowerCase() === filters.level.toLowerCase());

      return matchesSearch && matchesCategory && matchesStatus && matchesLevel;
    });
  }, [courses, filters]);

  // Handlers for Filters
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      status: 'All',
      level: 'All'
    });
  };

  // Handlers for CRUD Operations
  const handleAddCourse = async (newCourseData) => {
    try {
      const created = await courseApi.create(newCourseData);
      setCourses((prev) => [created, ...prev]);
      showToast('Course Created Successfully', `"${created.title}" has been saved to persistent storage.`, 'success');
      return created;
    } catch (err) {
      showToast('Creation Failed', err.message, 'danger');
      throw err;
    }
  };

  const handleEdit = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (course) setEditingCourse(course);
  };

  const handleUpdateCourse = async (courseId, updatedData) => {
    try {
      const updated = await courseApi.update(courseId, updatedData);
      setCourses((prev) => prev.map((c) => (String(c.id) === String(courseId) ? updated : c)));
      showToast('Course Updated', `"${updated.title}" has been updated successfully.`, 'success');
      return updated;
    } catch (err) {
      showToast('Update Failed', err.message, 'danger');
      throw err;
    }
  };

  const handleViewDetails = async (courseId) => {
    try {
      const course = await courseApi.getById(courseId);
      setDetailsCourse(course);
    } catch (err) {
      showToast('Error', err.message, 'danger');
    }
  };

  // MANDATORY: handleDelete function matching requirement
  const handleDelete = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (course) {
      setDeletingCourse(course);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      const deleted = await courseApi.delete(deletingCourse.id);
      setCourses((prev) => prev.filter((c) => String(c.id) !== String(deletingCourse.id)));
      showToast('Course Deleted', `"${deleted.title || deletingCourse.id}" was permanently removed.`, 'info');
      setDeletingCourse(null);
    } catch (err) {
      showToast('Deletion Failed', err.message, 'danger');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset demo data handler
  const handleResetDemoData = async () => {
    if (
      !window.confirm(
        'Reset the course catalog to the initial Coursera demonstration state? Any custom additions will be reverted.'
      )
    ) {
      return;
    }

    try {
      const resetCourses = await courseApi.resetDemoData();
      setCourses(resetCourses);
      handleResetFilters();
      showToast('Catalog Reset', 'Course catalog restored to initial demonstration seed data.', 'success');
    } catch (err) {
      showToast('Reset Failed', err.message, 'danger');
    }
  };

  // Navigate to course details from recommendation
  const handleSelectCourseFromRecommendation = (courseId) => {
    setActiveTab('catalog');
    handleViewDetails(courseId);
  };

  return (
    <>
      <Header
        serverOnline={serverOnline}
        aiHealth={aiHealth}
        onResetDemo={handleResetDemoData}
        onOpenAddModal={() => setIsAddOpen(true)}
      />

      <NavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-wrapper">
        {/* VIEW 1: Courses Dashboard & Management */}
        {activeTab === 'catalog' && (
          <div id="catalog-view-section">
            <MetricsBar courses={courses} />

            <Toolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            <div className="content-header">
              <h2>
                <span>Available Courses</span>
                <span id="displayed-count" className="course-count-tag">
                  {filteredCourses.length} of {courses.length} courses
                </span>
              </h2>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : filteredCourses.length === 0 ? (
              <EmptyState
                onResetFilters={handleResetFilters}
                onOpenAddModal={() => setIsAddOpen(true)}
              />
            ) : viewMode === 'grid' ? (
              <CourseGrid
                courses={filteredCourses}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <CourseTable
                courses={filteredCourses}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* VIEW 2: AI Learning Assistant */}
        {activeTab === 'assistant' && (
          <ChatAssistant sessionId={sessionId} onShowToast={showToast} />
        )}

        {/* VIEW 3: Personalized Study Plan Generator */}
        {activeTab === 'planner' && (
          <StudyPlanner sessionId={sessionId} onShowToast={showToast} />
        )}

        {/* VIEW 4: Course-Aware AI Tutor */}
        {activeTab === 'tutor' && (
          <CourseTutor courses={courses} sessionId={sessionId} onShowToast={showToast} />
        )}

        {/* VIEW 5: Intelligent Course Recommendations */}
        {activeTab === 'recommendations' && (
          <Recommendations
            sessionId={sessionId}
            onSelectCourse={handleSelectCourseFromRecommendation}
            onShowToast={showToast}
          />
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AddCourseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddCourse={handleAddCourse}
      />

      <EditCourseModal
        isOpen={!!editingCourse}
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onUpdateCourse={handleUpdateCourse}
      />

      <CourseDetailsModal
        isOpen={!!detailsCourse}
        course={detailsCourse}
        onClose={() => setDetailsCourse(null)}
        onEdit={(id) => {
          setDetailsCourse(null);
          handleEdit(id);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingCourse}
        course={deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirmDelete={handleConfirmDelete}
        deleting={isDeleting}
      />

      {/* Floating Toast Notification System */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
