(() => {
  const worksData = {
    music: [
      {
        slug: 'work-1',
        title: '作品 1',
        year: '2024',
        location: 'Tokyo',
        description: 'サウンドインスタレーションのプレースホルダ。詳細は今後追記予定です。',
        image: 'assets/images/works/work-1.jpg'
      },
      {
        slug: 'work-2',
        title: '作品 2',
        year: '2023',
        location: 'Kyoto',
        description: 'ライブセット用トラック集。サムネイルと本文は仮の要素です。',
        image: 'assets/images/works/work-2.jpg'
      }
    ],
    art: [
      {
        slug: 'atlas',
        title: 'Atlas',
        year: '2022',
        location: 'Berlin',
        description: 'ミックスメディア作品。観客の位置で映像が変化する設定を想定しています。',
        image: 'assets/images/works/atlas.jpg'
      }
    ]
  };

  const NO_IMAGE = 'assets/images/no-image.png';
  const pageContext = document.body?.dataset.page || '';

  const setupMenuSheet = () => {
    const menuButton = document.querySelector('.menu-toggle');
    const sheet = document.getElementById('mobile-menu');
    const overlay = document.querySelector('[data-sheet-overlay]');
    const closeButton = sheet?.querySelector('[data-sheet-close]');
    if (!menuButton || !sheet || !overlay || !closeButton) return;
    sheet.setAttribute('aria-hidden', sheet.hidden ? 'true' : 'false');

    let lastFocusedElement = null;

    const getFocusable = () =>
      sheet.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');

    const trapFocus = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const closeSheet = () => {
      sheet.hidden = true;
      sheet.setAttribute('aria-hidden', 'true');
      overlay.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      sheet.removeEventListener('keydown', trapFocus);
      lastFocusedElement?.focus();
    };

    const openSheet = () => {
      lastFocusedElement = document.activeElement;
      sheet.hidden = false;
      sheet.setAttribute('aria-hidden', 'false');
      overlay.hidden = false;
      menuButton.setAttribute('aria-expanded', 'true');
      sheet.addEventListener('keydown', trapFocus);
      const firstFocusable = getFocusable()[0];
      firstFocusable?.focus();
    };

    menuButton.addEventListener('click', () => {
      if (sheet.hidden) {
        openSheet();
      } else {
        closeSheet();
      }
    });

    overlay.addEventListener('click', closeSheet);
    closeButton.addEventListener('click', closeSheet);
    sheet.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeSheet));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !sheet.hidden) {
        closeSheet();
      }
    });
  };

  const setupWorksPage = () => {
    const context = document.querySelector('[data-works-context]');
    const workList = document.getElementById('work-list');
    const workDetail = document.getElementById('work-detail');
    if (!context || !workList || !workDetail) return;

    const type = context.getAttribute('data-works-context');
    const dataset = worksData[type] || [];
    const detailBody = workDetail.querySelector('.works-detail__body');

    const renderDetail = (slug) => {
      const item = dataset.find((entry) => entry.slug === slug);
      if (!item) {
        detailBody.innerHTML = '<p>作品を選択すると詳細が表示されます。</p>';
        return;
      }

      const image = item.image || NO_IMAGE;
      detailBody.innerHTML = `
        <img src="${image}" alt="${item.title} thumbnail" onerror="this.onerror=null;this.src='${NO_IMAGE}'">
        <h3>${item.title}</h3>
        <p>${item.year} / ${item.location}</p>
        <p>${item.description}</p>
      `;
    };

    const renderList = () => {
      if (!dataset.length) {
        workList.innerHTML = '<div class="placeholder-card">Upcoming</div>';
        return;
      }

      const fragment = document.createDocumentFragment();
      dataset.forEach((item, index) => {
        const article = document.createElement('article');
        article.className = 'works-card';
        if (index === 0) article.classList.add('works-card--active');

        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.work = item.slug;

        const title = document.createElement('p');
        title.className = 'works-card__title';
        title.textContent = item.title;

        const meta = document.createElement('p');
        meta.className = 'works-card__meta';
        meta.textContent = `${item.year} · ${item.location}`;

        button.append(title, meta);
        article.append(button);
        fragment.append(article);
      });

      workList.innerHTML = '';
      workList.append(fragment);
    };

    const setActive = (slug) => {
      workList.querySelectorAll('.works-card').forEach((card) => {
        const button = card.querySelector('button[data-work]');
        const isActive = button?.dataset.work === slug;
        card.classList.toggle('works-card--active', isActive);
      });
    };

    renderList();
    const defaultSlug = dataset[0]?.slug;
    if (defaultSlug) {
      renderDetail(defaultSlug);
    }

    workList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-work]');
      if (!button) return;
      const slug = button.dataset.work;
      setActive(slug);
      renderDetail(slug);
    });
  };

  const setupContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const statusEl = form.querySelector('.contact-form__status');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').trim();
      const email = (formData.get('email') || '').trim();
      const message = (formData.get('message') || '').trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let error = '';

      if (!name || !email || !message) {
        error = 'すべての必須項目を入力してください。';
      } else if (!emailPattern.test(email)) {
        error = 'メールアドレスの形式を確認してください。';
      }

      if (error) {
        statusEl.textContent = error;
        statusEl.classList.remove('is-success');
        statusEl.classList.add('is-error');
        return;
      }

      statusEl.textContent = '送信機能は後日実装予定です。';
      statusEl.classList.remove('is-error');
      statusEl.classList.add('is-success');
      form.reset();
    });
  };

  const init = () => {
    setupMenuSheet();
    if (pageContext.startsWith('works-')) {
      setupWorksPage();
    }
    if (pageContext === 'contact') {
      setupContactForm();
    }
  };

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
