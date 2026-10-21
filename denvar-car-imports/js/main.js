// Entry point. The components in js/components/ render the shared UI (nav,
// footer, car cards, filter, stats). The inits below are no-ops on pages that
// don't have their markup, so every page loads this one module.
import './components/index.js';
import { initAmbient } from './ambient.js';
import { initContactForm } from './contact-form.js';

// Module scripts are deferred, so the DOM is already parsed here.
initAmbient('canvas-home');
initAmbient('canvas-inv');
initContactForm();
