import React, { useState } from 'react';
import { aiApi } from '../../services/aiApi';
import { formatMarkdown } from '../../utils/markdown';

export default function Recommendations({ sessionId, onSelectCourse, onShowToast }) {
  const [formData, setFormData] = useState({
    interests: '',
    currentSkills: '',
    careerGoal: ''
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handlePreset = (type) => {
    if (type === 'cloud') {
      setFormData({
        interests: 'Microservices, Docker containers, Kubernetes orchestration, and Cloud Infrastructure',
        currentSkills: 'Basic Linux commands and JavaScript foundations',
        careerGoal: 'Cloud Native Software Engineer / DevOps Architect'
      });
    } else if (type === 'fullstack') {
      setFormData({
        interests: 'Modern web frameworks, React, Node.js REST APIs, and end-to-end web deployment',
        currentSkills: 'HTML, CSS, JavaScript basics',
        careerGoal: 'Full-Stack Software Developer'
      });
    } else if (type === 'data') {
      setFormData({
        interests: 'Data engineering, relational database schemas, Apache Spark big data, and ETL pipelines',
        currentSkills: 'Python fundamentals and SQL basics',
        careerGoal: 'Data Platform Engineer / Analytics Architect'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interests.trim() || !formData.careerGoal.trim()) {
      alert('Please fill out your technical interests and desired career goal.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const data = await aiApi.getRecommendations(formData, sessionId);
      setResults(data);
      onShowToast('Recommendations Synthesized', 'Gemini successfully analyzed your profile against the catalog.', 'success');
    } catch (err) {
      onShowToast('Recommendation Error', err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-recommendations-section" className="ai-section-wrapper">
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--primary)' }}></i>
          Personalized Career &amp; Course Matching Engine
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem'
          }}
        >
          Tell the Gemini AI engine about your background and career goals. It will analyze the live course
          catalog to synthesize the ideal learning sequence.
        </p>

        <div className="rec-presets-bar">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Career Quick-Select:
          </span>
          <button
            type="button"
            className="rec-preset-pill"
            onClick={() => handlePreset('fullstack')}
          >
            Full-Stack Software Engineer
          </button>
          <button
            type="button"
            className="rec-preset-pill"
            onClick={() => handlePreset('cloud')}
          >
            Cloud DevOps &amp; Microservices
          </button>
          <button
            type="button"
            className="rec-preset-pill"
            onClick={() => handlePreset('data')}
          >
            Data Platform &amp; Analytics Engineer
          </button>
        </div>

        <form id="ai-rec-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="rec-interests">
                Technical Interests &amp; Topics <span className="req">*</span>
              </label>
              <input
                type="text"
                id="rec-interests"
                className="form-control"
                placeholder="e.g. REST APIs, React components, Docker, Kubernetes"
                value={formData.interests}
                onChange={(e) => setFormData((prev) => ({ ...prev, interests: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="rec-skills">
                Current Skills / Foundations
              </label>
              <input
                type="text"
                id="rec-skills"
                className="form-control"
                placeholder="e.g. Basic HTML/CSS/JS, beginner Git commands"
                value={formData.currentSkills}
                onChange={(e) => setFormData((prev) => ({ ...prev, currentSkills: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rec-career">
              Desired Career Direction / Capstone Goal <span className="req">*</span>
            </label>
            <input
              type="text"
              id="rec-career"
              className="form-control"
              placeholder="e.g. Full-Stack Cloud Engineer at an enterprise tech company"
              value={formData.careerGoal}
              onChange={(e) => setFormData((prev) => ({ ...prev, careerGoal: e.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            <i className="fa-solid fa-compass"></i>{' '}
            {loading ? 'Synthesizing with Gemini...' : 'Synthesize Recommendations'}
          </button>
        </form>
      </div>

      {/* Recommendation Results */}
      {(loading || results) && (
        <div id="rec-results-container">
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <h4
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fa-solid fa-chart-line" style={{ color: 'var(--primary)' }}></i>
              AI Career Pathway Analysis
            </h4>
            <div id="rec-analysis-output" style={{ lineHeight: 1.7, fontSize: '0.875rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading-spinner"></div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                    Comparing your profile against active CodeCraftHub catalog...
                  </p>
                </div>
              ) : results ? (
                <div dangerouslySetInnerHTML={{ __html: formatMarkdown(results.analysis) }} />
              ) : null}
            </div>
          </div>

          {results && results.recommendedCourses && results.recommendedCourses.length > 0 && (
            <>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '0.5rem'
                }}
              >
                Catalog Matches &amp; Learning Sequence
              </h3>
              <div id="rec-cards-grid" className="rec-cards-grid">
                {results.recommendedCourses.map((c, i) => (
                  <div key={c.id || i} className="rec-course-card">
                    <div className="rec-rank-badge">#{i + 1} Suggested</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}
                    >
                      <span className="card-id-tag">{c.id}</span>
                      <span className={`badge-status ${(c.status || 'Active').toLowerCase()}`}>
                        {c.status || 'Active'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                      {c.title}
                    </h4>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <i className="fa-solid fa-user-tie"></i> {c.instructor || 'Staff'} &bull;{' '}
                      {c.category || 'General'}
                    </div>
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => onSelectCourse(c.id)}
                    >
                      <i className="fa-solid fa-circle-info"></i> View Course Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
