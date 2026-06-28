/* ============================================================
   DIGITÁLIS HANGARCHÍVUM – app.js  (v2 – valódi lectures.json)
   Mezők: path, eloado, datum, ido, lectio, textus, megjegyzes,
          cim, kategoria, evkor, hossz_sec, tipus
   ============================================================ */

'use strict';

/* ---------- Állapot ---------- */
const state = {
  lectures:          [],       // összes felvétel (shuffle-kulccsal kiegészítve)
  filtered:          [],       // szűrt + rendezett lista
  page:              0,        // "load more" oldalszám
  current:           null,     // éppen lejátszott felvétel (path alapján azonosítjuk)
  isPlaying:         false,
  volume:            CONFIG.DEFAULT_VOLUME,
  showFavOnly:       false,
  favorites:         new Set(),
  seasonalHasContent: false,
};

/* ---------- DOM-referenciák ---------- */
let dom = {};

function cacheDOM() {
  const g = id => document.getElementById(id);
  dom = {
    searchInput:     g('searchInput'),
    searchBtn:       g('searchBtn'),
    categoryFilter:  g('categoryFilter'),
    speakerFilter:   g('speakerFilter'),
    igehelyFilter:   g('igehelyFilter'),
    sortSelect:      g('sortSelect'),
    favToggle:       g('favToggle'),
    filterReset:     g('filterReset'),
    resultsCount:    g('resultsCount'),
    statTotal:       g('statTotal'),
    statHours:       g('statHours'),
    statSpeakers:    g('statSpeakers'),
    statCategories:  g('statCategories'),
    grid:            g('lectureGrid'),
    loadMoreBtn:     g('loadMoreBtn'),
    emptyState:      g('emptyState'),
    loadingState:    g('loadingState'),
    errorState:      g('errorState'),
    errorMsg:        g('errorMsg'),
    seasonalSection: g('seasonalSection'),
    seasonalTitle:   g('seasonalTitle'),
    seasonalGrid:    g('seasonalGrid'),
    randomBtn:       g('randomBtn'),
    bgImage:         g('bgImage'),
    bgOverlay:       g('bgOverlay'),
    player:          g('audioPlayer'),
    audio:           g('audioElement'),
    playerTitle:     g('playerTitle'),
    playerSpeaker:   g('playerSpeaker'),
    playBtn:         g('playBtn'),
    skipBack:        g('skipBack'),
    skipFwd:         g('skipFwd'),
    speedSelect:     g('speedSelect'),
    progressBar:     g('progressBar'),
    timeCurrent:     g('timeCurrent'),
    timeTotal:       g('timeTotal'),
    volumeSlider:    g('volumeSlider'),
    playerShare:     g('playerShare'),
    playerClose:     g('playerClose'),
    playerError:     g('playerError'),
    themeToggle:     g('themeToggle'),
    themeColor:      document.querySelector('meta[name="theme-color"]'),
  };
}

/* ---------- Inicializálás ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initTheme();
  loadFavorites();
  restoreVolume();
  restoreSpeed();
  setupEventListeners();
  initBackground();
  loadLectures();
});

/* ---------- Adatbetöltés ---------- */
async function loadLectures() {
  try {
    const res = await fetch('lectures.json');
    if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
    const raw = await res.json();

    state.lectures = raw.map(l => ({ ...l, _rand: Math.random() }));

    populateFilters();
    updateStats();
    applyFilters();
    renderSeasonalRecommendations();
    handleUrlHash();

    dom.loadingState.classList.add('hidden');
  } catch (err) {
    dom.loadingState.classList.add('hidden');
    dom.errorState.classList.remove('hidden');
    dom.errorMsg.textContent = `Nem sikerült betölteni az archívumot: ${err.message}`;
  }
}

/* ---------- Háttérkép – "függöny mögötti" hatás ---------- */
function initBackground() {
  const cfg = CONFIG.BACKGROUND;
  if (!cfg || !cfg.enabled || !cfg.images || !cfg.images.length) return;

  const src = cfg.mode === 'random'
    ? cfg.images[Math.floor(Math.random() * cfg.images.length)]
    : cfg.images[0];

  if (!dom.bgImage) return;

  const testImg = new Image();
  testImg.onload = () => {
    dom.bgImage.style.backgroundImage = `url('${src}')`;
    if (cfg.blur) dom.bgImage.style.filter = `blur(${cfg.blur}) sepia(0.08)`;
    dom.bgImage.style.display = 'block';
  };
  testImg.onerror = () => {}; // nincs kép → a bézs alap marad
  testImg.src = src;
}

/* ---------- Témaváltó ---------- */
function initTheme() {
  const saved = localStorage.getItem('hangarchivum_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved === 'dark' || (!saved && prefersDark), false);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('hangarchivum_theme')) applyTheme(e.matches, false);
  });
}

function applyTheme(dark, save = true) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  if (dom.themeToggle) dom.themeToggle.setAttribute('aria-label', dark ? 'Világos mód' : 'Sötét mód');
  if (dom.themeColor)  dom.themeColor.content = dark ? '#0E1A2E' : '#1B2E5C';
  if (save) localStorage.setItem('hangarchivum_theme', dark ? 'dark' : 'light');
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme !== 'dark');
}

/* ---------- Kedvencek ---------- */
function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem('hangarchivum_favorites') || '[]');
    state.favorites = new Set(Array.isArray(saved) ? saved : []);
  } catch { state.favorites = new Set(); }
}

function saveFavorites() {
  localStorage.setItem('hangarchivum_favorites', JSON.stringify([...state.favorites]));
}

function toggleFavorite(path) {
  if (state.favorites.has(path)) {
    state.favorites.delete(path);
  } else {
    state.favorites.add(path);
  }
  saveFavorites();

  // Frissítjük az összes kártyát ahol ez a felvétel szerepel
  document.querySelectorAll(`.lecture-card`).forEach(card => {
    if (card.dataset.path !== path) return;
    const btn = card.querySelector('.card-star-btn');
    if (!btn) return;
    const isFav = state.favorites.has(path);
    btn.classList.toggle('is-favorite', isFav);
    btn.setAttribute('aria-label', isFav ? 'Kedvencből eltávolítás' : 'Kedvencekhez adás');
    btn.textContent = isFav ? '★' : '☆';
  });

  // Ha kedvenc-nézetben vagyunk, az eltávolítás után szűrünk
  if (state.showFavOnly) applyFilters();
}

/* ---------- Szűrők feltöltése ---------- */
function populateFilters() {
  const kategoriák = [...new Set(state.lectures.map(l => l.kategoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'hu'));
  const előadók    = [...new Set(state.lectures.map(l => l.eloado).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'hu'));

  appendOptions(dom.categoryFilter, kategoriák);
  appendOptions(dom.speakerFilter, előadók);
}

function appendOptions(select, values) {
  if (!select) return;
  values.forEach(val => {
    if (!val) return;
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = val;
    select.appendChild(opt);
  });
}

/* ---------- Statisztika ---------- */
function updateStats() {
  const totalSec   = state.lectures.reduce((s, l) => s + (l.hossz_sec || 0), 0);
  const totalHours = Math.round(totalSec / 3600);
  const speakers   = new Set(state.lectures.map(l => l.eloado).filter(Boolean)).size;
  const categories = new Set(state.lectures.map(l => l.kategoria).filter(Boolean)).size;

  if (dom.statTotal)      dom.statTotal.textContent      = state.lectures.length.toLocaleString('hu-HU');
  if (dom.statHours)      dom.statHours.textContent      = totalHours.toLocaleString('hu-HU');
  if (dom.statSpeakers)   dom.statSpeakers.textContent   = speakers;
  if (dom.statCategories) dom.statCategories.textContent = categories;
}

/* ---------- Szűrés és rendezés ---------- */
function applyFilters() {
  const q       = normalizeStr(dom.searchInput?.value || '');
  const igehely = normalizeStr(dom.igehelyFilter?.value || '');
  const cat     = dom.categoryFilter?.value || '';
  const speaker = dom.speakerFilter?.value || '';
  const sortMode = dom.sortSelect?.value || 'random';

  state.page = 0;

  state.filtered = state.lectures.filter(l => {
    if (state.showFavOnly && !state.favorites.has(l.path)) return false;
    if (cat     && l.kategoria !== cat)  return false;
    if (speaker && l.eloado !== speaker) return false;

    if (igehely) {
      const hay = normalizeStr((l.lectio || '') + ' ' + (l.textus || ''));
      if (!hay.includes(igehely)) return false;
    }

    if (q) {
      const hay = normalizeStr([l.cim, l.eloado, l.lectio, l.textus, l.megjegyzes].join(' '));
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  state.filtered = sortLectures(state.filtered, sortMode);
  renderLectures(state.filtered);
  updateSeasonalVisibility();
}

function isDefaultMode() {
  return (
    !(dom.searchInput?.value?.trim()) &&
    !(dom.igehelyFilter?.value?.trim()) &&
    !dom.categoryFilter?.value &&
    !dom.speakerFilter?.value &&
    !state.showFavOnly
  );
}

function updateSeasonalVisibility() {
  if (!dom.seasonalSection) return;
  if (state.seasonalHasContent && isDefaultMode()) {
    dom.seasonalSection.classList.remove('hidden');
  } else {
    dom.seasonalSection.classList.add('hidden');
  }
}

function sortLectures(arr, mode) {
  const copy = [...arr];
  switch (mode) {
    case 'date-desc': return copy.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
    case 'date-asc':  return copy.sort((a, b) => (a.datum || '').localeCompare(b.datum || ''));
    case 'speaker':   return copy.sort((a, b) => (a.eloado || '').localeCompare(b.eloado || '', 'hu'));
    case 'duration':  return copy.sort((a, b) => (b.hossz_sec || 0) - (a.hossz_sec || 0));
    default:          return copy.sort((a, b) => (a._rand || 0) - (b._rand || 0));
  }
}

function resetFilters() {
  if (dom.searchInput)    dom.searchInput.value    = '';
  if (dom.igehelyFilter)  dom.igehelyFilter.value  = '';
  if (dom.categoryFilter) dom.categoryFilter.value = '';
  if (dom.speakerFilter)  dom.speakerFilter.value   = '';

  state.showFavOnly = false;
  if (dom.favToggle) {
    dom.favToggle.classList.remove('is-active');
    dom.favToggle.setAttribute('aria-pressed', 'false');
    setFavToggleIcon('☆');
  }

  applyFilters();
}

/* ---------- Kártyák renderelése (első oldal) ---------- */
function renderLectures(lectures) {
  dom.grid.innerHTML = '';
  dom.resultsCount.textContent = lectures.length;

  if (lectures.length === 0) {
    dom.emptyState.classList.remove('hidden');
    if (dom.loadMoreBtn) dom.loadMoreBtn.classList.add('hidden');
    return;
  }
  dom.emptyState.classList.add('hidden');

  const slice = lectures.slice(0, CONFIG.PAGE_SIZE);
  const frag = document.createDocumentFragment();
  slice.forEach(l => frag.appendChild(createCard(l)));
  dom.grid.appendChild(frag);

  updateLoadMoreBtn(lectures.length, slice.length);
}

function updateLoadMoreBtn(total, shown) {
  if (!dom.loadMoreBtn) return;
  const remaining = total - shown;
  if (remaining <= 0) {
    dom.loadMoreBtn.classList.add('hidden');
  } else {
    dom.loadMoreBtn.classList.remove('hidden');
    const nextBatch = Math.min(CONFIG.PAGE_SIZE, remaining);
    dom.loadMoreBtn.textContent = `Tovább – még ${nextBatch} felvétel (${remaining} maradt)`;
  }
}

function loadMoreLectures() {
  state.page++;
  const start = state.page * CONFIG.PAGE_SIZE;
  const slice = state.filtered.slice(start, start + CONFIG.PAGE_SIZE);

  const frag = document.createDocumentFragment();
  slice.forEach(l => frag.appendChild(createCard(l)));
  dom.grid.appendChild(frag);

  const totalShown = start + slice.length;
  updateLoadMoreBtn(state.filtered.length, totalShown);
}

/* ---------- Szezonális ajánlás ---------- */
const HONAPOK = [
  'januári','februári','márciusi','áprilisi','májusi','júniusi',
  'júliusi','augusztusi','szeptemberi','októberi','novemberi','decemberi',
];

function renderSeasonalRecommendations() {
  if (!dom.seasonalSection || !dom.seasonalGrid || !dom.seasonalTitle) return;

  const month = new Date().getMonth(); // 0-alapú

  const matching = state.lectures.filter(l => {
    if (!l.datum) return false;
    const d = new Date(l.datum);
    return !isNaN(d.getTime()) && d.getMonth() === month;
  });

  if (matching.length === 0) {
    state.seasonalHasContent = false;
    dom.seasonalSection.classList.add('hidden');
    return;
  }

  // 3–5 véletlenszerű felvétel
  const count = Math.min(matching.length, 3 + Math.floor(Math.random() * 3));
  const shuffled = [...matching].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, count);

  const honapNev = HONAPOK[month];
  dom.seasonalTitle.textContent = `${honapNev.charAt(0).toUpperCase() + honapNev.slice(1)} igehirdetések az archívumból`;

  dom.seasonalGrid.innerHTML = '';
  const frag = document.createDocumentFragment();
  picks.forEach(l => frag.appendChild(createCard(l)));
  dom.seasonalGrid.appendChild(frag);

  state.seasonalHasContent = true;
  dom.seasonalSection.classList.remove('hidden');
}

/* ---------- Kártyakészítés ---------- */
function createCard(lecture) {
  const isActive  = state.current?.path === lecture.path;
  const isPlaying = isActive && state.isPlaying;
  const isFav     = state.favorites.has(lecture.path);
  const isSpecial = lecture.tipus === 'kulonleges';

  const article = document.createElement('article');
  article.className = `lecture-card${isActive ? ' is-active' : ''}${isSpecial ? ' is-special' : ''}`;
  article.dataset.path = lecture.path;
  article.setAttribute('role', 'listitem');

  const duration    = formatTime(lecture.hossz_sec);
  const dateParts   = [];
  if (lecture.datum) dateParts.push(formatDate(lecture.datum));
  if (lecture.ido)   dateParts.push(lecture.ido);
  const dateStr     = dateParts.join(' ');

  const url    = audioUrl(lecture.path);
  const dlName = downloadFilename(lecture);

  const lectioHtml     = lecture.lectio
    ? `<p class="card-igehely"><span class="igehely-label">Lectió:</span> ${escHtml(lecture.lectio)}</p>` : '';
  const textusHtml     = lecture.textus
    ? `<p class="card-igehely"><span class="igehely-label">Textus:</span> ${escHtml(lecture.textus)}</p>` : '';
  const megjegyzesHtml = lecture.megjegyzes
    ? `<p class="card-megjegyzes">📌 ${escHtml(lecture.megjegyzes)}</p>` : '';
  const specialBadge   = isSpecial
    ? `<span class="card-badge-special">Különleges</span>` : '';

  article.innerHTML = `
    <div class="card-header">
      <span class="card-category ${kategoriaCls(lecture.kategoria)}">${escHtml(lecture.kategoria || '—')}</span>
      ${specialBadge}
      <span class="card-duration">${escHtml(duration)}</span>
    </div>
    <h2 class="card-title">${escHtml(lecture.cim || lecture.eloado || '—')}</h2>
    <p class="card-speaker">${escHtml(lecture.eloado || 'Ismeretlen előadó')}</p>
    ${lectioHtml}${textusHtml}${megjegyzesHtml}
    <div class="card-footer">
      <div class="card-meta">
        ${dateStr ? `<span class="card-date">${escHtml(dateStr)}</span>` : ''}
        ${lecture.evkor ? `<span class="card-evkor">${escHtml(lecture.evkor)}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="card-star-btn${isFav ? ' is-favorite' : ''}"
                aria-label="${isFav ? 'Kedvencből eltávolítás' : 'Kedvencekhez adás'}"
                title="${isFav ? 'Kedvencből eltávolítás' : 'Kedvencekhez adás'}">${isFav ? '★' : '☆'}</button>
        <button class="card-play-btn${isPlaying ? ' playing' : ''}"
                aria-label="${isPlaying ? 'Szünet' : 'Lejátszás'}: ${escHtml(lecture.cim || '')}">
          <span class="play-icon">${playIcon(isPlaying)}</span>
          <span>${isPlaying ? 'Szünet' : 'Lejátszás'}</span>
        </button>
        <button class="card-download-btn"
                title="Letöltés: ${escHtml(lecture.cim || '')}"
                aria-label="Letöltés: ${escHtml(lecture.cim || '')}">⬇ Letöltés</button>
        <button class="card-share-btn"
                title="Megosztás: ${escHtml(lecture.cim || '')}"
                aria-label="Megosztás: ${escHtml(lecture.cim || '')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Megosztás
        </button>
      </div>
    </div>
  `;

  article.querySelector('.card-play-btn').addEventListener('click', () => toggleLecture(lecture));
  article.querySelector('.card-star-btn').addEventListener('click', () => toggleFavorite(lecture.path));
  const dlBtn = article.querySelector('.card-download-btn');
  dlBtn.addEventListener('click', () => downloadLecture(lecture, dlBtn));
  const shareBtn = article.querySelector('.card-share-btn');
  shareBtn.addEventListener('click', () => shareLecture(lecture, shareBtn));
  return article;
}

/* ---------- Audio URL és letöltési fájlnév ---------- */
function audioUrl(path) {
  // A / jeleket megtartjuk, a szegmenseket külön kódoljuk
  return CONFIG.R2_BASE_URL + '/' + path.split('/').map(encodeURIComponent).join('/');
}

function downloadFilename(lecture) {
  const slug = s => (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 35);
  const parts = [slug(lecture.eloado), lecture.datum || '', slug(lecture.cim)].filter(Boolean);
  return parts.join('_') + '.mp3';
}

/* ---------- Lejátszóvezérlés ---------- */
function toggleLecture(lecture) {
  if (state.current?.path === lecture.path) {
    togglePlayPause();
    return;
  }
  startPlaying(lecture);
}

function startPlaying(lecture) {
  state.current = lecture;
  clearPlayerError();

  dom.audio.src = audioUrl(lecture.path);
  dom.audio.volume = state.volume;
  if (dom.speedSelect) dom.audio.playbackRate = parseFloat(dom.speedSelect.value);

  const titleText   = lecture.cim || lecture.eloado || '—';
  const igehelyek   = [lecture.lectio, lecture.textus].filter(Boolean).join(' · ');
  const speakerText = [lecture.eloado, igehelyek].filter(Boolean).join(' – ');

  dom.playerTitle.textContent   = titleText;
  dom.playerSpeaker.textContent = speakerText || '—';
  dom.player.classList.remove('hidden');

  dom.audio.play().catch(err => {
    console.warn('Lejátszási hiba:', err.message);
    showPlayerError('A felvétel nem érhető el. Ellenőrizd az R2 URL-t a config.js-ben.');
  });

  history.replaceState(null, '', '#felvetel=' + encodeURIComponent(lecture.path));
  updateCardStates();
}

function togglePlayPause() {
  if (!state.current) return;
  if (state.isPlaying) {
    dom.audio.pause();
  } else {
    dom.audio.play().catch(() => {});
  }
}

function stopPlayer() {
  dom.audio.pause();
  dom.audio.src = '';
  state.current  = null;
  state.isPlaying = false;
  dom.player.classList.add('hidden');
  dom.progressBar.value = 0;
  updateProgressBarStyle(0);
  dom.timeCurrent.textContent  = '0:00';
  dom.timeTotal.textContent    = '0:00';
  history.replaceState(null, '', location.pathname + location.search);
  updateCardStates();
}

function updateCardStates() {
  document.querySelectorAll('.lecture-card').forEach(card => {
    const path      = card.dataset.path;
    const isActive  = state.current?.path === path;
    const isPlaying = isActive && state.isPlaying;

    card.classList.toggle('is-active', isActive);

    const btn = card.querySelector('.card-play-btn');
    if (btn) {
      btn.classList.toggle('playing', isPlaying);
      btn.setAttribute('aria-label',
        `${isPlaying ? 'Szünet' : 'Lejátszás'}: ${escHtml(state.current?.cim ?? '')}`);
      btn.querySelector('.play-icon').innerHTML = playIcon(isPlaying);
      btn.querySelector('span:last-child').textContent = isPlaying ? 'Szünet' : 'Lejátszás';
    }
  });

  dom.playBtn.innerHTML = state.isPlaying ? pauseIcon() : playIconLarge();
  dom.playBtn.setAttribute('aria-label', state.isPlaying ? 'Szünet' : 'Lejátszás');
}

/* ---------- Véletlen igehirdetés ---------- */
function playRandomLecture() {
  const pool = state.filtered.length > 0 ? state.filtered : state.lectures;
  if (!pool.length) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  startPlaying(pick);

  // Görgessünk a kártyához, ha látható
  const card = findCard(pick.path);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function findCard(path) {
  return [...document.querySelectorAll('.lecture-card')].find(c => c.dataset.path === path) || null;
}

/* ---------- Audio esemény-figyelők ---------- */
function setupAudioListeners() {
  dom.audio.addEventListener('play', () => {
    state.isPlaying = true;
    updateCardStates();
    clearPlayerError();
  });

  dom.audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updateCardStates();
  });

  dom.audio.addEventListener('ended', () => {
    state.isPlaying = false;
    dom.progressBar.value = 100;
    updateProgressBarStyle(100);
    updateCardStates();
  });

  dom.audio.addEventListener('timeupdate', () => {
    if (!dom.audio.duration) return;
    const pct = (dom.audio.currentTime / dom.audio.duration) * 100;
    dom.progressBar.value = pct;
    updateProgressBarStyle(pct);
    dom.timeCurrent.textContent = formatTime(dom.audio.currentTime);
  });

  dom.audio.addEventListener('loadedmetadata', () => {
    dom.timeTotal.textContent = formatTime(dom.audio.duration);
  });

  dom.audio.addEventListener('error', () => {
    if (dom.audio.src && dom.audio.src !== window.location.href) {
      showPlayerError('A hangfájl nem tölthető be. Ellenőrizd az R2 URL-t a config.js-ben.');
    }
  });
}

/* ---------- Esemény-figyelők ---------- */
function setupEventListeners() {
  setupAudioListeners();

  dom.playBtn.addEventListener('click', togglePlayPause);

  dom.skipBack.addEventListener('click', () => {
    dom.audio.currentTime = Math.max(0, dom.audio.currentTime - CONFIG.SKIP_SECONDS);
  });
  dom.skipFwd.addEventListener('click', () => {
    if (dom.audio.duration)
      dom.audio.currentTime = Math.min(dom.audio.duration, dom.audio.currentTime + CONFIG.SKIP_SECONDS);
  });

  dom.playerClose.addEventListener('click', stopPlayer);

  if (dom.playerShare) {
    dom.playerShare.addEventListener('click', () => {
      if (state.current) shareLecture(state.current, dom.playerShare);
    });
  }

  dom.progressBar.addEventListener('input', () => {
    if (!dom.audio.duration) return;
    const pct = parseFloat(dom.progressBar.value);
    dom.audio.currentTime = (pct / 100) * dom.audio.duration;
    dom.timeCurrent.textContent = formatTime(dom.audio.currentTime);
    updateProgressBarStyle(pct);
  });

  dom.volumeSlider.addEventListener('input', () => {
    state.volume = parseFloat(dom.volumeSlider.value);
    dom.audio.volume = state.volume;
    localStorage.setItem('hangarchivum_volume', state.volume);
  });
  dom.volumeSlider.addEventListener('click', e => e.stopPropagation());

  if (dom.speedSelect) {
    dom.speedSelect.addEventListener('change', () => {
      dom.audio.playbackRate = parseFloat(dom.speedSelect.value);
      localStorage.setItem('hangarchivum_speed', dom.speedSelect.value);
    });
  }

  if (dom.themeToggle) dom.themeToggle.addEventListener('click', toggleTheme);

  if (dom.randomBtn) dom.randomBtn.addEventListener('click', playRandomLecture);

  dom.searchInput.addEventListener('input', debounce(applyFilters, 250));
  dom.searchBtn.addEventListener('click', applyFilters);
  dom.searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });

  if (dom.igehelyFilter) {
    dom.igehelyFilter.addEventListener('input', debounce(applyFilters, 250));
    dom.igehelyFilter.addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
  }

  dom.categoryFilter.addEventListener('change', applyFilters);
  dom.speakerFilter.addEventListener('change', applyFilters);
  if (dom.sortSelect) dom.sortSelect.addEventListener('change', applyFilters);

  if (dom.favToggle) {
    dom.favToggle.addEventListener('click', () => {
      state.showFavOnly = !state.showFavOnly;
      dom.favToggle.classList.toggle('is-active', state.showFavOnly);
      dom.favToggle.setAttribute('aria-pressed', String(state.showFavOnly));
      setFavToggleIcon(state.showFavOnly ? '★' : '☆');
      applyFilters();
    });
  }

  dom.filterReset.addEventListener('click', resetFilters);

  if (dom.loadMoreBtn) dom.loadMoreBtn.addEventListener('click', loadMoreLectures);

  document.addEventListener('keydown', handleKeyboard);
}

/* ---------- Billentyűzet ---------- */
function handleKeyboard(e) {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (!state.current) return;

  switch (e.key) {
    case ' ':         e.preventDefault(); togglePlayPause(); break;
    case 'ArrowLeft': e.preventDefault();
      dom.audio.currentTime = Math.max(0, dom.audio.currentTime - CONFIG.SKIP_SECONDS); break;
    case 'ArrowRight': e.preventDefault();
      if (dom.audio.duration)
        dom.audio.currentTime = Math.min(dom.audio.duration, dom.audio.currentTime + CONFIG.SKIP_SECONDS);
      break;
    case 'Escape':    stopPlayer(); break;
  }
}

/* ---------- Hangerő és sebesség visszaállítás ---------- */
function restoreVolume() {
  const saved = parseFloat(localStorage.getItem('hangarchivum_volume'));
  if (!isNaN(saved) && saved >= 0 && saved <= 1) state.volume = saved;
  if (dom.volumeSlider) dom.volumeSlider.value = state.volume;
}

function restoreSpeed() {
  const saved = localStorage.getItem('hangarchivum_speed');
  if (saved && dom.speedSelect) {
    dom.speedSelect.value = saved;
    // A tényleges playbackRate-t startPlaying() állítja be
  }
}

/* ---------- Hibaüzenet a lejátszóban ---------- */
function showPlayerError(msg) {
  if (dom.playerError) {
    dom.playerError.textContent = msg;
    dom.playerError.classList.remove('hidden');
  }
}

function clearPlayerError() {
  if (dom.playerError) dom.playerError.classList.add('hidden');
}

/* ---------- Segédfüggvények ---------- */
function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const h  = Math.floor(secs / 3600);
  const m  = Math.floor((secs % 3600) / 60);
  const s  = Math.floor(secs % 60);
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function kategoriaCls(kat) {
  const k = (kat || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (k.includes('istentisztelet'))  return 'kat-istentisztelet';
  if (k.includes('evangelizac'))     return 'kat-evangelizacio';
  if (k.includes('kulonleges'))      return 'kat-kulonleges';
  if (k.includes('konfirmac'))       return 'kat-konfirmacio';
  if (k.includes('bibliakori') || k.includes('bibliakor')) return 'kat-bibliakor';
  if (k.includes('imaheti') || k.includes('ima het')) return 'kat-imaheti';
  return 'kat-alap';
}

function normalizeStr(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function setFavToggleIcon(star) {
  if (!dom.favToggle) return;
  const starEl = dom.favToggle.querySelector('.fav-star');
  if (starEl) starEl.textContent = star;
}

function handleUrlHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#felvetel=')) return;
  try {
    const path = decodeURIComponent(hash.slice('#felvetel='.length));
    const lecture = state.lectures.find(l => l.path === path);
    if (!lecture) return;
    startPlaying(lecture);
    const card = findCard(lecture.path);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {}
}

async function shareLecture(lecture, btn) {
  const shareUrl = location.origin + location.pathname + '#felvetel=' + encodeURIComponent(lecture.path);
  const title = lecture.cim || 'Igehirdetés';
  const text = [lecture.eloado, lecture.datum].filter(Boolean).join(' – ');

  if (navigator.share) {
    try {
      await navigator.share({ title, text: text + '\n' + title, url: shareUrl });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  const origHtml = btn ? btn.innerHTML : null;
  try {
    await navigator.clipboard.writeText(shareUrl);
    if (btn) {
      btn.innerHTML = '✓ Másolva!';
      setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
    }
  } catch {
    prompt('Másold ki a linket:', shareUrl);
  }
}

function updateProgressBarStyle(pct) {
  if (!dom.progressBar) return;
  dom.progressBar.style.background =
    `linear-gradient(to right, var(--gold) 0%, var(--gold) ${pct}%, rgba(255,255,255,0.18) ${pct}%, rgba(255,255,255,0.18) 100%)`;
}

async function downloadLecture(lecture, btn) {
  const url = audioUrl(lecture.path);
  const filename = downloadFilename(lecture);
  const originalHtml = btn ? btn.innerHTML : '';

  if (btn) { btn.innerHTML = '⏳ Letöltés…'; btn.disabled = true; }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
  } catch (err) {
    console.error('Letöltési hiba:', err);
    if (btn) btn.innerHTML = '❌ Hiba';
    setTimeout(() => { if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; } }, 2500);
  }
}

function playIcon(playing) {
  return playing
    ? `<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/></svg>`
    : `<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><polygon points="3,1 14,8 3,15"/></svg>`;
}

function playIconLarge() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5,2 21,12 5,22"/></svg>`;
}

function pauseIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><rect x="4" y="2" width="6" height="20" rx="2"/><rect x="14" y="2" width="6" height="20" rx="2"/></svg>`;
}
