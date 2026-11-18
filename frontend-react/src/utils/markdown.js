/**
 * Lightweight Markdown Formatter for Educational Outputs
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatMarkdown(text) {
  if (!text) return '';

  let html = escapeHtml(text);

  // Fenced Code blocks
  html = html.replace(/```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
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

export function getInitials(name) {
  if (!name) return 'CH';
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
