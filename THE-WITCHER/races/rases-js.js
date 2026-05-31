(function() {
    // Все карточки
    const rectCards = document.querySelectorAll('.rect-card');
    
    // Автоматически собираем все модальные окна по id, которые начинаются с "modal"
    const modals = {};
    document.querySelectorAll('[id^="modal"]').forEach(modal => {
        if (modal.classList.contains('modal-overlay')) {
            modals[modal.id] = modal;
        }
    });
    
    // Функции открытия/закрытия (те же)
    function closeModal(modalId) {
        const modal = modals[modalId];
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    }
    
    function openModal(modalId) {
        for (let key in modals) {
            if (modals[key] && modals[key].classList.contains('active')) {
                modals[key].classList.remove('active');
            }
        }
        const targetModal = modals[modalId];
        if (targetModal) targetModal.classList.add('active');
    }
    
    // Клик по карточке
    rectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = card.getAttribute('data-modal');
            if (modalId && modals[modalId]) openModal(modalId);
        });
    });
    
    // Кнопки закрытия
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = btn.getAttribute('data-close');
            if (modalId && modals[modalId]) closeModal(modalId);
        });
    });
    
    // Клик по фону
    for (let key in modals) {
        modals[key].addEventListener('click', (e) => {
            if (e.target === modals[key]) closeModal(key);
        });
    }
    
    // Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            for (let key in modals) {
                if (modals[key].classList.contains('active')) {
                    closeModal(key);
                    break;
                }
            }
        }
    });
    
    // Защита клика внутри белой карточки
    document.querySelectorAll('.modal-white-card').forEach(card => {
        card.addEventListener('click', (e) => e.stopPropagation());
    });
})();

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