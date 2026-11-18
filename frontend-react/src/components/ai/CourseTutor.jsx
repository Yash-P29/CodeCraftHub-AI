import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { formatMarkdown } from '../../utils/markdown';

export default function CourseTutor({ courses, sessionId, onShowToast }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    { label: 'After React & Node?', q: 'What should I learn after completing React and Node.js?' },
    { label: 'Explain CRS-102 Curriculum', q: 'Explain the curriculum and outcomes of course CRS-102 Cloud Native Architecture.' },
    { label: 'DevOps & CI/CD Courses', q: 'Which courses in CodeCraftHub cover DevOps, CI/CD, and Docker?' },
    { label: 'Data Engineering Prerequisites', q: 'What are the prerequisites for the Data Engineering course with Apache Spark?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const text = inputVal.trim();
    if (!text || isGenerating) return;

    setInputVal('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'model')
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await aiApi.askCourseTutor(
        text,
        selectedCourseId || null,
        history,
        sessionId
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: data.answer,
          referencedCourses: data.referencedCourses || [],
          model: data.model,
          latency: data.latency
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: `Error: ${err.message}`
        }
      ]);
      onShowToast('Tutor Error', err.message, 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="course-tutor-section" className="ai-section-wrapper">
      <div className="chat-card">
        <div className="chat-header">
          <div className="chat-header-title">
            <div
              className="instructor-avatar"
              style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
            >
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div>
              <h3>Course-Aware AI Tutor</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Grounded exclusively in CodeCraftHub&apos;s real persistent course catalog
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="tutor-course-select" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target Focus:
            </label>
            <select
              id="tutor-course-select"
              className="filter-select"
              style={{ padding: '0.4rem 1.8rem 0.4rem 0.75rem', fontSize: '0.8125rem' }}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">All Courses (Whole Catalog)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} &mdash; {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div id="tutor-messages" className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty-intro">
              <div
                className="intro-avatar"
                style={{ background: 'linear-gradient(135deg, #059669, #10B981)' }}
              >
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h4>Ask About CodeCraftHub Courses</h4>
              <p>
                Ask syllabus questions, prerequisite pathways, or topics covered across your active and upcoming courses.
              </p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble chat-${m.role}`}>
                <div className={`bubble-avatar ${m.role === 'user' ? 'user-av' : 'ai-av'}`}>
                  <i className={`fa-solid ${m.role === 'user' ? 'fa-user' : 'fa-graduation-cap'}`}></i>
                </div>
                <div className="bubble-content">
                  <div
                    className="bubble-text"
                    dangerouslySetInnerHTML={{
                      __html: m.role === 'model' ? formatMarkdown(m.content) : m.content
                    }}
                  />
                  {m.role === 'model' && m.referencedCourses && m.referencedCourses.length > 0 && (
                    <div className="referenced-courses-container">
                      <span className="ref-label">Verified Course Context:</span>
                      <div className="ref-pills">
                        {m.referencedCourses.map((c) => (
                          <span key={c.id} className="referenced-course-pill" title={c.title}>
                            <i className="fa-solid fa-bookmark"></i> {c.id}: {c.title.slice(0, 32)}...
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.role === 'model' && m.model && (
                    <div className="chat-meta">
                      Grounded by {m.model} &bull; {m.latency ? m.latency + 's' : 'live'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="chat-bubble chat-model typing-indicator">
              <div className="bubble-avatar ai-av">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="bubble-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="prompt-chips-bar">
          <span className="prompt-chips-label">
            <i className="fa-solid fa-bookmark"></i> Catalog Prompts:
          </span>
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              className="tutor-chip prompt-chip"
              onClick={() => setInputVal(q.q)}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="chat-input-bar">
          <form id="course-tutor-form" className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              id="course-tutor-input"
              className="chat-input-field"
              placeholder="Ask a question about CodeCraftHub courses or curricula..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary" disabled={isGenerating}>
              <i className="fa-solid fa-paper-plane"></i>
              <span>Ask Tutor</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
