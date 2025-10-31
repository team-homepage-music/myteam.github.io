(function () {
  const root = document.documentElement;
  if (!root.classList.contains('js')) {
    root.classList.add('js');
  }

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
})();
