// Меню бургер
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const slideMenu = document.getElementById('slideMenu');
  const overlay = document.getElementById('menuOverlay');
  const closeBtn = document.getElementById('closeMenu');

  function openMenu() {
    slideMenu.classList.add('open');
    if (overlay) overlay.classList.add('active');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    slideMenu.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (slideMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && slideMenu && slideMenu.classList.contains('open')) closeMenu();
  });
  if (slideMenu) slideMenu.addEventListener('click', (e) => e.stopPropagation());

  const submenuTriggers = document.querySelectorAll('.has-submenu .menu-item');
  submenuTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentLi = trigger.closest('.has-submenu');
      if (parentLi) {
        parentLi.classList.toggle('open');
      }
    });
  });

  const originalCloseMenu = closeMenu;
  window.closeMenu = function() {
    originalCloseMenu();
    document.querySelectorAll('.has-submenu.open').forEach(sub => sub.classList.remove('open'));
  };
  closeMenu = window.closeMenu;
  if (closeBtn) closeBtn.removeEventListener('click', originalCloseMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.removeEventListener('click', originalCloseMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.removeEventListener('keydown', (e) => {
    if (e.key === 'Escape' && slideMenu && slideMenu.classList.contains('open')) originalCloseMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && slideMenu && slideMenu.classList.contains('open')) closeMenu();
  });
  if (menuToggle) {
    const newToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newToggle, menuToggle);
    newToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (slideMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
  }

  if (slideMenu) {
    let touchStartY = 0;
    slideMenu.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    slideMenu.addEventListener('touchmove', (e) => {
      if (!slideMenu.classList.contains('open')) return;
      const delta = e.touches[0].clientY - touchStartY;
      if (delta > 60 && slideMenu.scrollTop === 0) {
        closeMenu();
      }
    });
  }
})();