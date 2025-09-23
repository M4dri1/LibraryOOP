(function () {
  function ensureContainers() {
    let toast = document.getElementById('toast-container');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-container';
      document.body.appendChild(toast);
    }
    let modal = document.getElementById('confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'confirm-modal';
      modal.innerHTML = `
        <div class="confirm-backdrop" data-confirm-hide></div>
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
          <div class="confirm-content">
            <h3 id="confirm-title">Confirmação</h3>
            <p id="confirm-message">Tem certeza?</p>
            <div class="confirm-actions">
              <button type="button" class="btn cancel" data-confirm-cancel>Cancelar</button>
              <button type="button" class="btn confirm" data-confirm-ok>Confirmar</button>
            </div>
          </div>
        </div>`;
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
  }

  function showToast(type, message) {
    ensureContainers();
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  async function confirmModal(message) {
    ensureContainers();
    return new Promise((resolve) => {
      const modal = document.getElementById('confirm-modal');
      const dialog = modal.querySelector('.confirm-dialog');
      const msg = modal.querySelector('#confirm-message');
      const okBtn = modal.querySelector('[data-confirm-ok]');
      const cancelBtn = modal.querySelector('[data-confirm-cancel]');
      const backdrop = modal.querySelector('[data-confirm-hide]');
      const previouslyFocused = document.activeElement;

      msg.textContent = message;
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');

      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusable = Array.from(dialog.querySelectorAll(focusableSelectors)).filter(el => !el.hasAttribute('disabled'));
      const firstFocusable = focusable[0] || okBtn;
      const lastFocusable = focusable[focusable.length - 1] || okBtn;

      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      function trapFocus(e) {
        if (e.key === 'Tab') {
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }
          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        } else if (e.key === 'Escape') {
          onCancel();
        } else if (e.key === 'Enter') {
          onOk();
        }
      }

      function cleanup(result) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        backdrop.removeEventListener('click', onCancel);
        dialog.removeEventListener('keydown', trapFocus);
        document.body.style.overflow = originalBodyOverflow;
        if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
        resolve(result);
      }
      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }

      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      backdrop.addEventListener('click', onCancel);
      dialog.addEventListener('keydown', trapFocus);

      dialog.focus();
      setTimeout(() => (okBtn && okBtn.focus && okBtn.focus()), 0);
    });
  }

  window.UI = { showToast, confirmModal };
})();

