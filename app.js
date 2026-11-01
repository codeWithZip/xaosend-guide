(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const sidebar = $('#sidebar');
  const toggle = $('#menu-toggle');
  const backdrop = $('#nav-backdrop');
  const openNav = (open) => {
    sidebar.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => openNav(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => openNav(false));
  $$('.side-links a').forEach(a => a.addEventListener('click', () => openNav(false)));

  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  let previousFocus = null;
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  }
  $$('.image-open').forEach(button => button.addEventListener('click', () => {
    previousFocus = button;
    lightboxImage.src = button.dataset.img;
    lightboxImage.alt = button.querySelector('img').alt;
    $('#lightbox-caption').textContent = button.dataset.caption;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#lightbox-close').focus();
  }));
  $('#lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!lightbox.hidden) closeLightbox(); else if (sidebar.classList.contains('open')) openNav(false); }
  });

  $('#copy-link').addEventListener('click', async () => {
    const button = $('#copy-link');
    const label = button.querySelector('span');
    try {
      await navigator.clipboard.writeText(location.href);
      if (label) label.textContent = 'Скопировано';
    } catch (_) {
      if (label) label.textContent = 'Скопируйте адрес';
    }
  });

  const search = $('#site-search');
  const results = $('#search-results');
  const sections = $$('.section[id]');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLocaleLowerCase('ru');
    if (q.length < 2) { results.hidden = true; results.replaceChildren(); return; }
    const hits = sections.filter(s => `${s.textContent} ${s.dataset.search || ''}`.toLocaleLowerCase('ru').includes(q)).slice(0, 7);
    results.replaceChildren();
    if (!hits.length) {
      const no = document.createElement('div');
      no.className = 'search-empty';
      no.textContent = 'Ничего не найдено. Попробуйте другой запрос.';
      results.append(no);
    }
    hits.forEach(s => {
      const a = document.createElement('a');
      a.href = `#${s.id}`;
      a.textContent = s.querySelector('h2').textContent;
      a.addEventListener('click', () => { results.hidden = true; search.value = ''; openNav(false); });
      results.append(a);
    });
    results.hidden = false;
  });

  const navItems = $$('.nav-link');
  const navByHash = new Map(navItems.map(a => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      const seen = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!seen.length) return;
      navItems.forEach(a => a.classList.remove('active'));
      const a = navByHash.get(seen[0].target.id);
      if (a) a.classList.add('active');
    }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });
    sections.forEach(s => io.observe(s));
  }
  // Приглашение показывается один раз на каждую загрузку страницы.
  // Никаких постоянных отметок: после закрытия страницы и нового визита показ повторится.
  const contactModal = document.getElementById('contact-modal');
  let hasSeenContact = false;
  const markContactSeen = () => { hasSeenContact = true; };
  let contactPreviousFocus = null;
  function closeContactModal() {
    if (!contactModal || contactModal.hidden) return;
    contactModal.hidden = true;
    contactModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (contactPreviousFocus && typeof contactPreviousFocus.focus === 'function') contactPreviousFocus.focus();
  }
  if (contactModal) {
    contactModal.querySelectorAll('[data-close-contact]').forEach(el => el.addEventListener('click', closeContactModal));
    const action = contactModal.querySelector('.contact-modal-action');
    if (action) action.addEventListener('click', closeContactModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !contactModal.hidden) closeContactModal(); });
    if (!hasSeenContact) {
      const tryShowInvitation = () => {
        if (hasSeenContact) return;
        // Откладываем показ, если посетитель смотрит увеличенный скриншот.
        if (!lightbox.hidden || (sidebar && sidebar.classList.contains('open'))) {
          window.setTimeout(tryShowInvitation, 1200);
          return;
        }
        contactPreviousFocus = document.activeElement;
        contactModal.hidden = false;
        contactModal.setAttribute('aria-hidden', 'false');
        markContactSeen();
        document.body.style.overflow = 'hidden';
        document.getElementById('contact-modal-close').focus();
      };
      window.setTimeout(tryShowInvitation, 15000);
    }
  }

})();
