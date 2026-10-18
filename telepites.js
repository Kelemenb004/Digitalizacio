/* =====================================================================
   telepites.js – „Telepítés” gomb (alkalmazásként a főképernyőre)
   • Android / asztali Chrome, Edge, Samsung Internet: a rendszer saját telepítő
     ablakát dobja fel (beforeinstallprompt).
   • iPhone / iPad: ilyen lehetőséget az Apple nem ad, ezért rövid útmutatót mutat
     (Megosztás → Főképernyőhöz adás).
   • Ha az oldal már telepített alkalmazásként fut, a gombok nem jelennek meg.
   Gombok: #installSav / #installSavBtn (sáv közvetlenül a fejléc alatt – a fő hely),
   #installMenuBtn (☰ panel).
   A service worker (sw.js) regisztrálása is itt történik – a Chrome telepítő
   ablakához ez feltétel.
   ===================================================================== */
(function () {
  'use strict';

  // --- Service worker (csak az offline-üzenethez és a telepíthetőséghez; nem gyorsítótáraz tartalmat)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* nem baj, ha nem sikerül */ });
    });
  }

  // Megjelenítendő elemek (fejléc-gomb, ☰ menüpont, sáv a fejléc alatt) és a kattintható gombok
  const gombok = ['installMenuBtn', 'installSav']
    .map(id => document.getElementById(id)).filter(Boolean);
  const kattinthato = ['installMenuBtn', 'installSavBtn']
    .map(id => document.getElementById(id)).filter(Boolean);
  if (!gombok.length) return;

  const mm = q => window.matchMedia && window.matchMedia(q).matches;
  const telepitve = () => mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') ||
                          mm('(display-mode: minimal-ui)') || window.navigator.standalone === true;
  if (telepitve()) return;   // már alkalmazásként fut → nincs gomb

  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  const samsung = /SamsungBrowser/.test(ua);
  const alkalmazasBongeszo = /FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\/|; wv\)/.test(ua);
  const macSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua) && !ios;

  let halasztott = null;   // a böngésző telepítő ablaka, amíg fel nem használjuk
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); halasztott = e; });
  window.addEventListener('appinstalled', () => {
    halasztott = null;
    gombok.forEach(g => { g.hidden = true; });
    zar();
  });

  gombok.forEach(g => { g.hidden = false; });
  kattinthato.forEach(g => {
    g.addEventListener('click', () => {
      if (g.id === 'installMenuBtn') document.getElementById('filtersPanelClose')?.click();
      telepit();
    });
  });

  async function telepit() {
    if (halasztott && !alkalmazasBongeszo) {
      const e = halasztott;
      halasztott = null;
      try {
        await e.prompt();
        const valasz = await e.userChoice;
        if (valasz && valasz.outcome === 'accepted') gombok.forEach(g => { g.hidden = true; });
      } catch { utmutato(); }
      return;
    }
    utmutato();
  }

  // --- Útmutató ablak (a tartalom fix, saját szöveg – nincs benne külső adat)
  const IKON_MEGOSZT = '<svg class="tel-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
  const IKON_PLUSZ = '<svg class="tel-ikon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';

  function tartalom() {
    let elotte = '';
    if (alkalmazasBongeszo) {
      elotte = '<p class="tel-figyelem">Úgy tűnik, az oldalt egy másik alkalmazásban (pl. Messenger, Facebook) nyitottad meg. ' +
        'Telepíteni csak a böngészőből lehet: a jobb felső <strong>•••</strong> menüben válaszd a ' +
        '<strong>Megnyitás böngészőben</strong> lehetőséget, és ott nyomd meg újra a Telepítés gombot.</p>';
    }
    if (ios) {
      return elotte + '<ol class="tel-lepesek">' +
        `<li>Koppints a <strong>Megosztás</strong> gombra ${IKON_MEGOSZT}. iPhone-on a Safari alsó sávjában vagy a <strong>•••</strong> gomb mögött találod, iPaden a címsor mellett.</li>` +
        `<li>Görgess lejjebb, és válaszd a <strong>Főképernyőhöz adás</strong> ${IKON_PLUSZ} lehetőséget.</li>` +
        '<li>Koppints a <strong>Hozzáadás</strong> gombra. A Hangarchívum ikonja megjelenik a főképernyőn, és onnan alkalmazásként indul.</li>' +
        '</ol>';
    }
    if (android) {
      return elotte + '<ol class="tel-lepesek">' +
        (samsung
          ? '<li>Nyisd meg a böngésző menüjét: <strong>≡</strong> gomb alul.</li>' +
            '<li>Válaszd az <strong>Oldal hozzáadása</strong>, majd a <strong>Kezdőképernyő</strong> lehetőséget.</li>'
          : '<li>Nyisd meg a böngésző menüjét: <strong>⋮</strong> gomb jobb fent.</li>' +
            '<li>Válaszd az <strong>Alkalmazás telepítése</strong> vagy a <strong>Hozzáadás a kezdőképernyőhöz</strong> lehetőséget.</li>') +
        '<li>Erősítsd meg a <strong>Telepítés</strong> / <strong>Hozzáadás</strong> gombbal. Az ikon megjelenik a kezdőképernyőn.</li>' +
        '</ol>';
    }
    if (macSafari) {
      return elotte + '<ol class="tel-lepesek"><li>A Safari menüsorában válaszd: <strong>Fájl → Hozzáadás a Dockhoz</strong>.</li>' +
        '<li>Kattints a <strong>Hozzáadás</strong> gombra. A Hangarchívum a Dockból alkalmazásként indul.</li></ol>';
    }
    return elotte + '<ol class="tel-lepesek">' +
      '<li><strong>Chrome</strong> vagy <strong>Edge</strong>: kattints a címsor jobb szélén megjelenő telepítés ikonra, vagy a böngésző menüjében (<strong>⋮</strong> / <strong>…</strong>) keresd az <strong>Oldal telepítése alkalmazásként</strong> pontot.</li>' +
      '<li>Erősítsd meg a <strong>Telepítés</strong> gombbal. A Hangarchívum saját ablakban, alkalmazásként indul.</li>' +
      '</ol><p class="tel-megj">Firefoxban ez a lehetőség asztali gépen nem érhető el – használj Chrome-ot vagy Edge-et.</p>';
  }

  let dlg = null;
  function utmutato() {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'tel-dialog';
      dlg.setAttribute('aria-labelledby', 'telCim');
      dlg.addEventListener('click', e => { if (e.target === dlg) zar(); });   // kattintás a háttérre
      document.body.appendChild(dlg);
    }
    dlg.innerHTML =
      '<div class="tel-doboz">' +
      '<button type="button" class="tel-zar" aria-label="Bezárás">✕</button>' +
      '<img class="tel-logo" src="/icon-192.png" alt="" width="56" height="56">' +
      '<h2 class="tel-cim" id="telCim">Alkalmazás telepítése</h2>' +
      '<p class="tel-bev">Így a Hangarchívum egy koppintással, alkalmazásként indul a ' + (ios || android ? 'telefonodról' : 'számítógépedről') + '.</p>' +
      tartalom() +
      '<button type="button" class="tel-ok">Rendben</button>' +
      '</div>';
    dlg.querySelector('.tel-zar').addEventListener('click', zar);
    dlg.querySelector('.tel-ok').addEventListener('click', zar);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function zar() {
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
  }
})();
