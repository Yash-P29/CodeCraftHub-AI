const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'courses.json');
const DEFAULT_DATA_FILE = path.join(__dirname, '..', '..', 'data', 'courses.default.json');

const VALID_STATUSES = ['Active', 'Upcoming', 'Completed', 'Archived', 'Draft'];
const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

class CourseModel {
  static ensureDataFileExists() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        if (fs.existsSync(DEFAULT_DATA_FILE)) {
          const defaultData = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
          fs.writeFileSync(DATA_FILE, defaultData, 'utf8');
        } else {
          fs.writeFileSync(DATA_FILE, '[]', 'utf8');
        }
      }
    } catch (err) {
      console.error('Error ensuring data file exists:', err.message);
    }
  }

  static readAll() {
    this.ensureDataFileExists();
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const courses = JSON.parse(raw || '[]');
      return Array.isArray(courses) ? courses : [];
    } catch (err) {
      console.error('Failed reading courses from disk:', err.message);
      return [];
    }
  }

  static writeAll(courses) {
    try {
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('Failed writing courses to disk:', err.message);
      throw new Error('Database write failure: Unable to persist course data.');
    }
  }

  static getAll(filters = {}) {
    let courses = this.readAll();

    if (filters.status && filters.status !== 'All') {
      courses = courses.filter(
        c => c.status && c.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.category && filters.category !== 'All') {
      courses = courses.filter(
        c => c.category && c.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      courses = courses.filter(c =>
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.instructor && c.instructor.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q))
      );
    }

    return courses;
  }

  static getById(id) {
    if (!id) return null;
    const courses = this.readAll();
    return courses.find(c => String(c.id).toLowerCase() === String(id).toLowerCase()) || null;
  }

  static generateId(courses) {
    // Generate next CRS-xxx or unique formatted ID
    const maxNum = courses.reduce((acc, c) => {
      const match = String(c.id).match(/CRS-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > acc ? num : acc;
      }
      return acc;
    }, 100);

    return `CRS-${maxNum + 1}`;
  }

  static validate(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate || data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        errors.push('Course title is required and cannot be empty.');
      } else if (data.title.trim().length < 3) {
        errors.push('Course title must be at least 3 characters long.');
      }
    }

    if (!isUpdate || data.instructor !== undefined) {
      if (!data.instructor || typeof data.instructor !== 'string' || data.instructor.trim().length === 0) {
        errors.push('Instructor name is required.');
      }
    }

    if (!isUpdate || data.description !== undefined) {
      if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Course description is required.');
      }
    }

    if (data.status !== undefined) {
      if (!VALID_STATUSES.includes(data.status)) {
        errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`);
      }
    }

    if (data.level !== undefined && data.level !== '') {
      if (!VALID_LEVELS.includes(data.level)) {
        errors.push(`Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}.`);
      }
    }

    return errors;
  }

  static create(data) {
    const validationErrors = this.validate(data, false);
    if (validationErrors.length > 0) {
      const error = new Error(validationErrors.join(' '));
      error.statusCode = 400;
      error.details = validationErrors;
      throw error;
    }

    const courses = this.readAll();
    const newId = data.id && !courses.some(c => c.id === data.id)
      ? data.id
      : this.generateId(courses);

    const now = new Date().toISOString();
    const newCourse = {
      id: newId,
      title: data.title.trim(),
      description: data.description.trim(),
      instructor: data.instructor.trim(),
      category: data.category ? data.category.trim() : 'General',
      status: data.status || 'Active',
      duration: data.duration ? data.duration.trim() : 'Self-Paced',
      level: data.level || 'Intermediate',
      enrolledStudents: typeof data.enrolledStudents === 'number' ? data.enrolledStudents : 0,
      rating: typeof data.rating === 'number' ? data.rating : 5.0,
      createdAt: now,
      updatedAt: now
    };

    courses.push(newCourse);
    this.writeAll(courses);
    return newCourse;
  }

  static update(id, data) {
    const courses = this.readAll();
    const index = courses.findIndex(c => String(c.id).toLowerCase() === String(id).toLowerCase());

    if (index === -1) {
      const error = new Error(`Course with ID '${id}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    const validationErrors = this.validate(data, true);
    if (validationErrors.length > 0) {
      const error = new Error(validationErrors.join(' '));
      error.statusCode = 400;
      error.details = validationErrors;
      throw error;
    }

    const existing = courses[index];
    const updatedCourse = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      instructor: data.instructor !== undefined ? data.instructor.trim() : existing.instructor,
      category: data.category !== undefined ? data.category.trim() : existing.category,
      status: data.status !== undefined ? data.status : existing.status,
      duration: data.duration !== undefined ? data.duration.trim() : existing.duration,
      level: data.level !== undefined ? data.level : existing.level,
      enrolledStudents: typeof data.enrolledStudents === 'number' ? data.enrolledStudents : existing.enrolledStudents,
      rating: typeof data.rating === 'number' ? data.rating : existing.rating,
      updatedAt: new Date().toISOString()
    };

    courses[index] = updatedCourse;
    this.writeAll(courses);
    return updatedCourse;
  }

  static delete(id) {
    const courses = this.readAll();
    const index = courses.findIndex(c => String(c.id).toLowerCase() === String(id).toLowerCase());

    if (index === -1) {
      const error = new Error(`Course with ID '${id}' not found.`);
      error.statusCode = 404;
      throw error;
    }

    const [deletedCourse] = courses.splice(index, 1);
    this.writeAll(courses);
    return deletedCourse;
  }

  static resetToDefault() {
    if (fs.existsSync(DEFAULT_DATA_FILE)) {
      const content = fs.readFileSync(DEFAULT_DATA_FILE, 'utf8');
      fs.writeFileSync(DATA_FILE, content, 'utf8');
      return JSON.parse(content);
    }
    return [];
  }
}

module.exports = {
  CourseModel,
  VALID_STATUSES,
  VALID_LEVELS
};
