/**
 * Registers the SkillsBarter service worker for offline support and caching.
 * Call this function once from your app's entry point (e.g. main.jsx).
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service workers are not supported in this browser.');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service Worker registered successfully. Scope:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[SW] New Service Worker installing…');

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            console.log('[SW] Service Worker state:', newWorker.state);

            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available; the old SW is still serving.
              console.log('[SW] New content available — please refresh.');
            }

            if (newWorker.state === 'activated') {
              console.log('[SW] Service Worker activated and ready.');
            }
          });
        }
      });
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  });
}
