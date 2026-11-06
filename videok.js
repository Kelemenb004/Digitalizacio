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
  // szövegkönyv: a lapozható olvasó (/szovegkonyv/<név>/) vagy egy PDF (/dokumentumok/*.pdf)
  const SZOVEGKONYV_MINTA = /^\/(szovegkonyv\/[a-z0-9-]+\/|dokumentumok\/[A-Za-z0-9._-]+\.pdf)$/;
  const KONYV_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/></svg>';
  // „Szövegkönyv” gomb, ha a tételnek van szövegkönyve (pl. a jubileumi színdarab).
  // A lapozható olvasó ugyanazon a lapon nyílik (telefonon a vissza gomb visszahoz), a PDF új lapon.
  function szovegkonyvLink(v, osztaly) {
    if (!v.szovegkonyv || !SZOVEGKONYV_MINTA.test(v.szovegkonyv)) return '';
    const pdf = v.szovegkonyv.endsWith('.pdf');
    return `<a class="${osztaly}" href="${v.szovegkonyv}"${pdf ? ' target="_blank" rel="noopener"' : ''}>${KONYV_SVG}<span>${pdf ? 'Szövegkönyv (PDF)' : 'Szövegkönyv'}</span></a>`;
  }
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
      (v.megjegyzes ? `<p class="film-desc">${esc(v.megjegyzes)}</p>` : '') +
      szovegkonyvLink(v, 'film-szovegkonyv');
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
      (sub ? `<p class="video-sub">${sub}</p>` : '') +
      szovegkonyvLink(v, 'video-szovegkonyv');
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
    let ujrarajzol = null;
    videokBetoltese().then(lista => {
      const kiemelt = lista.filter(v => v.kiemelt === true);
      if (!kiemelt.length) return;
      document.getElementById('filmekSection').classList.remove('hidden');
      ujrarajzol = korhinta(kiemelt);
    }).catch(() => { /* hiba esetén a sáv egyszerűen nem jelenik meg */ });

    // Ha keresés/szűrés miatt a sáv elrejtődik (app.js: .filmek-szurt), a lejátszott film is álljon meg;
    // újra megjelenéskor a lapozót újra kell méretezni (rejtve 0 a szélessége)
    const sav = document.getElementById('filmekSection');
    if (sav && 'MutationObserver' in window) {
      new MutationObserver(() => {
        const rejtett = sav.classList.contains('filmek-szurt');
        if (aktiv && sav.contains(aktiv) && rejtett) megallit(aktiv);
        if (!rejtett && ujrarajzol) requestAnimationFrame(ujrarajzol);
      }).observe(sav, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ---------- Főoldali körhinta ----------
     Egyszerre egy videó van középen (asztalon a szomszédai halványan bekandikálnak).
     Lapozás: nyilak, pontok, ujjal húzás, ←/→ billentyű. Végtelenített: az utolsó után az első jön
     (a két szélén 2-2 klón dia, átmenet után észrevétlenül visszaugrik a valódira).
     Diaváltáskor a lejátszott videó megáll. Visszaad egy újrarajzoló függvényt (átméretezéshez). */
  function korhinta(lista) {
    const doboz = document.getElementById('filmekKarusszel');
    const sav = filmGrid;
    const ablak = sav.parentElement;
    const n = lista.length;
    const valodi = lista.map(v => { const d = filmKartya(v); d.classList.add('karusszel-dia'); return d; });
    if (n === 1 || !doboz || !ablak) {
      valodi.forEach(d => { d.classList.add('aktiv'); sav.appendChild(d); });
      if (doboz) doboz.classList.add('karusszel--egy');
      return null;
    }

    const ELO = 2;   // ennyi klón van a két szélén
    const klon = el => {
      const c = el.cloneNode(true);
      c.classList.add('karusszel-klon');
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('button, a').forEach(b => { b.tabIndex = -1; });
      return c;
    };
    const mod = i => ((i % n) + n) % n;
    const diak = [klon(valodi[mod(n - 2)]), klon(valodi[mod(n - 1)]), ...valodi, klon(valodi[0]), klon(valodi[mod(1)])];
    diak.forEach(d => sav.appendChild(d));
    valodi.forEach((d, i) => {
      d.setAttribute('role', 'group');
      d.setAttribute('aria-roledescription', 'dia');
      d.setAttribute('aria-label', `${i + 1} / ${n}: ${lista[i].cim}`);
    });

    const pontok = doboz.querySelector('.karusszel-pontok');
    const pontGombok = valodi.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'karusszel-pont';
      b.setAttribute('aria-label', `${i + 1}. videó: ${lista[i].cim}`);
      b.addEventListener('click', () => { if (!mozog) lepes(ELO + i - poz); });
      pontok.appendChild(b);
      return b;
    });

    let poz = ELO, mozog = false, idozito = null;
    const resRezges = () => { if (typeof rezges === 'function') rezges(); };

    function eltolas(p) {
      const dia = diak[p] || diak[ELO];
      const lepeskoz = dia.offsetWidth + (parseFloat(getComputedStyle(sav).columnGap) || 0);
      return (ablak.clientWidth - dia.offsetWidth) / 2 - p * lepeskoz;
    }
    function rajzol(animal, plusz = 0) {
      // átmenet nélküli ugrásnál (klónról a valódira, húzás közben) a diák halványítása se animáljon
      doboz.classList.toggle('karusszel--azonnal', !animal);
      sav.style.transform = `translate3d(${eltolas(poz) + plusz}px, 0, 0)`;
      diak.forEach((d, i) => d.classList.toggle('aktiv', i === poz));
      const vi = mod(poz - ELO);
      pontGombok.forEach((b, i) => {
        b.classList.toggle('aktiv', i === vi);
        b.setAttribute('aria-current', i === vi ? 'true' : 'false');
      });
      // a nyilak a videó magasságának közepén, az aktív dia két szélén
      const emb = diak[poz].querySelector('.video-embed');
      if (emb) doboz.style.setProperty('--nyil-y', (emb.offsetTop + emb.offsetHeight / 2) + 'px');
      doboz.style.setProperty('--dia-szel', diak[poz].offsetWidth + 'px');
      if (!animal) { void sav.offsetWidth; doboz.classList.remove('karusszel--azonnal'); }   // azonnal érvényesüljön
    }
    function helyreigazit() {
      clearTimeout(idozito);
      mozog = false;
      if (poz < ELO) { poz += n; rajzol(false); }
      else if (poz >= ELO + n) { poz -= n; rajzol(false); }
    }
    function lepes(d) {
      if (!d) return;
      if (mozog) helyreigazit();
      if (aktiv && diak[poz].contains(aktiv)) megallit(aktiv);   // a lejátszott videó megáll
      poz += d;
      mozog = true;
      rajzol(true);
      clearTimeout(idozito);
      idozito = setTimeout(helyreigazit, 800);                    // ha a transitionend elmaradna
    }
    sav.addEventListener('transitionend', e => {
      if (e.target === sav && e.propertyName === 'transform') helyreigazit();
    });

    doboz.querySelector('.karusszel-nyil--bal').addEventListener('click', () => { resRezges(); lepes(-1); });
    doboz.querySelector('.karusszel-nyil--jobb').addEventListener('click', () => { resRezges(); lepes(1); });
    doboz.addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input, textarea, select, video')) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); lepes(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); lepes(1); }
    });

    // A szomszéd (halvány) diára kattintva oda lapoz – nem indítja el a videóját
    diak.forEach((d, i) => d.addEventListener('click', e => {
      if (i === poz) return;
      e.preventDefault(); e.stopPropagation();
      if (!mozog) { resRezges(); lepes(i - poz); }
    }, true));

    // Ujjal / egérrel húzás
    let huz = null, kattTiltas = false;
    ablak.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest && e.target.closest('iframe, video, a')) return;
      if (mozog) helyreigazit();
      huz = { x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, id: e.pointerId, megy: false };
    });
    ablak.addEventListener('pointermove', e => {
      if (!huz || e.pointerId !== huz.id) return;
      const dx = e.clientX - huz.x0, dy = e.clientY - huz.y0;
      if (!huz.megy) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dy) > Math.abs(dx)) { huz = null; return; }   // függőleges mozdulat: görgetés
        huz.megy = true;
        try { ablak.setPointerCapture(e.pointerId); } catch {}
      }
      huz.dx = dx;
      rajzol(false, dx);
    });
    const huzVege = () => {
      if (!huz) return;
      const { dx, t0, megy } = huz;
      huz = null;
      if (!megy) return;
      kattTiltas = true;
      setTimeout(() => { kattTiltas = false; }, 60);
      const sebesseg = Math.abs(dx) / Math.max(1, performance.now() - t0);
      const kuszob = Math.min(110, ablak.clientWidth * 0.18);
      if (Math.abs(dx) > kuszob || (Math.abs(dx) > 30 && sebesseg > 0.5)) { resRezges(); lepes(dx < 0 ? 1 : -1); }
      else rajzol(true);
    };
    ablak.addEventListener('pointerup', huzVege);
    ablak.addEventListener('pointercancel', huzVege);
    ablak.addEventListener('click', e => { if (kattTiltas) { e.preventDefault(); e.stopPropagation(); } }, true);

    // Automatikus lapozás: 7 mp-enként a következő videó (a végén újra az első).
    // Szünetel: ha az egér a sávon van, ha szól/nyitva van egy videó, ha a sáv nem látszik
    // (keresés, elgörgetve, másik böngészőlap), és kézi lapozás/érintés után 15 mp-ig.
    // A „csökkentett mozgás” rendszerbeállításnál nincs automatikus lapozás.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let felette = false, latszik = true, szunetIg = 0;
      const kezzel = () => { szunetIg = Date.now() + 15000; };
      doboz.addEventListener('pointerdown', kezzel, true);
      doboz.addEventListener('keydown', kezzel, true);
      doboz.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') felette = true; });
      doboz.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') felette = false; });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(b => { latszik = b[0].isIntersecting; }, { threshold: 0.5 }).observe(doboz);
      }
      setInterval(() => {
        if (felette || !latszik || document.hidden || mozog || huz || Date.now() < szunetIg) return;
        if (aktiv && sav.contains(aktiv)) return;          // épp szól / nyitva egy videó
        if (!doboz.offsetParent) return;                    // keresés közben rejtve
        try { if (doboz.querySelector(':focus-visible')) return; } catch (e) { /* régi böngésző */ }
        lepes(1);
      }, 5000);
    }

    window.addEventListener('resize', () => rajzol(false));
    requestAnimationFrame(() => rajzol(false));
    return () => rajzol(false);
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
