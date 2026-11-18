import React, { useState } from 'react';
import { aiApi } from '../../services/aiApi';
import { formatMarkdown } from '../../utils/markdown';

export default function StudyPlanner({ sessionId, onShowToast }) {
  const [formData, setFormData] = useState({
    subject: '',
    skillLevel: 'Intermediate',
    goal: '',
    studyTime: '2 hours per day',
    duration: '30 Days'
  });
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const keyMap = {
      'plan-subject': 'subject',
      'plan-level': 'skillLevel',
      'plan-goal': 'goal',
      'plan-time': 'studyTime',
      'plan-duration': 'duration'
    };
    setFormData((prev) => ({ ...prev, [keyMap[id] || id]: value }));
  };

  const handleLoadSample = () => {
    setFormData({
      subject: 'Full-Stack Web Development & Cloud Native Microservices',
      skillLevel: 'Beginner',
      goal: 'Build and deploy a scalable academic learning platform for the IBM Capstone assessment',
      studyTime: '2 hours per day',
      duration: '30 Days'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.goal.trim()) {
      alert('Please provide both the subject and learning goal.');
      return;
    }

    setLoading(true);
    setPlanResult(null);

    try {
      const data = await aiApi.generateStudyPlan(formData, sessionId);
      setPlanResult(data.plan);
      onShowToast('Study Plan Generated', 'Gemini successfully generated your personalized roadmap.', 'success');
    } catch (err) {
      onShowToast('Plan Generation Failed', err.message, 'danger');
      setPlanResult(`**Generation Error:** ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!planResult) return;
    navigator.clipboard.writeText(planResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="study-planner-section" className="ai-section-wrapper">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Planner Form Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fa-regular fa-calendar-check" style={{ color: 'var(--primary)' }}></i>
              Study Plan Parameters
            </h3>
            <button
              id="study-plan-preset-btn"
              type="button"
              className="btn-subtle"
              style={{ fontSize: '0.75rem' }}
              onClick={handleLoadSample}
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Load Sample
            </button>
          </div>

          <form id="study-plan-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="plan-subject">
                Subject or Course Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="plan-subject"
                className="form-control"
                placeholder="e.g. Full Stack Cloud Development with Node.js & React"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-level">
                Current Skill Level
              </label>
              <select
                id="plan-level"
                className="form-control"
                value={formData.skillLevel}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner (Foundations &amp; Syntax)</option>
                <option value="Intermediate">Intermediate (Built projects, need architecture)</option>
                <option value="Advanced">Advanced (Production patterns, scale, DevOps)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="plan-goal">
                Primary Learning Objective <span className="req">*</span>
              </label>
              <textarea
                id="plan-goal"
                className="form-control"
                style={{ minHeight: '80px' }}
                placeholder="e.g. Build an end-to-end full stack application and pass university assessment"
                value={formData.goal}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="plan-time">
                  Daily Study Time
                </label>
                <input
                  type="text"
                  id="plan-time"
                  className="form-control"
                  value={formData.studyTime}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="plan-duration">
                  Desired Timeline
                </label>
                <input
                  type="text"
                  id="plan-duration"
                  className="form-control"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <i className="fa-solid fa-sparkles"></i>{' '}
              {loading ? 'Synthesizing with Gemini...' : 'Generate AI Study Roadmap'}
            </button>
          </form>
        </div>

        {/* Generated Plan Result Panel */}
        <div
          id="study-plan-result"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: loading || planResult ? 'block' : 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem'
            }}
          >
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fa-solid fa-route" style={{ color: 'var(--primary)' }}></i>
              Synthesized Learning Roadmap
            </h3>
            {planResult && (
              <button
                id="copy-plan-btn"
                className="btn-secondary"
                style={{ fontSize: '0.75rem' }}
                onClick={handleCopy}
              >
                <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'}></i>{' '}
                {copied ? 'Copied!' : 'Copy Plan'}
              </button>
            )}
          </div>

          <div id="study-plan-output" style={{ lineHeight: 1.7, fontSize: '0.875rem', color: 'var(--text-main)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div className="loading-spinner"></div>
                <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                  Synthesizing personalized study roadmap via Gemini AI...
                </p>
              </div>
            ) : planResult ? (
              <div dangerouslySetInnerHTML={{ __html: formatMarkdown(planResult) }} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
