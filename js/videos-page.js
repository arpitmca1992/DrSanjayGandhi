(function () {
  document.querySelectorAll('.page-videos .vid-item').forEach(function (item) {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
})();
