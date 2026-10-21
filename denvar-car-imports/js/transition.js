// Runs a DOM update inside a View Transition when the browser supports it and
// the visitor has not asked for reduced motion; otherwise just runs the update.
// Callers get the same result either way, so nothing depends on support.
//
//   withTransition(() => { ...change the DOM... });
//
// `env` exists so the decision can be unit-tested without a browser.
export function withTransition(update, env = globalThis) {
  const doc = env.document;
  const reduced = env.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!doc?.startViewTransition || reduced) {
    update();
    return null;
  }

  // While this runs, the page-wide fade used for navigation is switched off
  // (see css/styles.css), so only the elements that actually change animate.
  const root = doc.documentElement;
  root?.classList.add('vt-local');
  const transition = doc.startViewTransition(update);
  transition.finished?.finally(() => root?.classList.remove('vt-local'));
  return transition;
}
