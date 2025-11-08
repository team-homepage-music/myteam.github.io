const mdCache = new Map();

function fetchMarkdown(src) {
  if (!mdCache.has(src)) {
    mdCache.set(src, fetch(src).then((res) => {
      if (!res.ok) {
        throw new Error('Failed to load markdown');
      }
      return res.text();
    }));
  }
  return mdCache.get(src);
}

function parseSections(text) {
  const sections = {};
  let current = 'default';
  sections[current] = [];
  text.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^##\s*(.+)$/);
    if (match) {
      current = match[1].trim().toLowerCase();
      if (!sections[current]) sections[current] = [];
      return;
    }
    sections[current].push(line);
  });
  return sections;
}

function renderMarkdown(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-md]').forEach((target) => {
    const src = target.getAttribute('data-md');
    const key = target.getAttribute('data-md-key');
    if (!src) return;

    fetchMarkdown(src)
      .then((text) => {
        const sections = parseSections(text);
        const sectionKey = key ? key.toLowerCase() : 'default';
        const raw = sections[sectionKey] ? sections[sectionKey].join('\n') : text;
        target.innerHTML = renderMarkdown(raw) || 'Content unavailable.';
      })
      .catch(() => {
        target.textContent = 'Content unavailable.';
      });
  });
});
