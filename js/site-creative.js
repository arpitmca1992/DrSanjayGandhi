(function () {
  var loader = document.getElementById('siteLoader');
  if (loader) {
    window.addEventListener('load', function () {
      loader.classList.add('is-hidden');
      setTimeout(function () { loader.remove(); }, 600);
    });
  }

  function pageName() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function setActiveNav() {
    var page = pageName();
    var hash = window.location.hash.toLowerCase();
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = (link.getAttribute('href') || '').trim();
      var active = false;

      if (href === 'index.html' || href === './' || href === '/') {
        active = page === 'index.html' && !hash;
      } else if (href === '#about' || href === 'index.html#about') {
        active = page === 'index.html' && hash === '#about';
      } else if (href === 'index.html#expertise' || href === '#expertise') {
        active = page === 'index.html' && hash === '#expertise';
      } else if (href.indexOf('#') === -1) {
        active = page === href.toLowerCase();
      }

      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  setActiveNav();
  window.addEventListener('hashchange', setActiveNav);

  document.querySelectorAll('.ecg-divider--scroll').forEach(function (el) {
    if (!('IntersectionObserver' in window)) {
      el.classList.add('ecg-divider--animated');
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        el.classList.toggle('ecg-divider--animated', entry.isIntersecting);
      });
    }, { threshold: 0.3 });
    obs.observe(el);
  });
})();
