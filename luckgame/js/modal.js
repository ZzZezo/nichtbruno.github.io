export function openModal(id) {
  document.getElementById('modal-' + id).classList.add('modal-backdrop--open');
}

export function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('modal-backdrop--open');
}

export function initModals() {
  ['case', 'slots'].forEach(id => {
    const backdrop = document.getElementById('modal-' + id);
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal(id);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') ['case', 'slots'].forEach(closeModal);
  });

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });

  document.querySelectorAll('[data-modal-open]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.modalOpen));
  });
}