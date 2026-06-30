export function initSecurityMeasures() {
  // Temporarily disabled for debugging live issues (superadmin login, payment gateway).
  // Re-enable by restoring prior implementation after root causes are fixed.
  return;
}

export function clearSessionOnLogout() {
  sessionStorage.clear();
  localStorage.removeItem('authToken');
  localStorage.removeItem('raksha_auth_token');
  
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}

export function preventBackNavigation() {
  window.history.pushState(null, '', window.location.href);
  window.onpopstate = function() {
    window.history.pushState(null, '', window.location.href);
  };
}
