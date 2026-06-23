(function () {
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
          '<p class="video-modal-title" id="videoModalTitle">Video</p>' +
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
  }

  window.playVideo = function (id, title) {
    if (!id) return;
    ensureModal();
    var modal = document.getElementById('videoModal');
    var iframe = document.getElementById('videoModalIframe');
    var titleEl = document.getElementById('videoModalTitle');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
    if (titleEl) titleEl.textContent = title || 'Dr. Sanjay Gandhi — Video';
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-modal-open');
  };

  window.closeVideo = function () {
    var modal = document.getElementById('videoModal');
    if (!modal) return;
    var iframe = document.getElementById('videoModalIframe');
    if (iframe) iframe.src = '';
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('video-modal-open');
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeVideo();
  });

  document.addEventListener('DOMContentLoaded', ensureModal);
})();
