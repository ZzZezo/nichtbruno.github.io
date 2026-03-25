import { refreshUI, initDaily, loadBg } from './state.js';
import { initModals } from './modal.js';
import { initSlots  } from './slots.js';
import { initCases  } from './cases.js';

function scaleUI() {
  document.documentElement.style.zoom = window.innerWidth > 1280 ? (window.innerWidth / 1500) : 1;
}
scaleUI();
window.addEventListener('resize', scaleUI);

loadBg();
initDaily();
initModals();
initSlots();
initCases();
refreshUI();