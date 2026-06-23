(function () {
  var PAPERS = [
    { re: /dainik bhaskar|\/bhaskar[-_]|^bhaskar\b/i, name: 'Dainik Bhaskar' },
    { re: /rajasthan patrika|\/patrika[-_]|rajpatrika|^raj\.?\s*patrika|^patrika\b/i, name: 'Rajasthan Patrika' },
    { re: /\/rashtradoot[-_]|^rashtradoot/i, name: 'Rashtradoot' },
    { re: /times of india|\/toi[-_]|^toi\b/i, name: 'Times of India' },
    { re: /\/pratahkal[-_]|^pratahkal/i, name: 'Pratahkal' },
    { re: /dainik navjyoti|\/navjyoti[-_]|^navjyoti/i, name: 'Dainik Navjyoti' },
    { re: /udaipur times|\/udaipur-times/i, name: 'Udaipur Times' },
    { re: /the hindu|\/hindu[-_]/i, name: 'The Hindu' },
    { re: /seema sandesh|\/seema-sandesh/i, name: 'Seema Sandesh' },
    { re: /vagaddoot|\/vagaddoot/i, name: 'Vagaddoot' },
    { re: /^ijrms/i, name: 'IJRMS Research' }
  ];

  var DATE_RE = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|20\d{2})/i;
  var LIVE_RE = /live surgery|surgical team|cath lab|angiography|artis|open heart|organ retrieval|ecmo|ct angiography|pre\s*&\s*post|achievement|germany training|nicu|surgery team/i;

  function matchPaper(text) {
    if (!text) return null;
    for (var i = 0; i < PAPERS.length; i++) {
      if (PAPERS[i].re.test(text)) return PAPERS[i].name;
    }
    return null;
  }

  function paperFromImage(img) {
    if (!img) return '';
    return matchPaper(img.getAttribute('src') || '') || matchPaper(img.getAttribute('alt') || '') || '';
  }

  function isDate(seg) {
    return DATE_RE.test(seg.trim());
  }

  function parseTitleLine(line, alt, img) {
    var segs = line.split(' · ').map(function (s) { return s.trim(); }).filter(Boolean);
    var source = '';
    var date = '';
    var tag = '';
    var title = '';

    if (segs.length && matchPaper(segs[0])) {
      source = matchPaper(segs[0]);
      segs.shift();
    }

    if (segs.length && isDate(segs[segs.length - 1])) {
      date = segs.pop();
    }

    if (segs.length >= 2) {
      title = segs[0];
      tag = segs.slice(1).join(' · ');
    } else if (segs.length === 1) {
      title = segs[0];
    }

    var pathPaper = paperFromImage(img);
    if (pathPaper) {
      source = pathPaper;
    } else if (!source) {
      source = matchPaper(alt) || matchPaper(line) || '';
    }

    if (!source && (LIVE_RE.test(line) || LIVE_RE.test(alt || ''))) {
      source = 'Geetanjali · Live OT';
    } else if (!source) {
      source = 'Press Coverage';
    }

    if (!tag && title && LIVE_RE.test(title)) {
      tag = 'Cardiac Surgery';
    }

    return { source: source, date: date, tag: tag, title: title || line };
  }

  function parseTreatLabel(text) {
    var segs = text.split(' · ').map(function (s) { return s.trim(); }).filter(Boolean);
    var source = '';
    var date = '';
    var tag = '';

    if (segs.length && isDate(segs[segs.length - 1])) {
      date = segs.pop();
    }
    source = segs.join(' · ') || text;

    if (/uk mirror|the sun|uk express|international/i.test(source)) {
      tag = 'International';
    } else if (/ctsnet|dailyrounds|ijrms|catholic|faithwire|american bazaar/i.test(source)) {
      tag = 'Medical Press';
    } else if (/times of india|the hindu|patrika|rashtradoot|pratahkal|bhaskar/i.test(source)) {
      tag = 'National';
    }

    return { source: source, date: date, tag: tag };
  }

  function treatRibbonClass(source) {
    if (/ctsnet|dailyrounds|ijrms|catholic|faithwire|american bazaar/i.test(source)) {
      return 'clip-card__ribbon--inst';
    }
    return 'clip-card__ribbon--paper';
  }

  function buildLabelRow(parsed, ribbonClass) {
    var labels = document.createElement('div');
    labels.className = 'clip-card__labels';

    var source = document.createElement('span');
    source.className = 'clip-card__ribbon ' + ribbonClass;
    source.textContent = parsed.source;
    labels.appendChild(source);

    if (parsed.tag) {
      var tag = document.createElement('span');
      tag.className = 'clip-card__tag';
      tag.textContent = parsed.tag;
      labels.appendChild(tag);
    }
    if (parsed.date) {
      var time = document.createElement('time');
      time.className = 'clip-card__date';
      time.textContent = parsed.date;
      labels.appendChild(time);
    }

    return labels;
  }

  function attachLightboxMedia(media, img, caption) {
    var src = img.getAttribute('src') || '';
    if (!src) return;
    media.dataset.lightboxSrc = src;
    media.dataset.lightboxCaption = caption || img.getAttribute('alt') || '';
    media.setAttribute('role', 'button');
    media.setAttribute('tabindex', '0');
    media.setAttribute('aria-label', 'View clipping image');
  }

  function normalizeTreatCard(card) {
    var articleUrl = card.dataset.articleUrl || '';

    if (card.tagName === 'A') {
      articleUrl = card.getAttribute('href') || articleUrl;
      var article = document.createElement('article');
      article.className = card.className;
      var style = card.getAttribute('style');
      if (style) article.setAttribute('style', style);
      if (articleUrl) article.dataset.articleUrl = articleUrl;
      while (card.firstChild) article.appendChild(card.firstChild);
      card.replaceWith(article);
      return article;
    }

    return card;
  }

  function enhanceTreatCard(rawCard) {
    var card = normalizeTreatCard(rawCard);
    if (card.classList.contains('treat-card--done')) return null;

    var img = card.querySelector(':scope > img');
    if (!img) return null;

    var labelEl = img.nextElementSibling;
    if (!labelEl || labelEl.tagName !== 'DIV' || labelEl.classList.contains('treat-card__body')) return null;

    var parsed = parseTreatLabel(labelEl.textContent.trim());
    var pathPaper = paperFromImage(img);
    if (pathPaper && !/ctsnet|dailyrounds|ijrms|catholic|faithwire|american bazaar|mirror|the sun|express/i.test(parsed.source)) {
      parsed.source = pathPaper;
    }

    var ribbonClass = treatRibbonClass(parsed.source);
    var articleUrl = card.dataset.articleUrl || '';

    card.classList.add('treat-card--done');
    card.removeAttribute('style');

    var rest = [];
    var node = labelEl.nextElementSibling;
    while (node) {
      rest.push(node);
      node = node.nextElementSibling;
    }
    labelEl.remove();

    var titleEl = null;
    rest.forEach(function (el) {
      if (el.tagName === 'H3') titleEl = el;
    });
    var caption = parsed.source + ' — ' + (titleEl ? titleEl.textContent.trim() : img.alt);

    var media = document.createElement('div');
    media.className = 'treat-card__media';
    card.insertBefore(media, img);
    media.appendChild(img);
    var imgStyle = img.getAttribute('style') || '';
    if (/height:\s*1[89]\dpx|height:\s*2\d{2}px/.test(imgStyle)) {
      media.classList.add('treat-card__media--lg');
    } else {
      media.classList.add('treat-card__media--sm');
    }
    img.removeAttribute('style');
    attachLightboxMedia(media, img, caption);

    var body = document.createElement('div');
    body.className = 'treat-card__body';
    card.appendChild(body);
    body.appendChild(buildLabelRow(parsed, ribbonClass));

    rest.forEach(function (el) {
      if (el.classList.contains('treat-card__read') || (el.tagName === 'SPAN' && /read/i.test(el.textContent))) {
        if (articleUrl) {
          var readA = document.createElement('a');
          readA.className = 'treat-card__link';
          readA.href = articleUrl;
          readA.target = '_blank';
          readA.rel = 'noopener noreferrer';
          readA.textContent = el.textContent.trim();
          body.appendChild(readA);
        }
        return;
      }
      if (el.tagName === 'H3') {
        el.className = 'treat-card__title';
        el.removeAttribute('style');
      } else if (el.tagName === 'P') {
        el.className = 'treat-card__desc';
        el.removeAttribute('style');
      }
      body.appendChild(el);
    });

    return parsed;
  }

  function enhanceCard(link) {
    var img = link.querySelector('img');
    var caption = link.querySelector('div[style*="padding:8px 10px"]');
    if (!img || !caption || link.classList.contains('clip-card--done')) return null;

    var titleLine = caption.innerHTML.split('<br>')[0].replace(/<[^>]+>/g, '').trim();
    var descEl = caption.querySelector('span');
    var desc = descEl ? descEl.textContent.trim() : '';
    var parsed = parseTitleLine(titleLine, img.getAttribute('alt') || '', img);
    var isPaper = matchPaper(parsed.source) || matchPaper(titleLine);
    var ribbonClass = isPaper ? 'clip-card__ribbon--paper' : (parsed.source.indexOf('Live') !== -1 ? 'clip-card__ribbon--live' : 'clip-card__ribbon--inst');

    link.classList.add('clip-card', 'clip-card--done');
    link.removeAttribute('style');
    if ((img.getAttribute('style') || '').indexOf('280px') !== -1) {
      link.classList.add('clip-card--tall');
    }

    var media = document.createElement('div');
    media.className = 'clip-card__media';
    img.removeAttribute('style');
    link.insertBefore(media, img);
    media.appendChild(img);

    var body = document.createElement('div');
    body.className = 'clip-card__body';

    body.appendChild(buildLabelRow({
      source: parsed.source,
      date: parsed.date,
      tag: parsed.tag
    }, ribbonClass));

    var h = document.createElement('h4');
    h.className = 'clip-card__title';
    h.textContent = parsed.title;
    body.appendChild(h);

    if (desc) {
      var wrap = document.createElement('div');
      wrap.className = 'clip-card__desc-wrap';
      var p = document.createElement('p');
      p.className = 'clip-card__desc';
      p.textContent = desc;
      wrap.appendChild(p);
      body.appendChild(wrap);
      if (desc.length > 72) {
        link.classList.add('clip-card--scroll');
        requestAnimationFrame(function () {
          var overflow = p.scrollWidth - wrap.clientWidth;
          if (overflow > 8) {
            p.style.setProperty('--clip-scroll', '-' + overflow + 'px');
          } else {
            link.classList.remove('clip-card--scroll');
          }
        });
      }
    }

    caption.replaceWith(body);
    link.dataset.clipCaption = parsed.source + ' — ' + parsed.title + (desc ? '. ' + desc : '');
    attachLightboxMedia(media, img, link.dataset.clipCaption);

    link.addEventListener('click', function (e) {
      if (!e.target.closest('[data-lightbox-src]')) {
        e.preventDefault();
      }
    });

    return {
      source: parsed.source,
      title: parsed.title,
      date: parsed.date
    };
  }

  function buildTicker(items) {
    var host = document.getElementById('newsLiveTicker');
    if (!host || !items.length) return;

    var track = host.querySelector('.news-live-ticker__track');
    if (!track) return;

    var html = '';
    items.slice(0, 12).forEach(function (item, i) {
      if (i) html += '<span class="news-live-ticker__dot" aria-hidden="true"><svg class="icon" aria-hidden="true"><use href="assets/icons.svg#icon-dot"/></svg></span>';
      html += '<span class="news-live-ticker__item"><strong>' + item.source + '</strong>' + item.title + (item.date ? ' · ' + item.date : '') + '</span>';
    });
    track.innerHTML = html + html;
  }

  function run() {
    var tickerItems = [];

    document.querySelectorAll('div[style*="grid-template-columns:repeat(4"]').forEach(function (grid) {
      var links = grid.querySelectorAll(':scope > a[href^="media/"]');
      if (!links.length) return;
      grid.classList.add('clip-grid');
      grid.removeAttribute('style');

      links.forEach(function (link) {
        var info = enhanceCard(link);
        if (info) tickerItems.push(info);
      });
    });

    buildTicker(tickerItems);

    document.querySelectorAll('a.treat-card, article.treat-card').forEach(function (card) {
      enhanceTreatCard(card);
    });

    if (typeof window.refreshNewsLightbox === 'function') {
      window.refreshNewsLightbox();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
