if ('serviceWorker' in navigator) {
  window.addEventListener('DOMContentLoaded', function () {
    // Prevent reload loops: only allow one SW-triggered reload per session
    var swReloaded = sessionStorage.getItem('sw-reloaded');

    navigator.serviceWorker.register('/serviceWorker.js').then(function (registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      var sw = registration.installing || registration.waiting;
      if (sw) {
        sw.onstatechange = function() {
          if (sw.state === 'installed' && !swReloaded) {
            console.log('ServiceWorker installed, reloading page once');
            sessionStorage.setItem('sw-reloaded', '1');
            window.location.reload();
          }
        }
      }
      registration.update().then(function(res) {
        console.log('ServiceWorker registration update: ', res);
      });
      window._SW_ENABLED = true;
    }, function (err) {
      console.error('ServiceWorker registration failed: ', err);
    });

    navigator.serviceWorker.addEventListener('controllerchange', function() {
      console.log('ServiceWorker controllerchange');
      if (!swReloaded) {
        sessionStorage.setItem('sw-reloaded', '1');
        window.location.reload(true);
      }
    });
  });
}
