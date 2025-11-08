(function () {
  const root = document.documentElement;
  if (!root.classList.contains('js')) {
    root.classList.add('js');
  }

  setupNavigation();
  hydrateMarkdownBlocks();

  function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('#site-nav');
    const navOverlay = document.querySelector('[data-nav-overlay]');

    if (!navToggle || !siteNav || !navOverlay) {
      return;
    }

    const navLinks = Array.from(siteNav.querySelectorAll('a'));

    const setNavState = (open) => {
      navToggle.setAttribute('aria-expanded', open);
      navToggle.classList.toggle('is-active', open);
      siteNav.classList.toggle('is-open', open);
      navOverlay.classList.toggle('is-active', open);
      document.body.classList.toggle('nav-open', open);
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setNavState(!isOpen);
    });

    navOverlay.addEventListener('click', () => setNavState(false));

    navLinks.forEach((link) => {
      link.addEventListener('click', () => setNavState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setNavState(false);
      }
    });
  }

  function hydrateMarkdownBlocks() {
    const blocks = document.querySelectorAll('[data-md-source]');
    if (!blocks.length) {
      return;
    }

    blocks.forEach((block) => loadMarkdownInto(block));
  }

  async function loadMarkdownInto(block) {
    const source = block.getAttribute('data-md-source');
    if (!source) {
      return;
    }

    try {
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load markdown: ${response.status}`);
      }
      const markdown = await response.text();
      block.innerHTML = renderMarkdown(markdown);
    } catch (error) {
      console.error(error);
      block.innerHTML = '<p class="markdown-block__error">コンテンツを読み込めませんでした。</p>';
    }
  }

  function renderMarkdown(source) {
    if (!source) {
      return '';
    }

    const lines = source.replace(/\r\n/g, '\n').trim().split('\n');
    const html = [];
    let inList = false;

    const closeList = () => {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        closeList();
        return;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        closeList();
        const level = Math.min(trimmed.match(/^#+/)[0].length, 6);
        const text = trimmed.slice(level).trim();
        html.push(`<h${level}>${formatInline(text)}</h${level}>`);
        return;
      }

      if (trimmed.startsWith('- ')) {
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }
        html.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
        return;
      }

      closeList();
      html.push(`<p>${formatInline(trimmed)}</p>`);
    });

    if (inList) {
      closeList();
    }

    return html.join('\n');
  }

  function formatInline(text) {
    if (typeof text !== 'string' || !text) {
      return '';
    }

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      result += applyEmphasis(escapeHtml(text.slice(lastIndex, match.index)));
      result += renderLink(match[1], match[2]);
      lastIndex = match.index + match[0].length;
    }

    result += applyEmphasis(escapeHtml(text.slice(lastIndex)));
    return result;
  }

  function renderLink(label, url) {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      return applyEmphasis(escapeHtml(label || ''));
    }

    const isExternal = /^https?:/i.test(safeUrl);
    const attrs = [`href="${safeUrl}"`];

    if (isExternal) {
      attrs.push('target="_blank"', 'rel="noopener noreferrer"');
    }

    const content = applyEmphasis(escapeHtml(label || ''));
    return `<a ${attrs.join(' ')}>${content}</a>`;
  }

  function sanitizeUrl(url) {
    if (typeof url !== 'string') {
      return '';
    }
    const trimmed = url.trim();
    if (!trimmed || /^(javascript|data):/i.test(trimmed)) {
      return '';
    }
    return escapeHtml(trimmed);
  }

  function applyEmphasis(str) {
    if (!str) {
      return '';
    }
    return str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (char) => {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return char;
      }
    });
  }
})();
