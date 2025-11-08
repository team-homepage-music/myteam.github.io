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

  const categories = [
    { id: 'music', label: 'Music', type: 'list' },
    { id: 'art', label: 'Art', type: 'list' },
    { id: 'papers', label: 'Papers', type: 'upcoming' },
    { id: 'patents', label: 'Patents', type: 'upcoming' },
    { id: 'tonkotsu', label: '豚骨ホームラン', type: 'profile' },
    { id: 'others', label: 'Others', type: 'upcoming' }
  ];

  const NO_IMAGE = 'assets/images/no-image.png';
  const categoryButtons = document.querySelectorAll('.works-filters button[data-category]');
  const workList = document.getElementById('work-list');
  const workDetail = document.getElementById('work-detail');
  const contactForm = document.getElementById('contact-form');
  const state = { category: 'music', slug: null };

  const findWorkBySlug = (slug) => {
    for (const [category, items] of Object.entries(worksData)) {
      const match = items.find((item) => item.slug === slug);
      if (match) {
        return { category, item: match };
      }
    }
    return null;
  };

  const setActiveCategoryButton = (categoryId) => {
    categoryButtons.forEach((btn) => {
      const isActive = btn.dataset.category === categoryId;
      btn.setAttribute('aria-selected', String(isActive));
    });
  };

  const renderWorksList = () => {
    const category = categories.find((entry) => entry.id === state.category);
    if (!category || !workList) return;

    workList.innerHTML = '';
    workList.classList.toggle('works-list--grid', category.type === 'list');

    if (category.type === 'list') {
      const items = worksData[state.category] || [];
      if (!items.length) {
        workList.innerHTML = '<div class="placeholder-card">Upcoming</div>';
        return;
      }

      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const article = document.createElement('article');
        article.className = 'works-card';
        if (state.slug === item.slug) {
          article.classList.add('works-card--active');
        }

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

      workList.append(fragment);
    } else if (category.type === 'profile') {
      workList.classList.remove('works-list--grid');
      workList.innerHTML = `
        <article class="works-card">
          <div class="tonkotsu-visual">
            <img src="assets/images/works/tonkotsu.jpg" alt="Tonkotsu homerun placeholder">
          </div>
          <p class="works-card__title">豚骨ホームラン</p>
          <p class="works-card__meta">Photo + Profile space</p>
          <div class="placeholder-card" style="margin-top:0.5rem">Upcoming</div>
        </article>
      `;
    } else {
      workList.classList.remove('works-list--grid');
      workList.innerHTML = '<div class="placeholder-card">Upcoming</div>';
    }
  };

  const renderWorkDetail = () => {
    if (!workDetail) return;
    const detailBody = workDetail.querySelector('.works-detail__body');
    if (!detailBody) return;

    if (!state.slug) {
      detailBody.innerHTML = '<p>作品を選択すると詳細がここに表示されます。</p>';
      return;
    }

    const match = findWorkBySlug(state.slug);
    if (!match) {
      detailBody.innerHTML = '<p>対象の作品が見つかりません。</p>';
      return;
    }

    const { item } = match;
    const imageSrc = item.image || NO_IMAGE;
    detailBody.innerHTML = `
      <img src="${imageSrc}" alt="${item.title} thumbnail" onerror="this.onerror=null;this.src='${NO_IMAGE}'">
      <h3>${item.title}</h3>
      <p>${item.year} / ${item.location}</p>
      <p>${item.description}</p>
    `;
  };

  const setCategory = (categoryId, { scroll = false, resetDetail = false } = {}) => {
    if (!categories.some((entry) => entry.id === categoryId)) return;
    state.category = categoryId;
    if (resetDetail || !['music', 'art'].includes(categoryId)) {
      state.slug = null;
    }
    setActiveCategoryButton(categoryId);
    renderWorksList();
    renderWorkDetail();
    if (scroll) {
      document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const setDetailSlug = (slug) => {
    const match = findWorkBySlug(slug);
    if (!match) {
      state.slug = null;
      renderWorkDetail();
      return;
    }
    state.category = match.category;
    state.slug = slug;
    setActiveCategoryButton(state.category);
    renderWorksList();
    renderWorkDetail();
  };

  const handleWorkListClicks = () => {
    workList?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-work]');
      if (!button) return;
      const slug = button.dataset.work;
      if (slug) {
        const targetHash = `#works/${slug}`;
        if (window.location.hash === targetHash) {
          handleHashChange();
        } else {
          window.location.hash = targetHash;
        }
      }
    });
  };

  const handleCategoryClicks = () => {
    categoryButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const categoryId = btn.dataset.category;
        if (categoryId) {
          const targetHash = `#works/${categoryId}`;
          if (window.location.hash === targetHash) {
            handleHashChange();
          } else {
            window.location.hash = targetHash;
          }
        }
      });
    });
  };

  const scrollToWorks = () => {
    const worksSection = document.getElementById('works');
    worksSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHashChange = () => {
    const hash = window.location.hash.replace(/^#/, '');
    const [section, value] = hash.split('/').filter(Boolean);

    if (section === 'works') {
      if (!value) {
        setCategory('music');
        state.slug = null;
        renderWorkDetail();
        scrollToWorks();
        return;
      }

      if (categories.some((entry) => entry.id === value)) {
        setCategory(value, { resetDetail: true });
        scrollToWorks();
        return;
      }

      const target = findWorkBySlug(value);
      if (target) {
        setDetailSlug(value);
        scrollToWorks();
        return;
      }

      // fallback
      setCategory('music', { resetDetail: true });
      scrollToWorks();
      return;
    }

    if (section) {
      const element = document.getElementById(section);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const setupMenuSheet = () => {
    const menuButton = document.querySelector('.menu-toggle');
    const sheet = document.getElementById('mobile-menu');
    const overlay = document.querySelector('[data-sheet-overlay]');
    const closeButton = sheet?.querySelector('[data-sheet-close]');
    if (!menuButton || !sheet || !overlay || !closeButton) return;
    sheet.setAttribute('aria-hidden', sheet.hidden ? 'true' : 'false');

    let lastFocusedElement = null;

    const getFocusableElements = () =>
      sheet.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');

    const trapFocus = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements();
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
      const firstFocusable = getFocusableElements()[0];
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
    sheet.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeSheet);
    });

    sheet.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeSheet();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !sheet.hidden) {
        closeSheet();
      }
    });
  };

  const setupContactForm = () => {
    if (!contactForm) return;
    const statusEl = contactForm.querySelector('.contact-form__status');

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
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
      contactForm.reset();
    });
  };

  const init = () => {
    setCategory(state.category);
    renderWorkDetail();
    handleWorkListClicks();
    handleCategoryClicks();
    setupMenuSheet();
    setupContactForm();
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  };

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
