/* =====================================================================
   lapozo.js – lapozható szövegkönyv (pl. /szovegkonyv/chronica-hominis/)
   Az oldalak előre elkészített képek (_forrasok/szovegkonyv_oldalak.py):
     data-kep  = …/oldalak/{n}.webp  (lapozáshoz, 1100 px)
     data-nagy = …/nagy/{n}.webp     (csak nagyításkor, 1800 px)
   Elrendezés:
     • széles, fekvő képernyő (gép, tablet fekve): két oldal egymás mellett, mint egy
       nyitott könyv; a lap a gerinc körül fordul át (elöl/hátul a két oldal)
     • telefon: egy oldal; a lap a bal szélén (gerincén) fordul el
     • fekvő telefon: az oldal kitölti a szélességet és lefelé görgethető
   Lapozás: húzás (a lap követi az ujjat), koppintás az oldal szélére, nyilak,
   ←/→ billentyű, csúszka. Nagyítás fokozatosan: + / − gomb (100% → 300%, a képernyő
   közepe körül), dupla koppintás: 150% a koppintott pontnál / vissza 100%-ra. Nagyítva
   a lap natívan görgethető, a lapozó nyilak tovább működnek. Csak transform/opacity
   animál → a telefon GPU-ja viszi, nem akad.
   Előtöltés: a környező oldalak képe előre letöltődik és dekódolódik.
   ===================================================================== */
(function () {
  'use strict';

  const konyv = document.getElementById('konyv');
  if (!konyv) return;

  const N = parseInt(konyv.dataset.oldalak, 10) || 0;
  const KEP = konyv.dataset.kep || '';
  const NAGY = konyv.dataset.nagy || KEP;
  const ARANY = (() => {                           // oldal szélesség / magasság
    const m = String(konyv.dataset.arany || '').match(/^(\d+)\/(\d+)$/);
    return m ? +m[1] / +m[2] : 0.7071;
  })();
  if (!N || !KEP) return;

  const asztal = document.getElementById('asztal');
  const helyBal = konyv.querySelector('.lp-hely--bal');
  const helyJobb = konyv.querySelector('.lp-hely--jobb');
  const lap = konyv.querySelector('.lp-lap');
  const lapElo = lap.querySelector('.lp-lap-elo');
  const lapHat = lap.querySelector('.lp-lap-hat');
  const fenyElo = lapElo.querySelector('.lp-feny');
  const fenyHat = lapHat.querySelector('.lp-feny');
  const vetJobb = konyv.querySelector('.lp-vetett--jobb');
  const vetBal = konyv.querySelector('.lp-vetett--bal');
  const gombElozo = document.querySelector('.lp-elozo');
  const gombKov = document.querySelector('.lp-kovetkezo');
  const csuszka = document.querySelector('.lp-csuszka');
  const kijelzo = document.querySelector('.lp-oldalszam');
  const tipp = document.querySelector('.lp-tipp');

  const kepUrl = (minta, n) => minta.replace('{n}', String(n).padStart(3, '0'));
  const lassabb = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ervenyes = n => n >= 1 && n <= N;

  /* ---------- Állapot ----------
     ket = két oldal látszik; p = egyoldalas módban az aktuális oldal,
     kétoldalasban a bal oldal száma (páros, 0 = a borító előtti üres hely) */
  let ket = false, p = 1, lapSzel = 0, lapMag = 0, gerinc = 0;
  let fut = null;                                   // folyamatban lévő lapozás

  const balLap = q => q - (q % 2);                  // kétoldalas nézetben a nyitott pár bal oldala
  function elsoLatszo() { return ket ? Math.max(1, p) : p; }
  function kovVan() { return ket ? p + 2 <= N : p < N; }
  function elozoVan() { return ket ? p > 0 : p > 1; }

  /* ---------- Képek: előtöltés + dekódolás (ne villanjon üres lap lapozáskor) ---------- */
  const tar = new Map();
  function betolt(n) {
    if (!ervenyes(n)) return Promise.resolve();
    let t = tar.get(n);
    if (!t) {
      const img = new Image();
      img.decoding = 'async';
      img.src = kepUrl(KEP, n);
      const kesz = img.decode ? img.decode() : new Promise((ok, hiba) => { img.onload = ok; img.onerror = hiba; });
      t = { img, kesz: kesz.catch(() => {}) };
      tar.set(n, t);
    }
    return t.kesz;
  }
  function varj(lista, ms) {
    return Promise.race([Promise.all(lista.map(betolt)), new Promise(ok => setTimeout(ok, ms))]);
  }
  // Előbb a látható oldal(ak), utána a következők, végül a távolabbiak – lassú hálózaton
  // így az épp nézett oldal kapja a sávszélességet
  let elotoltSzam = 0;
  function elotolt() {
    const k = elsoLatszo(), sajat = ++elotoltSzam;
    const lepcsok = [[0, 1], [2, 3, -1], [-2, 4, 5], [-3, 6, 7]];
    lepcsok.reduce((lanc, csop) => lanc.then(() => {
      if (sajat !== elotoltSzam) return;           // közben továbblapoztak: az új kör dönt
      return Promise.all(csop.map(d => betolt(k + d)));
    }), Promise.resolve());
  }

  // Egy oldal kitöltése (hely vagy a lapozó lap egyik oldala). n érvénytelen → üres (nem látszik)
  function kitolt(doboz, n) {
    const img = doboz.querySelector('img');
    if (!ervenyes(n)) {
      doboz.classList.add('ures');
      img.removeAttribute('src');
      img.alt = '';
      doboz.dataset.n = '';
      return;
    }
    doboz.classList.remove('ures');
    if (doboz.dataset.n !== String(n)) {
      doboz.dataset.n = String(n);
      doboz.classList.add('tolt');
      img.onload = img.onerror = () => doboz.classList.remove('tolt');
      img.src = kepUrl(KEP, n);
      img.alt = `${n}. oldal`;
      if (img.complete && img.naturalWidth) doboz.classList.remove('tolt');
    }
  }

  /* ---------- Méretezés ---------- */
  function meretez() {
    if (fut) befejez(fut, true, true);
    const W = asztal.clientWidth, H = asztal.clientHeight;
    const pad = W < 600 ? 10 : 28;
    const ujKet = W >= 860 && W / H >= 1.15 && H >= 520;   // fekvő telefonon nem: ott túl kicsi lenne
    let gorgo = false;
    if (ujKet) {
      // fent-lent több hely: a felénk forduló lap széle a perspektíva miatt kicsit nagyobb
      lapMag = Math.min(H - 2 * Math.max(pad, 40), (W - 2 * pad) / 2 / ARANY);
      lapSzel = lapMag * ARANY;
    } else {
      lapSzel = Math.min(W - 2 * pad, (H - 2 * pad) * ARANY);
      if (H < 520 && W > H) { lapSzel = Math.min(W - 2 * pad, 900); gorgo = true; }   // fekvő telefon
      lapMag = lapSzel / ARANY;
    }
    lapSzel = Math.floor(lapSzel); lapMag = Math.floor(lapMag);
    // módváltáskor az aktuális oldal maradjon látható
    if (ujKet !== ket) p = ujKet ? balLap(elsoLatszo()) : Math.max(1, ket ? (p || 1) : p);
    ket = ujKet;
    gerinc = ket ? lapSzel : 0;
    asztal.classList.toggle('gorgo', gorgo);
    konyv.classList.toggle('ket-oldal', ket);
    konyv.style.setProperty('--lap-szel', lapSzel + 'px');
    konyv.style.setProperty('--lap-mag', lapMag + 'px');
    konyv.style.setProperty('--gerinc', gerinc + 'px');
    konyv.style.width = (ket ? 2 * lapSzel : lapSzel) + 'px';
    konyv.style.height = lapMag + 'px';
    konyv.style.perspective = Math.round(Math.max(2000, lapSzel * 8)) + 'px';
    allo(false);
    if (zoomban()) zoomKepek();
  }

  // A borítónál (csak jobb oldal) és a végén (csak bal oldal) a könyv középre csúszik
  function eltolas(pp) {
    if (!ket) return 0;
    if (pp === 0) return -lapSzel / 2;
    if (pp + 1 > N) return lapSzel / 2;
    return 0;
  }

  /* ---------- Álló (nem lapozó) állapot kirajzolása ---------- */
  function allo(animal) {
    if (ket) { kitolt(helyBal, p); kitolt(helyJobb, p + 1); }
    else { kitolt(helyJobb, p); }
    helyBal.hidden = !ket;
    konyv.style.transition = animal ? '' : 'none';
    konyv.style.transform = `translateX(${eltolas(p)}px)`;
    if (!animal) { void konyv.offsetWidth; konyv.style.transition = ''; }
    // lapvastagság: a két szélen „lapok éle”, ahogy fogy/gyűlik
    const elotte = ket ? p : p - 1, utana = N - (ket ? p + 1 : p);
    konyv.dataset.elBal = Math.min(4, Math.ceil(Math.max(0, elotte) / 12));
    konyv.dataset.elJobb = Math.min(4, Math.ceil(Math.max(0, utana) / 12));
    lap.classList.remove('mozog');
    vetJobb.style.opacity = vetBal.style.opacity = '0';
    feliratok();
    elotolt();
  }

  function feliratok() {
    const a = elsoLatszo();
    const b = ket && ervenyes(p) && ervenyes(p + 1) ? p + 1 : a;
    kijelzo.textContent = (a === b ? `${a}` : `${a}–${b}`) + ` / ${N}`;
    if (document.activeElement !== csuszka) csuszka.value = String(a);
    gombElozo.disabled = !elozoVan();
    gombKov.disabled = !kovVan();
    try { history.replaceState(history.state, '', '#' + a); } catch (e) { /* pl. file:// */ }
  }

  /* ---------- A lapozó lap rajzolása adott szögnél (theta: 0 … -180 fok) ---------- */
  function rajzolLap(theta) {
    const a = -theta, rad = a * Math.PI / 180, s = Math.sin(rad), c = Math.cos(rad);
    lap.style.transform = `rotateY(${theta}deg)`;
    fenyElo.style.opacity = a < 90 ? (a / 90 * 0.55).toFixed(3) : '0';
    fenyHat.style.opacity = a > 90 ? ((180 - a) / 90 * 0.5).toFixed(3) : '0';
    if (a <= 90) {
      vetJobb.style.opacity = (s * 0.55).toFixed(3);
      vetJobb.style.transform = `scaleX(${Math.min(1, Math.max(0.02, c + 0.22 * s)).toFixed(4)})`;
      vetBal.style.opacity = '0';
    } else {
      vetJobb.style.opacity = '0';
      vetBal.style.opacity = ket ? (s * 0.55).toFixed(3) : '0';
      vetBal.style.transform = `scaleX(${Math.min(1, Math.max(0.02, -c + 0.22 * s)).toFixed(4)})`;
    }
  }

  /* ---------- Lapozás előkészítése: kinek mi látszik a lap két oldalán és alatta ---------- */
  function kezd(irany) {
    if (irany > 0 ? !kovVan() : !elozoVan()) return null;
    const st = { irany, theta: 0, cel: 0, raf: 0, vege: ket ? -180 : -90 };
    lapHat.classList.toggle('papir', !ket);
    if (ket) {
      if (irany > 0) { kitolt(lapElo, p + 1); kitolt(lapHat, p + 2); kitolt(helyJobb, p + 3); st.theta = 0; }
      else { kitolt(lapElo, p - 1); kitolt(lapHat, p); kitolt(helyBal, p - 2); st.theta = -180; }
      konyv.style.transform = `translateX(${eltolas(p + 2 * irany)}px)`;   // a könyv középre/szélre csúszik
    } else {
      if (irany > 0) { kitolt(lapElo, p); kitolt(lapHat, p); kitolt(helyJobb, p + 1); st.theta = 0; }
      else { kitolt(lapElo, p - 1); kitolt(lapHat, p - 1); st.theta = -90; }
    }
    st.cel = irany > 0 ? st.vege : 0;
    lap.classList.add('mozog');
    rajzolLap(st.theta);
    fut = st;
    rejtTipp();
    return st;
  }

  function befejez(st, kesz, azonnal) {
    cancelAnimationFrame(st.raf);
    if (st.ok) { const ok = st.ok; st.ok = null; ok(); }     // a várakozó lánc menjen tovább
    if (fut === st) fut = null;
    if (kesz) p += st.irany * (ket ? 2 : 1);
    if (azonnal || !kesz) konyv.style.transform = `translateX(${eltolas(p)}px)`;
    allo(true);
    if (kesz && asztal.classList.contains('gorgo')) asztal.scrollTop = 0;
  }

  const ease = {
    beKi: k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    be: k => k * k * (1.6 * k - 0.6) / 1,        // lassan indul, a végén gyorsul (a lap „elválik”)
    ki: k => 1 - Math.pow(1 - k, 3),
  };
  function animal(st, cel, ido, fv) {
    cancelAnimationFrame(st.raf);
    if (lassabb.matches) ido = 0;
    const t0 = performance.now(), th0 = st.theta;
    return new Promise(ok => {
      st.ok = ok;
      const kepkocka = t => {
        const k = ido ? Math.min(1, (t - t0) / ido) : 1;
        st.theta = th0 + (cel - th0) * Math.max(0, Math.min(1, fv(k)));
        rajzolLap(st.theta);
        if (k < 1) st.raf = requestAnimationFrame(kepkocka);
        else { st.ok = null; ok(); }
      };
      st.raf = requestAnimationFrame(kepkocka);
    });
  }

  // Gombbal / billentyűvel / koppintással indított teljes lapozás
  let sor = Promise.resolve();
  function lapoz(irany) {
    if (zoomban()) { zoomLapoz(irany); return; }
    if (fut) befejez(fut, fut.cel === fut.vege ? fut.irany > 0 : fut.irany < 0, true);   // gyors egymásutáni lapozás
    if (irany > 0 ? !kovVan() : !elozoVan()) { rezeg(irany); return; }
    const kellenek = ket ? (irany > 0 ? [p + 1, p + 2, p + 3] : [p - 1, p - 2, p]) : (irany > 0 ? [p, p + 1] : [p - 1]);
    sor = sor.then(() => varj(kellenek, 700)).then(() => {
      if (fut) return;
      const st = kezd(irany);
      if (!st) return;
      const ido = ket ? 820 : 560;
      const fv = ket ? ease.beKi : (irany > 0 ? ease.be : ease.ki);
      return animal(st, st.cel, ido, fv).then(() => { if (fut === st) befejez(st, true); });
    });
  }

  function ugrik(n) {                                // csúszka: azonnal az adott oldalra
    if (fut) befejez(fut, false, true);
    n = Math.max(1, Math.min(N, n));
    p = ket ? balLap(n) : n;
    allo(true);
    if (zoomban()) { zoomKepek(); zoom.scrollTop = 0; }
  }

  function rezeg(irany) {                            // a sor elején/végén: kis jelzés, hogy nincs tovább
    konyv.animate && konyv.animate([
      { translate: '0 0' }, { translate: `${-irany * 8}px 0` }, { translate: '0 0' },
    ], { duration: 260, easing: 'ease-out' });
  }

  /* ---------- Húzás, koppintás ---------- */
  let huz = null, utolsoKopp = 0, koppHely = null;
  asztal.addEventListener('pointerdown', e => {
    if (zoomban() || document.body.classList.contains('csipve')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('button, a, input')) return;
    if (huz || csip) {                               // második ujj: nagyítás jön, nem lapozás
      if (huz && huz.st && fut === huz.st) befejez(huz.st, false, true);
      huz = null;
      return;
    }
    huz = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), st: null, mozdult: false, xs: [] };
  });
  asztal.addEventListener('pointermove', e => {
    if (!huz || e.pointerId !== huz.id || csip) return;
    const dx = e.clientX - huz.x0, dy = e.clientY - huz.y0;
    if (!huz.mozdult) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) { huz = null; return; }   // függőleges: görgetés
      huz.mozdult = true;
      if (fut) befejez(fut, fut.cel === fut.vege ? fut.irany > 0 : fut.irany < 0, true);
      huz.st = kezd(dx < 0 ? 1 : -1);
      if (!huz.st) { huz.vege = true; }
      try { asztal.setPointerCapture(e.pointerId); } catch (err) { /* nem baj */ }
      const r = konyv.getBoundingClientRect();
      huz.gerincX = r.left + gerinc;
    }
    huz.xs.push([performance.now(), e.clientX]);
    if (huz.xs.length > 6) huz.xs.shift();
    const st = huz.st;
    if (!st) return;
    cancelAnimationFrame(st.raf);
    if (st.ok) { const ok = st.ok; st.ok = null; ok(); }
    // a lap azon pontja, amelyet megfogtunk, kövesse az ujjat (vetített helyzet: gerinc + szél·cos θ)
    let cos;
    if (st.irany > 0) {
      const d = ket ? Math.max(huz.x0 - huz.gerincX, 0.35 * lapSzel) : Math.max(huz.x0 - huz.gerincX, 0.35 * lapSzel);
      cos = 1 + dx / d;
    } else if (ket) {
      const d = Math.max(huz.gerincX - huz.x0, 0.35 * lapSzel);
      cos = -1 + dx / d;
    } else {
      cos = dx / (0.8 * lapSzel);
    }
    cos = Math.max(ket ? -1 : 0, Math.min(1, cos));
    st.theta = -Math.acos(cos) * 180 / Math.PI;
    rajzolLap(st.theta);
  });
  function huzVege(e, megszakad) {
    if (!huz || (e && e.pointerId !== huz.id)) return;
    const h = huz; huz = null;
    if (!h.mozdult) {
      if (!megszakad) koppintas(e);
      return;
    }
    const st = h.st;
    if (!st) { rezeg(e && e.clientX - h.x0 < 0 ? 1 : -1); return; }
    // sebesség az utolsó ~120 ms mozdulataiból (px/ms); ha az ujj a végén megállt, nincs lendület
    let v = 0;
    const most = performance.now();
    const friss = h.xs.filter(([t]) => most - t < 120);
    if (friss.length > 1) {
      const [t1, x1] = friss[0], [t2, x2] = friss[friss.length - 1];
      v = (x2 - x1) / Math.max(1, t2 - t1);
    }
    const halad = st.irany > 0 ? (-st.theta) / -st.vege : (st.theta - st.vege) / -st.vege;   // 0…1
    const lendulet = st.irany > 0 ? -v : v;
    const kesz = !megszakad && (lendulet > 0.35 || (halad > 0.3 && lendulet > -0.2));
    const cel = (st.irany > 0) === kesz ? st.vege : 0;
    const maradek = Math.abs(cel - st.theta) / -st.vege;
    animal(st, cel, Math.max(140, (ket ? 700 : 460) * maradek), ease.ki)
      .then(() => { if (fut === st) befejez(st, kesz); });
  }
  asztal.addEventListener('pointerup', e => huzVege(e, false));
  asztal.addEventListener('pointercancel', e => huzVege(e, true));
  asztal.addEventListener('dragstart', e => e.preventDefault());

  // Koppintás: a könyv két szélén lapoz, középen dupla koppintással nagyít
  function koppintas(e) {
    if (!e || e.target.closest('button, a, input')) return;
    const r = konyv.getBoundingClientRect();
    if (e.clientY < r.top - 20 || e.clientY > r.bottom + 20) return;
    const rel = (e.clientX - r.left) / r.width;
    const most = performance.now();
    if (rel < 0.28) { lapoz(-1); return; }
    if (rel > 0.72) { lapoz(1); return; }
    if (most - utolsoKopp < 320 && koppHely && Math.hypot(e.clientX - koppHely[0], e.clientY - koppHely[1]) < 40) {
      utolsoKopp = 0;
      zoomFok(DUPLA, e.clientX, e.clientY);         // a koppintott pont marad az ujj alatt
      return;
    }
    utolsoKopp = most; koppHely = [e.clientX, e.clientY];
  }

  /* ---------- Gombok, billentyűk, csúszka ---------- */
  gombElozo.addEventListener('click', () => lapoz(-1));
  gombKov.addEventListener('click', () => lapoz(1));
  csuszka.max = String(N);
  csuszka.addEventListener('input', () => { kijelzo.textContent = `${csuszka.value} / ${N}`; });
  csuszka.addEventListener('change', () => { ugrik(parseInt(csuszka.value, 10)); csuszka.blur(); });
  document.addEventListener('keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.closest && e.target.closest('input')) return;
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomLepes(1); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomLepes(-1); return; }
    if ((e.key === '0' || e.key === 'Escape') && zoomban()) { e.preventDefault(); zoomFok(1); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); lapoz(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); lapoz(-1); }
    else if (e.key === 'Home') { e.preventDefault(); ugrik(1); }
    else if (e.key === 'End') { e.preventDefault(); ugrik(N); }
  });

  /* ---------- Csippentéses (böngésző-) nagyítás alatt ne lapozzon, hanem görgessen ---------- */
  if (window.visualViewport) {
    const vv = window.visualViewport;
    const figyel = () => document.body.classList.toggle('csipve', vv.scale > 1.02);
    vv.addEventListener('resize', figyel);
    figyel();
  }

  /* ---------- Nagyítás: + / − gomb, két ujjal (csippentés), dupla koppintás ----------
     100%-on a lapozó könyv látszik; nagyítva ugyanazok az oldalak egy görgethető
     rétegben, nagyobb méretben (100% … 300%). A böngésző saját nagyítását kikapcsoljuk
     (a fejléc és a lapozó sáv így mindig a helyén marad), a két ujjas mozdulatot mi
     kezeljük. Nagyítva is lehet lapozni: nyilakkal, vagy ha a lap széléig görgettél,
     még egy húzással abba az irányba. A horgonypont (ujjak közepe / képernyő közepe)
     a helyén marad. Nagyításnál az élesebb (1800 px-es) kép töltődik. */
  const LEPCSOK = [1, 1.25, 1.5, 2, 2.5, 3];
  const MAX = 3, DUPLA = 1.5;
  const zoom = document.querySelector('.lp-zoom');
  const zLap = zoom.querySelector('.lp-zoom-lap');
  const zKepek = [...zLap.querySelectorAll('img')];
  const gombNagyit = document.querySelector('.lp-nagyit');
  const gombKicsinyit = document.querySelector('.lp-kicsinyit');
  const jelzo = document.querySelector('.lp-szint');
  let f = 1, zAllapot = false, zVissza = false, jelzoIdo = 0;
  function zoomban() { return f > 1.001; }

  // a nagyított nézetben látszó oldalak (a borító / az utolsó oldal egyedül)
  function zoomOldalak() { return (ket ? [p, p + 1] : [p]).filter(ervenyes); }

  function zoomKepek() {
    const w = Math.round(lapSzel * f), h = Math.round(lapMag * f);
    const lapok = zoomOldalak();
    const eles = w * (window.devicePixelRatio || 1) > 1150;
    zKepek.forEach((img, i) => {
      const n = lapok[i];
      if (!n) { img.hidden = true; img.removeAttribute('src'); img.dataset.n = ''; return; }
      img.hidden = false;
      img.style.width = w + 'px';
      img.style.height = h + 'px';
      img.alt = `${n}. oldal (nagyítva)`;
      if (img.dataset.n !== String(n)) { img.src = kepUrl(KEP, n); img.dataset.n = String(n); img.dataset.m = ''; }
      if (eles && !img.dataset.m) {                  // az élesebb kép, amint megjött
        img.dataset.m = 'tolt';
        const nagy = new Image();
        nagy.src = kepUrl(NAGY, n);
        (nagy.decode ? nagy.decode() : new Promise(ok => { nagy.onload = ok; }))
          .then(() => { if (img.dataset.n === String(n)) { img.src = nagy.src; img.dataset.m = 'nagy'; } })
          .catch(() => { if (img.dataset.n === String(n)) img.dataset.m = ''; });
      }
    });
  }

  // a látható oldal(ak) téglalapja a képernyőn (a horgonypont számításához)
  function tartalomTeglalap() {
    if (zoomban()) return zLap.getBoundingClientRect();
    const r = [helyBal, helyJobb].filter(h => !h.hidden && !h.classList.contains('ures'))
      .map(h => h.getBoundingClientRect());
    if (!r.length) return konyv.getBoundingClientRect();
    const left = Math.min(...r.map(x => x.left)), right = Math.max(...r.map(x => x.right));
    return { left, top: r[0].top, width: right - left, height: r[0].height };
  }
  function relativ(ax, ay) {                         // a tartalom melyik pontja van (ax, ay) alatt (0…1)
    const r = tartalomTeglalap();
    return { rx: Math.max(0, Math.min(1, (ax - r.left) / r.width)), ry: Math.max(0, Math.min(1, (ay - r.top) / r.height)) };
  }

  // nagyítás beállítása; (ax, ay) képernyőpont, rel: a tartalom pontja, amely oda kerüljön
  function zoomFok(uj, ax, ay, rel, csendes) {
    uj = Math.max(1, Math.min(MAX, uj));
    if (csendes) {                                  // csippentés közben:
      if (f <= 1.001 && uj <= 1.01) return;          //   még nem nagyít
      uj = Math.max(uj, 1.0001);                     //   és nem lép ki (az ujj felengedésekor dől el)
    } else if (uj < 1.03) uj = 1;
    if (Math.abs(uj - f) < 0.001 && !rel) return;
    if (fut) befejez(fut, false, true);
    rejtTipp();
    const ar = asztal.getBoundingClientRect();
    if (ax === undefined) { ax = ar.left + ar.width / 2; ay = ar.top + ar.height / 2; }
    rel = rel || relativ(ax, ay);
    const volt = f;
    f = uj;
    if (f <= 1.001) {
      f = 1;
      zoom.hidden = true;
      document.body.classList.remove('zoomban');
      zKepek.forEach(img => { img.removeAttribute('src'); img.dataset.n = ''; img.dataset.m = ''; });
      if (zAllapot && history.state && history.state.nagyito) { zAllapot = false; zVissza = true; history.back(); }
    } else {
      if (volt <= 1.001) {
        asztal.scrollTop = 0;
        document.body.classList.add('zoomban');
        zoom.hidden = false;
        // Androidon a vissza gomb a nagyítást állítsa vissza, ne az oldalt hagyja el
        try { history.pushState({ nagyito: true }, '', location.hash); zAllapot = true; } catch (e) { zAllapot = false; }
      }
      zoomKepek();
      const r = zLap.getBoundingClientRect();
      zoom.scrollLeft += r.left + rel.rx * r.width - ax;
      zoom.scrollTop += r.top + rel.ry * r.height - ay;
    }
    zoomGombok(!csendes);
  }
  function zoomLepes(d) {                            // + / − gomb: a következő lépcsőfok
    const uj = d > 0 ? (LEPCSOK.find(x => x > f + 0.01) || MAX)
                     : ([...LEPCSOK].reverse().find(x => x < f - 0.01) || 1);
    zoomFok(uj);
  }
  function zoomGombok(jelez) {
    gombKicsinyit.disabled = f <= 1.001;
    gombNagyit.disabled = f >= MAX - 0.001;
    const pct = Math.round(f * 100) + '%';
    gombNagyit.title = gombKicsinyit.title = `Nagyítás: ${pct}`;
    if (jelez && jelzo) {
      jelzo.textContent = pct;
      jelzo.hidden = false;
      jelzo.classList.remove('eltunik');
      clearTimeout(jelzoIdo);
      jelzoIdo = setTimeout(() => jelzo.classList.add('eltunik'), 700);
    }
  }
  function zoomLapoz(irany) {
    if (irany > 0 ? !kovVan() : !elozoVan()) { rezeg(irany); return; }
    p += irany * (ket ? 2 : 1);
    allo(false);
    zoomKepek();
    // az új oldal a bal felső sarkától látszik; a húzás lendülete ne görgesse tovább
    zoom.style.overflow = 'hidden';
    zoom.scrollTop = 0;
    zoom.scrollLeft = 0;
    requestAnimationFrame(() => { zoom.style.overflow = ''; zoom.scrollTop = 0; zoom.scrollLeft = 0; });
    setTimeout(() => { if (!zt && zoomban()) { zoom.scrollTop = 0; zoom.scrollLeft = 0; } }, 160);
    zLap.classList.remove('uj-lap'); void zLap.offsetWidth; zLap.classList.add('uj-lap');
  }
  window.addEventListener('popstate', () => {
    zAllapot = false;
    if (zVissza) { zVissza = false; return; }        // ezt mi kértük a 100%-ra állításkor
    if (zoomban()) zoomFok(1);                       // a böngésző / Android vissza gombja
  });
  gombNagyit.addEventListener('click', () => zoomLepes(1));
  gombKicsinyit.addEventListener('click', () => zoomLepes(-1));

  // dupla koppintás a nagyított oldalon: vissza 100%-ra
  let zUtolso = 0, zHely = null;
  zoom.addEventListener('click', e => {
    const most = performance.now();
    if (most - zUtolso < 320 && zHely && Math.hypot(e.clientX - zHely[0], e.clientY - zHely[1]) < 40) {
      zUtolso = 0; zoomFok(1);
    } else { zUtolso = most; zHely = [e.clientX, e.clientY]; }
  });

  // Nagyítva: ha a lap széléig görgettél, még egy húzás abba az irányba lapoz
  let zt = null;
  zoom.addEventListener('touchstart', e => {
    zt = e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY, sl: zoom.scrollLeft, t: performance.now() } : null;
  }, { passive: true });
  zoom.addEventListener('touchend', e => {
    const h = zt; zt = null;
    if (!h || csip || e.touches.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - h.x, dy = t.clientY - h.y;
    const max = zoom.scrollWidth - zoom.clientWidth;
    const allt = Math.abs(zoom.scrollLeft - h.sl) < 2;          // a görgetés már nem mozdult (szélén volt)
    if (!allt || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5 || performance.now() - h.t > 800) return;
    if (dx < 0 && h.sl >= max - 2) zoomLapoz(1);
    else if (dx > 0 && h.sl <= 2) zoomLapoz(-1);
  });

  // Két ujjas nagyítás (a böngészőé helyett): a lapozó könyvön és nagyítva is
  let csip = null;
  const tav = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
  asztal.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    if (huz) { if (huz.st && fut === huz.st) befejez(huz.st, false, true); huz = null; }
    const [a, b] = e.touches;
    const mx = (a.clientX + b.clientX) / 2, my = (a.clientY + b.clientY) / 2;
    csip = { d0: tav(a, b), f0: f, rel: relativ(mx, my), raf: 0, cel: null };
    zt = null;
  }, { passive: false });
  asztal.addEventListener('touchmove', e => {
    if (!csip || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches;
    csip.cel = [csip.f0 * tav(a, b) / csip.d0, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
    if (!csip.raf) csip.raf = requestAnimationFrame(() => {
      if (!csip) return;
      csip.raf = 0;
      const [u, x, y] = csip.cel;
      zoomFok(u, x, y, csip.rel, true);            // az ujjak alatti pont az ujjak alatt marad
    });
  }, { passive: false });
  const csipVege = e => {
    if (!csip || e.touches.length >= 2) return;
    cancelAnimationFrame(csip.raf);
    csip = null;
    if (f < 1.1) zoomFok(1); else zoomGombok(true);
  };
  asztal.addEventListener('touchend', csipVege);
  asztal.addEventListener('touchcancel', csipVege);
  // iPhone: a Safari saját csippentéses nagyítása ne induljon el
  ['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  // gépen: Ctrl + görgő / érintőpad-csippentés
  asztal.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    zoomFok(f * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY, null, true);
    clearTimeout(jelzoIdo);
    jelzoIdo = setTimeout(() => { if (f < 1.06) zoomFok(1); else zoomGombok(true); }, 250);
  }, { passive: false });
  zoomGombok(false);

  /* ---------- Teljes képernyő (ahol a böngésző engedi; iPhone-on nincs) ---------- */
  const gombTeljes = document.querySelector('.lp-teljes');
  if (gombTeljes && document.fullscreenEnabled) {
    gombTeljes.hidden = false;
    gombTeljes.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => {});
    });
  }

  /* ---------- Vissza gomb: ha az oldalunkról jött, oda vissza ---------- */
  const vissza = document.querySelector('.lp-vissza');
  if (vissza) vissza.addEventListener('click', e => {
    let sajat = false;
    try { sajat = document.referrer && new URL(document.referrer).origin === location.origin; } catch (err) { /* */ }
    if (sajat && history.length > 1 && !zoomban()) { e.preventDefault(); history.back(); }
  });

  /* ---------- Tipp az első megnyitáskor ---------- */
  let tippIdo = 0;
  function rejtTipp() { if (tipp && !tipp.hidden) { tipp.classList.add('eltunik'); setTimeout(() => { tipp.hidden = true; }, 400); clearTimeout(tippIdo); } }
  if (tipp) {
    let latta = 0;
    try { latta = parseInt(localStorage.getItem('lapozo_tipp') || '0', 10) || 0; localStorage.setItem('lapozo_tipp', String(latta + 1)); } catch (e) { /* */ }
    if (latta < 3) {
      const erintos = window.matchMedia('(pointer: coarse)').matches;
      const allo = window.matchMedia('(orientation: portrait)').matches;
      tipp.textContent = erintos
        ? 'Lapozás: húzd el az oldalt, vagy koppints a szélére · Nagyítás: két ujjal vagy a + / − gombbal' +
          (allo ? ' · Elfektetett telefonon nagyobbak a betűk' : '')
        : 'Lapozás: kattints az oldal szélére, vagy használd a ← → billentyűket · Nagyítás: + / − gomb';
      tipp.hidden = false;
      tippIdo = setTimeout(rejtTipp, 6000);
    }
  }

  /* ---------- Indulás ---------- */
  const kezdo = parseInt((location.hash || '').replace('#', ''), 10);
  p = ervenyes(kezdo) ? kezdo : 1;
  meretez();
  // méretváltozás (forgatás, ablak, betűtípus betöltése miatti fejléc-változás)
  let meretIdo = 0, utolsoMeret = asztal.clientWidth + 'x' + asztal.clientHeight;
  const ujraMeretez = () => {
    clearTimeout(meretIdo);
    meretIdo = setTimeout(() => {
      const m = asztal.clientWidth + 'x' + asztal.clientHeight;
      if (m !== utolsoMeret) { utolsoMeret = m; meretez(); }
    }, 60);
  };
  if ('ResizeObserver' in window) new ResizeObserver(ujraMeretez).observe(asztal);
  else window.addEventListener('resize', ujraMeretez);
  konyv.classList.add('kesz');
})();
