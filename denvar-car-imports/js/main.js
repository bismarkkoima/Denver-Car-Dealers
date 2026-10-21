// Entry point. Each init is a no-op on pages that don't have its markup,
// so every page loads this one module.
import { initNav } from './nav.js';
import { initAmbient } from './ambient.js';
import { initInventory } from './inventory.js';
import { initContactForm } from './contact-form.js';

// Module scripts are deferred, so the DOM is already parsed here.
initNav();
initAmbient('canvas-home');
initAmbient('canvas-inv');
initInventory();
initContactForm();
