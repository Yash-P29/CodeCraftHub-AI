import React from 'react';

export default function NavTabs({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'catalog', label: 'Courses Dashboard', icon: 'fa-solid fa-graduation-cap' },
    { id: 'assistant', label: 'AI Learning Assistant', icon: 'fa-solid fa-brain', badge: 'Gemini' },
    { id: 'planner', label: 'Study Planner', icon: 'fa-regular fa-calendar-check' },
    { id: 'tutor', label: 'Course-Aware Tutor', icon: 'fa-solid fa-chalkboard-user' },
    { id: 'recommendations', label: 'AI Recommendations', icon: 'fa-solid fa-wand-magic-sparkles' }
  ];

  return (
    <nav className="nav-tabs-bar" aria-label="Platform Views">
      <div className="nav-tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            data-tab={tab.id}
            onClick={() => onSelectTab(tab.id)}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
            {tab.badge && <span className="nav-tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}
