/**
 * CodeCraft AI: Intelligent Learning Capabilities Module
 * Powers the 4 Generative AI Features:
 * 1. AI Learning Assistant (Chat)
 * 2. Personalized Study Plan Generator
 * 3. Course-Aware AI Tutor
 * 4. Intelligent Course Recommendation Engine
 */

// AI Conversation States
const aiState = {
  activeTab: 'catalog', // 'catalog' | 'assistant' | 'planner' | 'tutor' | 'recommendations'
  chatHistory: [],
  tutorHistory: [],
  isGenerating: false,
  aiHealth: null
};

document.addEventListener('DOMContentLoaded', () => {
  initAINavigation();
  initAIChatAssistant();
  initStudyPlanner();
  initCourseTutor();
  initCourseRecommendations();
  checkAIServiceHealth();
});

/**
 * Tab Navigation Controller
 */
function initAINavigation() {
  const tabs = document.querySelectorAll('.nav-tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchAITab(target);
    });
  });
}

function switchAITab(tabId) {
  aiState.activeTab = tabId;

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });

  // Views
  const views = {
    catalog: document.getElementById('catalog-view-section'),
    assistant: document.getElementById('ai-assistant-section'),
    planner: document.getElementById('study-planner-section'),
    tutor: document.getElementById('course-tutor-section'),
    recommendations: document.getElementById('ai-recommendations-section')
  };

  Object.entries(views).forEach(([id, el]) => {
    if (el) {
      el.style.display = (id === tabId) ? 'block' : 'none';
    }
  });

  // If opening tutor, populate course selector with latest courses
  if (tabId === 'tutor') {
    populateTutorCourseSelect();
  }
}

/**
 * Health & Configuration Check
 */
async function checkAIServiceHealth() {
  const badge = document.getElementById('ai-status-pill');
  if (!badge) return;

  try {
    const health = await window.AIApi.checkHealth();
    aiState.aiHealth = health;

    if (health && health.aiService && health.aiService.online) {
      const model = health.aiService.model || 'Gemini';
      badge.innerHTML = `
        <span class="ai-status-dot"></span>
        <span>Gemini AI Online (${escapeHtml(model)})</span>
      `;
      badge.classList.remove('status-offline');
      badge.title = `Model: ${health.aiService.model} | Key: ${health.aiService.maskedKey || 'Configured'}`;
    } else {
      badge.innerHTML = `
        <span class="ai-status-dot" style="background-color: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>
        <span style="color: #EF4444;">AI Microservice Offline</span>
      `;
      badge.title = 'Python Flask AI microservice is not responding on port 5001. Run: cd backend/ai-service && python app.py';
    }
  } catch {
    badge.innerHTML = `
      <span class="ai-status-dot" style="background-color: #EF4444;"></span>
      <span style="color: #EF4444;">AI Offline</span>
    `;
  }
}

/**
 * FEATURE 1: AI Learning Assistant
 */
function initAIChatAssistant() {
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const clearBtn = document.getElementById('clear-chat-btn');
  const messagesBox = document.getElementById('chat-messages');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message || aiState.isGenerating) return;

    input.value = '';
    appendChatMessage('user', message);

    aiState.isGenerating = true;
    const typingId = showTypingIndicator(messagesBox);

    try {
      const data = await window.AIApi.sendChatMessage(message, aiState.chatHistory);
      removeTypingIndicator(typingId);
      appendChatMessage('model', data.response, data.model, data.latency);
      aiState.chatHistory.push({ role: 'user', content: message });
      aiState.chatHistory.push({ role: 'model', content: data.response });
    } catch (err) {
      removeTypingIndicator(typingId);
      appendChatMessage('error', `Error: ${err.message}`);
    } finally {
      aiState.isGenerating = false;
      input.focus();
    }
  });

  // Suggested Prompts
  document.querySelectorAll('.prompt-chip[data-prompt]').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.prompt;
      form.dispatchEvent(new Event('submit'));
    });
  });

  // Clear Chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear current learning assistant session history?')) {
        aiState.chatHistory = [];
        messagesBox.innerHTML = `
          <div class="chat-empty-intro">
            <div class="intro-avatar"><i class="fa-solid fa-brain"></i></div>
            <h4>CodeCraft AI Learning Assistant</h4>
            <p>Ask any programming, architectural, or technical question to receive a structured explanation.</p>
          </div>
        `;
      }
    });
  }
}

function appendChatMessage(role, content, model = null, latency = null) {
  const messagesBox = document.getElementById('chat-messages');
  if (!messagesBox) return;

  // Remove empty intro if present
  const intro = messagesBox.querySelector('.chat-empty-intro');
  if (intro) intro.remove();

  const msgEl = document.createElement('div');
  msgEl.className = `chat-bubble chat-${role}`;

  const formattedContent = (role === 'model') ? formatMarkdown(content) : escapeHtml(content);

  let metaHtml = '';
  if (role === 'model' && model) {
    metaHtml = `<div class="chat-meta">Generated by ${escapeHtml(model)} &bull; ${latency ? latency + 's' : 'live'}</div>`;
  }

  const avatar = role === 'user' ? '<div class="bubble-avatar user-av"><i class="fa-solid fa-user"></i></div>' : '<div class="bubble-avatar ai-av"><i class="fa-solid fa-sparkles"></i></div>';

  msgEl.innerHTML = `
    ${avatar}
    <div class="bubble-content">
      <div class="bubble-text">${formattedContent}</div>
      ${metaHtml}
    </div>
  `;

  messagesBox.appendChild(msgEl);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function showTypingIndicator(container) {
  const id = `typing-${Date.now()}`;
  const el = document.createElement('div');
  el.id = id;
  el.className = 'chat-bubble chat-model typing-indicator';
  el.innerHTML = `
    <div class="bubble-avatar ai-av"><i class="fa-solid fa-sparkles"></i></div>
    <div class="bubble-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/**
 * FEATURE 2: Personalized Study Plan Generator
 */
function initStudyPlanner() {
  const form = document.getElementById('study-plan-form');
  const resultsContainer = document.getElementById('study-plan-result');
  const planOutput = document.getElementById('study-plan-output');
  const presetBtn = document.getElementById('study-plan-preset-btn');
  const copyBtn = document.getElementById('copy-plan-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subject = document.getElementById('plan-subject').value.trim();
    const skillLevel = document.getElementById('plan-level').value;
    const goal = document.getElementById('plan-goal').value.trim();
    const studyTime = document.getElementById('plan-time').value.trim();
    const duration = document.getElementById('plan-duration').value.trim();

    if (!subject || !goal) {
      alert('Please provide both the subject and learning goal.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Plan with Gemini...';

    resultsContainer.style.display = 'block';
    planOutput.innerHTML = `
      <div style="text-align: center; padding: 2.5rem;">
        <div class="loading-spinner"></div>
        <p style="color: var(--text-secondary); margin-top: 1rem;">Synthesizing personalized study roadmap via Gemini AI...</p>
      </div>
    `;

    try {
      const data = await window.AIApi.generateStudyPlan({
        subject,
        skillLevel,
        goal,
        studyTime,
        duration
      });

      planOutput.innerHTML = formatMarkdown(data.plan);
      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      planOutput.innerHTML = `
        <div style="background-color: var(--danger-bg); border: 1px solid var(--danger); padding: 1.25rem; border-radius: var(--radius-md); color: var(--text-main);">
          <strong>Generation Error:</strong> ${escapeHtml(err.message)}
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Pre-fill sample values
  if (presetBtn) {
    presetBtn.addEventListener('click', () => {
      document.getElementById('plan-subject').value = 'Full-Stack Web Development & Cloud Native Microservices';
      document.getElementById('plan-level').value = 'Beginner';
      document.getElementById('plan-goal').value = 'Build and deploy a scalable academic learning platform for the IBM Capstone assessment';
      document.getElementById('plan-time').value = '2 hours per day';
      document.getElementById('plan-duration').value = '30 Days';
    });
  }

  // Copy Plan
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = planOutput.innerText;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Plan';
        }, 2000);
      });
    });
  }
}

/**
 * FEATURE 3: Course-Aware AI Tutor
 */
function initCourseTutor() {
  const form = document.getElementById('course-tutor-form');
  const input = document.getElementById('course-tutor-input');
  const courseSelect = document.getElementById('tutor-course-select');
  const messagesBox = document.getElementById('tutor-messages');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    const courseId = courseSelect.value || null;

    if (!question || aiState.isGenerating) return;

    input.value = '';
    appendTutorMessage('user', question);

    aiState.isGenerating = true;
    const typingId = showTypingIndicator(messagesBox);

    try {
      const data = await window.AIApi.askCourseTutor(question, courseId, aiState.tutorHistory);
      removeTypingIndicator(typingId);
      appendTutorMessage('model', data.answer, data.referencedCourses, data.model, data.latency);
      aiState.tutorHistory.push({ role: 'user', content: question });
      aiState.tutorHistory.push({ role: 'model', content: data.answer });
    } catch (err) {
      removeTypingIndicator(typingId);
      appendTutorMessage('error', `Error: ${err.message}`);
    } finally {
      aiState.isGenerating = false;
      input.focus();
    }
  });

  // Suggested Tutor Questions
  document.querySelectorAll('.tutor-chip[data-tutor-q]').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.tutorQ;
      form.dispatchEvent(new Event('submit'));
    });
  });
}

function populateTutorCourseSelect() {
  const select = document.getElementById('tutor-course-select');
  if (!select) return;

  const currentSelection = select.value;
  select.innerHTML = '<option value="">All Courses (Whole Catalog)</option>';

  const courses = (window.state && window.state.courses) ? window.state.courses : [];
  courses.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.id} — ${c.title} (${c.category})`;
    if (c.id === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

function appendTutorMessage(role, content, referencedCourses = [], model = null, latency = null) {
  const messagesBox = document.getElementById('tutor-messages');
  if (!messagesBox) return;

  const intro = messagesBox.querySelector('.chat-empty-intro');
  if (intro) intro.remove();

  const msgEl = document.createElement('div');
  msgEl.className = `chat-bubble chat-${role}`;

  const formattedContent = (role === 'model') ? formatMarkdown(content) : escapeHtml(content);

  let badgeHtml = '';
  if (role === 'model' && referencedCourses && referencedCourses.length > 0) {
    const pills = referencedCourses.map(c => `
      <span class="referenced-course-pill" title="${escapeHtml(c.title)}">
        <i class="fa-solid fa-bookmark"></i> ${escapeHtml(c.id)}: ${escapeHtml(c.title.slice(0, 32))}...
      </span>
    `).join('');
    badgeHtml = `
      <div class="referenced-courses-container">
        <span class="ref-label">Verified Course Context:</span>
        <div class="ref-pills">${pills}</div>
      </div>
    `;
  }

  let metaHtml = '';
  if (role === 'model' && model) {
    metaHtml = `<div class="chat-meta">Grounded by ${escapeHtml(model)} &bull; ${latency ? latency + 's' : 'live'}</div>`;
  }

  const avatar = role === 'user' ? '<div class="bubble-avatar user-av"><i class="fa-solid fa-user"></i></div>' : '<div class="bubble-avatar ai-av"><i class="fa-solid fa-graduation-cap"></i></div>';

  msgEl.innerHTML = `
    ${avatar}
    <div class="bubble-content">
      <div class="bubble-text">${formattedContent}</div>
      ${badgeHtml}
      ${metaHtml}
    </div>
  `;

  messagesBox.appendChild(msgEl);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

/**
 * FEATURE 4: Intelligent Course Recommendation Engine
 */
function initCourseRecommendations() {
  const form = document.getElementById('ai-rec-form');
  const resultsContainer = document.getElementById('rec-results-container');
  const analysisOutput = document.getElementById('rec-analysis-output');
  const cardsGrid = document.getElementById('rec-cards-grid');
  const presetPills = document.querySelectorAll('.rec-preset-pill[data-preset]');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const interests = document.getElementById('rec-interests').value.trim();
    const currentSkills = document.getElementById('rec-skills').value.trim();
    const careerGoal = document.getElementById('rec-career').value.trim();

    if (!interests || !careerGoal) {
      alert('Please fill out your technical interests and desired career goal.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with Gemini...';

    resultsContainer.style.display = 'block';
    analysisOutput.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div class="loading-spinner"></div>
        <p style="color: var(--text-secondary); margin-top: 1rem;">Comparing your profile against active CodeCraftHub catalog...</p>
      </div>
    `;
    cardsGrid.innerHTML = '';

    try {
      const data = await window.AIApi.getRecommendations({
        interests,
        currentSkills,
        careerGoal
      });

      analysisOutput.innerHTML = formatMarkdown(data.analysis);

      // Render recommended course cards
      if (data.recommendedCourses && data.recommendedCourses.length > 0) {
        cardsGrid.innerHTML = data.recommendedCourses.map((c, i) => `
          <div class="rec-course-card">
            <div class="rec-rank-badge">#${i + 1} Suggested</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <span class="card-id-tag">${escapeHtml(c.id)}</span>
              <span class="badge-status ${(c.status || 'Active').toLowerCase()}">${escapeHtml(c.status || 'Active')}</span>
            </div>
            <h4 style="font-size: 1rem; color: #ffffff; margin-bottom: 0.5rem;">${escapeHtml(c.title)}</h4>
            <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
              <i class="fa-solid fa-user-tie"></i> ${escapeHtml(c.instructor || 'Staff')} &bull; ${escapeHtml(c.category || 'General')}
            </div>
            <button class="btn-secondary" style="width: 100%; justify-content: center;" onclick="navigateToCourseDetails('${c.id}')">
              <i class="fa-solid fa-circle-info"></i> View Course Details
            </button>
          </div>
        `).join('');
      }

      resultsContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      analysisOutput.innerHTML = `
        <div style="background-color: var(--danger-bg); border: 1px solid var(--danger); padding: 1rem; border-radius: var(--radius-md);">
          <strong>Recommendation Error:</strong> ${escapeHtml(err.message)}
        </div>
      `;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Presets
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const p = pill.dataset.preset;
      if (p === 'cloud') {
        document.getElementById('rec-interests').value = 'Microservices, Docker containers, Kubernetes orchestration, and Cloud Infrastructure';
        document.getElementById('rec-skills').value = 'Basic Linux commands and JavaScript foundations';
        document.getElementById('rec-career').value = 'Cloud Native Software Engineer / DevOps Architect';
      } else if (p === 'fullstack') {
        document.getElementById('rec-interests').value = 'Modern web frameworks, React, Node.js REST APIs, and end-to-end web deployment';
        document.getElementById('rec-skills').value = 'HTML, CSS, JavaScript basics';
        document.getElementById('rec-career').value = 'Full-Stack Software Developer';
      } else if (p === 'data') {
        document.getElementById('rec-interests').value = 'Data engineering, relational database schemas, Apache Spark big data, and ETL pipelines';
        document.getElementById('rec-skills').value = 'Python fundamentals and SQL basics';
        document.getElementById('rec-career').value = 'Data Platform Engineer / Analytics Architect';
      }
    });
  });
}

function navigateToCourseDetails(courseId) {
  switchAITab('catalog');
  if (typeof window.handleViewDetails === 'function') {
    window.handleViewDetails(courseId);
  }
}

/**
 * Lightweight Markdown Parser for Educational Outputs
 */
function formatMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // Fenced Code blocks
  html = html.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="code-block"><code class="lang-${lang}">${code}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="md-h4">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="md-h2">$1</h2>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Bullet items
  html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<li class="md-li">$1</li>');
  html = html.replace(/(<li class="md-li">.*<\/li>)/gms, '<ul class="md-ul">$1</ul>');

  // Line breaks to paragraphs
  html = html.replace(/\n\n+/g, '<br><br>');

  return html;
}
