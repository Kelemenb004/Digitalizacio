/* =====================================================================
   videok.js – videók megjelenítése
   Két helyen fut:
     • főoldal (index.html)  – #filmekGrid: a "kiemelt" videók ünnepi sávja
     • Videók oldal (/videok/) – #kiemeltGrid (kiemeltek) + #videokGrid (többi)

   Adat: /videok.json – kétféle tétel:
     1) YouTube-videó:  id = YouTube-azonosító (11 karakter)
     2) Saját videó az R2-ről (pl. a némafilmek): tipus = "video",
        src = útvonal az R2-n belül, pl. "filmek/sebestyen-andor-1.mp4".
        A fájl VÁLTOZATLANUL van fent; az oldalon nincs letöltés gomb és nincs
        jobb klikkes mentés (teljes védelem a weben nem létezik, ez az átlagos
        látogatót tartja vissza).
   Közös mezők:
     cim, alkalom, datum ("ÉÉÉÉ", "ÉÉÉÉ-HH-NN" vagy szöveg, pl. "1926–1954"),
     eloado, megjegyzes (rövid leírás), hossz_sec (nem kötelező),
     kiemelt   true → a főoldali sávban és a Videók oldal elején jelenik meg,
     keparany  pl. "4:3" – a lejátszó képaránya (alapból 16:9),
     poszter   saját borítókép, pl. "/images/film-1.webp" (YouTube-nál alapból a YouTube-os kép).

   Kattintásig csak a borítókép látszik (nem tölt YouTube-ot / videót).
   Egyszerre csak egy videó szól; a főoldalon a videó és a hanglejátszó kizárja egymást.
   ===================================================================== */
(function () {
  'use strict';

  const HONAP = ['január', 'február', 'március', 'április', 'május', 'június',
                 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  const YT_MINTA = /^[A-Za-z0-9_-]{11}$/;
  const SRC_MINTA = /^filmek\/[A-Za-z0-9._-]+\.mp4$/;
  const POSZTER_MINTA = /^\/images\/[A-Za-z0-9._-]+$/;
  const ARANY_MINTA = /^(\d{1,4}):(\d{1,4})$/;
  const PLAY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  // R2 alap-URL: a config.js-ből (főoldal és Videók oldal is betölti)
  const R2 = (typeof CONFIG !== 'undefined' && CONFIG.R2_BASE_URL) || '';

  function sajatVideo(v) { return v.tipus === 'video'; }
  function ervenyes(v) {
    if (!v || typeof v !== 'object') return false;
    if (sajatVideo(v)) return !!R2 && typeof v.src === 'string' && SRC_MINTA.test(v.src);
    return typeof v.id === 'string' && YT_MINTA.test(v.id);
  }

  function datumSzoveg(d) {
    if (!d) return '';
    d = String(d);
    if (/^\d{4}$/.test(d)) return d;
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[1]}. ${HONAP[+m[2] - 1]} ${+m[3]}.`;
    return d;
  }
  function hosszSzoveg(s) {
    s = Number(s);
    if (!s || s < 60) return '';
    return Math.round(s / 60) + ' perc';
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function poszterKep(v) {
    if (v.poszter && POSZTER_MINTA.test(v.poszter)) return v.poszter;
    return sajatVideo(v) ? '' : `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
  }

  // --- Lejátszás: egyszerre egy videó; a hanglejátszóval kölcsönösen megállítják egymást ---
  const hang = document.getElementById('audioElement'); // csak a főoldalon létezik
  let aktiv = null;

  function vissza(embed) {               // YouTube: vissza a borítóképre (az iframe-et nem lehet szüneteltetni)
    if (embed._poszter) embed.replaceChildren(embed._poszter);
    if (aktiv === embed) aktiv = null;
  }
  function megallit(embed) {             // saját videó: csak szünet (onnan folytatható); YouTube: vissza
    if (embed._video) { embed._video.pause(); if (aktiv === embed) aktiv = null; }
    else vissza(embed);
  }
  function lett_aktiv(embed) {
    if (aktiv && aktiv !== embed) megallit(aktiv);
    if (hang && !hang.paused) hang.pause();
    aktiv = embed;
  }

  function youtubeBetolt(embed, v) {
    lett_aktiv(embed);
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;
    f.title = v.cim || 'Videó';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.setAttribute('allowfullscreen', '');
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    embed.replaceChildren(f);
  }

  function sajatBetolt(embed, v) {
    let vid = embed._video;
    if (!vid) {
      vid = document.createElement('video');
      vid.src = R2 + '/' + v.src.split('/').map(encodeURIComponent).join('/');
      vid.controls = true;
      vid.preload = 'metadata';
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.setAttribute('controlslist', 'nodownload');           // nincs letöltés gomb a lejátszón
      vid.setAttribute('aria-label', v.cim || 'Videó');
      const kep = poszterKep(v);
      if (kep) vid.poster = kep;
      vid.addEventListener('contextmenu', e => e.preventDefault()); // nincs jobb klikkes „Videó mentése”
      vid.addEventListener('play', () => lett_aktiv(embed));
      vid.addEventListener('error', () => {
        const p = document.createElement('p');
        p.className = 'video-hiba';
        p.textContent = 'A film jelenleg nem tölthető be. Kérlek, próbáld újra később.';
        embed.replaceChildren(p);
        embed._video = null;
        if (aktiv === embed) aktiv = null;
      });
      embed._video = vid;
      embed.replaceChildren(vid);
    }
    lett_aktiv(embed);
    const p = vid.play();
    if (p && p.catch) p.catch(() => { /* ha a böngésző nem engedi az automatikus indítást, a lejátszó gombja marad */ });
  }

  if (hang) hang.addEventListener('play', () => { if (aktiv) megallit(aktiv); });

  // Lejátszó-doboz borítóképpel és play gombbal. stilus: '' (piros) vagy 'arany' (kiemelt filmek)
  function beagyazas(v, stilus) {
    const embed = document.createElement('div');
    embed.className = 'video-embed';
    const ar = String(v.keparany || '').match(ARANY_MINTA);
    if (ar && +ar[1] > 0 && +ar[2] > 0) embed.style.aspectRatio = `${+ar[1]} / ${+ar[2]}`;
    embed.addEventListener('contextmenu', e => { if (sajatVideo(v)) e.preventDefault(); });

    const p = document.createElement('button');
    p.type = 'button';
    p.className = 'video-poster';
    p.setAttribute('aria-label', (v.cim || 'Videó') + ' – lejátszás');
    const kep = poszterKep(v);
    if (kep) p.style.backgroundImage = `url('${kep}')`;
    p.innerHTML = `<span class="video-play${stilus === 'arany' ? ' video-play--arany' : ''}">${PLAY_SVG}</span>`;
    p.addEventListener('click', () => (sajatVideo(v) ? sajatBetolt(embed, v) : youtubeBetolt(embed, v)));

    embed._poszter = p;
    embed.appendChild(p);
    return embed;
  }

  // --- Főoldali filmkártya ---
  function filmKartya(v) {
    const card = document.createElement('article');
    card.className = 'film-card';
    card.appendChild(beagyazas(v, 'arany'));

    const felso = [v.alkalom, datumSzoveg(v.datum), hosszSzoveg(v.hossz_sec)]
      .filter(Boolean).map(esc).join(' · ');
    const meta = document.createElement('div');
    meta.className = 'film-meta';
    meta.innerHTML =
      (felso ? `<p class="film-date">${felso}</p>` : '') +
      `<h3 class="film-title">${esc(v.cim)}</h3>` +
      (v.megjegyzes ? `<p class="film-desc">${esc(v.megjegyzes)}</p>` : '');
    card.appendChild(meta);
    return card;
  }

  // --- Videók oldali kártya ---
  function videoKartya(v, kiemelt) {
    const card = document.createElement('article');
    card.className = 'video-card' + (kiemelt ? ' video-card--kiemelt' : '');
    card.appendChild(beagyazas(v, kiemelt ? 'arany' : ''));

    const reszek = [];
    if (v.megjegyzes) reszek.push(esc(v.megjegyzes));
    const d = datumSzoveg(v.datum);
    if (d) reszek.push(esc(d));
    const h = hosszSzoveg(v.hossz_sec);
    if (h) reszek.push(esc(h));
    if (v.eloado) reszek.push(esc(v.eloado));
    const sub = reszek.join(' · ');

    const meta = document.createElement('div');
    meta.className = 'video-meta';
    meta.innerHTML =
      (v.alkalom ? `<span class="video-badge">${esc(v.alkalom)}</span>` : '') +
      `<h2 class="video-title">${esc(v.cim)}</h2>` +
      (sub ? `<p class="video-sub">${sub}</p>` : '');
    card.appendChild(meta);
    return card;
  }

  function videokBetoltese() {
    return fetch('/videok.json')
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(lista => (Array.isArray(lista) ? lista : []).filter(ervenyes));
  }

  // --- Főoldal: ünnepi filmsáv (csak ha van kiemelt videó; különben rejtve marad) ---
  const filmGrid = document.getElementById('filmekGrid');
  if (filmGrid) {
    videokBetoltese().then(lista => {
      const kiemelt = lista.filter(v => v.kiemelt === true);
      if (!kiemelt.length) return;
      kiemelt.forEach(v => filmGrid.appendChild(filmKartya(v)));
      if (kiemelt.length === 1) filmGrid.classList.add('filmek-grid--egy');
      document.getElementById('filmekSection').classList.remove('hidden');
    }).catch(() => { /* hiba esetén a sáv egyszerűen nem jelenik meg */ });

    // Ha keresés/szűrés miatt a sáv elrejtődik (app.js: .filmek-szurt), a lejátszott film is álljon meg
    const sav = document.getElementById('filmekSection');
    if (sav && 'MutationObserver' in window) {
      new MutationObserver(() => {
        if (aktiv && sav.contains(aktiv) && sav.classList.contains('filmek-szurt')) megallit(aktiv);
      }).observe(sav, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // --- Videók oldal: kiemeltek külön blokkban elöl, utána a többi ---
  const videoGrid = document.getElementById('videokGrid');
  if (videoGrid) {
    videokBetoltese().then(lista => {
      const kiemelt = lista.filter(v => v.kiemelt === true);
      const kiemeltGrid = document.getElementById('kiemeltGrid');
      if (kiemelt.length && kiemeltGrid) {
        kiemelt.forEach(v => kiemeltGrid.appendChild(videoKartya(v, true)));
        document.getElementById('kiemeltBlokk').hidden = false;
        const tobbiCim = document.getElementById('tobbiCim');
        if (tobbiCim) tobbiCim.hidden = false;
      }
      lista.filter(v => v.kiemelt !== true)
        .forEach(v => videoGrid.appendChild(videoKartya(v, false)));
    }).catch(() => {
      videoGrid.innerHTML =
        '<p style="opacity:.8">A videók jelenleg nem tölthetők be. Kérlek, próbáld újra később.</p>';
    });
  }
})();
