(function () {
  var playlist = [];
  var currentIndex = -1;
  var scrollLockY = 0;

  var prevIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';
  var nextIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

  function lockPageScroll() {
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollLockY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPageScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLockY);
  }

  function buildPlaylistFromPage() {
    var items = [];
    var seen = {};

    document.querySelectorAll('[onclick*="playVideo"]').forEach(function (el) {
      var attr = el.getAttribute('onclick') || '';
      var match = attr.match(/playVideo\(\s*'([^']+)'(?:\s*,\s*'((?:\\'|[^'])*)')?\s*\)/);
      if (!match || seen[match[1]]) return;

      var title = match[2] ? match[2].replace(/\\'/g, "'") : '';
      if (!title) {
        var titleEl = el.querySelector('.vi-title, .video-caption-title, .video-caption-title--lg');
        title = titleEl ? titleEl.textContent.trim() : '';
      }

      seen[match[1]] = true;
      items.push({ id: match[1], title: title || 'Dr. Sanjay Gandhi — Video' });
    });

    return items;
  }

  function updateNavState() {
    var prevBtn = document.getElementById('videoModalPrev');
    var nextBtn = document.getElementById('videoModalNext');
    var counter = document.getElementById('videoModalCounter');
    var hasMany = playlist.length > 1;

    if (prevBtn) {
      prevBtn.disabled = !hasMany || currentIndex <= 0;
      prevBtn.hidden = !hasMany;
    }
    if (nextBtn) {
      nextBtn.disabled = !hasMany || currentIndex >= playlist.length - 1;
      nextBtn.hidden = !hasMany;
    }
    if (counter) {
      counter.textContent = hasMany ? (currentIndex + 1) + ' / ' + playlist.length : '';
      counter.hidden = !hasMany;
    }
  }

  function loadVideoAt(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    var item = playlist[index];
    var iframe = document.getElementById('videoModalIframe');
    var titleEl = document.getElementById('videoModalTitle');
    if (iframe) {
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(item.id) + '?autoplay=1&rel=0&modestbranding=1';
    }
    if (titleEl) titleEl.textContent = item.title;
    updateNavState();
  }

  function ensureModal() {
    if (document.getElementById('videoModal')) return;

    var modal = document.createElement('div');
    modal.id = 'videoModal';
    modal.className = 'video-modal';
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="video-modal-backdrop" data-close-video></div>' +
      '<div class="video-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="videoModalTitle">' +
        '<div class="video-modal-head">' +
          '<button type="button" class="video-modal-nav-btn" id="videoModalPrev" data-video-prev aria-label="Previous video">' +
            prevIcon + '<span>Prev</span>' +
          '</button>' +
          '<div class="video-modal-meta">' +
            '<p class="video-modal-title" id="videoModalTitle">Video</p>' +
            '<p class="video-modal-counter" id="videoModalCounter"></p>' +
          '</div>' +
          '<button type="button" class="video-modal-nav-btn video-modal-nav-btn--next" id="videoModalNext" data-video-next aria-label="Next video">' +
            '<span>Next</span>' + nextIcon +
          '</button>' +
          '<button type="button" class="video-modal-close" data-close-video aria-label="Close video">&times;</button>' +
        '</div>' +
        '<div class="video-modal-frame">' +
          '<iframe id="videoModalIframe" title="YouTube video player" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-close-video]').forEach(function (el) {
      el.addEventListener('click', closeVideo);
    });
    modal.querySelector('[data-video-prev]').addEventListener('click', function (e) {
      e.stopPropagation();
      playPrev();
    });
    modal.querySelector('[data-video-next]').addEventListener('click', function (e) {
      e.stopPropagation();
      playNext();
    });
  }

  function openModal() {
    var modal = document.getElementById('videoModal');
    lockPageScroll();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-modal-open');
  }

  window.playVideo = function (id, title) {
    if (!id) return;
    ensureModal();
    playlist = buildPlaylistFromPage();
    currentIndex = playlist.findIndex(function (item) { return item.id === id; });

    if (currentIndex === -1) {
      playlist = [{ id: id, title: title || 'Dr. Sanjay Gandhi — Video' }];
      currentIndex = 0;
    } else if (title) {
      playlist[currentIndex].title = title;
    }

    loadVideoAt(currentIndex);
    openModal();
  };

  window.playPrev = function () {
    if (currentIndex > 0) loadVideoAt(currentIndex - 1);
  };

  window.playNext = function () {
    if (currentIndex < playlist.length - 1) loadVideoAt(currentIndex + 1);
  };

  window.closeVideo = function () {
    var modal = document.getElementById('videoModal');
    if (!modal) return;
    var iframe = document.getElementById('videoModalIframe');
    if (iframe) iframe.src = '';
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('video-modal-open');
    unlockPageScroll();
    playlist = [];
    currentIndex = -1;
  };

  document.addEventListener('keydown', function (e) {
    var modal = document.getElementById('videoModal');
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') closeVideo();
    if (e.key === 'ArrowLeft') playPrev();
    if (e.key === 'ArrowRight') playNext();
  });

  document.addEventListener('DOMContentLoaded', ensureModal);
})();
