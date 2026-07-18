
/* Igehirdető-oldalak lejátszója – a főoldal app.js kompatibilis kivonata */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const FAV_KEY = 'hangarchivum_favorites';
  const THEME_KEY = 'hangarchivum_theme';
  const VOL_KEY = 'hangarchivum_volume';
  const SKIP = (window.CONFIG && CONFIG.SKIP_SECONDS) || 10;

  const dom = {
    audio: $('audioElement'), player: $('audioPlayer'),
    title: $('playerTitle'), speaker: $('playerSpeaker'),
    playBtn: $('playBtn'), skipBack: $('skipBack'), skipFwd: $('skipFwd'),
    progress: $('progressBar'), tCur: $('timeCurrent'), tTot: $('timeTotal'),
    speed: $('speedSelect'), close: $('playerClose'), err: $('playerError'),
  };

  let current = null, isPlaying = false;
  let volume = parseFloat(localStorage.getItem(VOL_KEY));
  if (isNaN(volume)) volume = (window.CONFIG && CONFIG.DEFAULT_VOLUME) || 0.85;

  function loadFavs() {
    try { const a = JSON.parse(localStorage.getItem(FAV_KEY)); return new Set(Array.isArray(a) ? a : []); }
    catch { return new Set(); }
  }
  let favorites = loadFavs();
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch {} }

  function audioUrl(path) {
    return CONFIG.R2_BASE_URL + '/' + path.split('/').map(encodeURIComponent).join('/');
  }
  function fmt(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = Math.floor(secs%60);
    const mm = String(m).padStart(h?2:1,'0'), ss = String(s).padStart(2,'0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }
  function showErr(m){ if(dom.err){dom.err.textContent=m;dom.err.classList.remove('hidden');} }
  function clearErr(){ if(dom.err) dom.err.classList.add('hidden'); }
  function progStyle(pct){
    if(dom.progress) dom.progress.style.background =
      `linear-gradient(to right, var(--gold) 0%, var(--gold) ${pct}%, var(--border-light) ${pct}%, var(--border-light) 100%)`;
  }

  function playCard(card) {
    const path = card.dataset.path;
    if (current === path) { togglePlay(); return; }
    current = path;
    clearErr();
    dom.audio.src = audioUrl(path);
    dom.audio.volume = volume;
    if (dom.speed) dom.audio.playbackRate = parseFloat(dom.speed.value);
    const title = card.dataset.title || '—';
    const ige = [card.dataset.lectio, card.dataset.textus].filter(Boolean).join(' · ');
    const spk = [card.dataset.speaker, ige].filter(Boolean).join(' – ');
    dom.title.textContent = title;
    dom.speaker.textContent = spk || '—';
    dom.player.classList.remove('hidden');
    dom.audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      showErr('A felvétel most nem indítható el. Próbáld meg újra.');
    });
    updateCards();
  }
  function togglePlay() {
    if (!current) return;
    if (isPlaying) dom.audio.pause();
    else dom.audio.play().catch(()=>{});
  }
  function updateCards() {
    document.querySelectorAll('.lecture-card').forEach(card => {
      const active = card.dataset.path === current;
      card.classList.toggle('is-active', active);
      const btn = card.querySelector('.card-play-btn');
      if (btn) {
        const playing = active && isPlaying;
        btn.classList.toggle('playing', playing);
        btn.querySelector('span:last-child').textContent = playing ? 'Szünet' : 'Lejátszás';
      }
    });
  }

  // Kártya-események
  document.querySelectorAll('.lecture-card').forEach(card => {
    card.querySelector('.card-play-btn')?.addEventListener('click', () => playCard(card));
    const star = card.querySelector('.card-star-btn');
    if (star) {
      const path = card.dataset.path;
      const sync = () => {
        const fav = favorites.has(path);
        star.textContent = fav ? '★' : '☆';
        star.classList.toggle('is-favorite', fav);
        star.setAttribute('aria-label', fav ? 'Kedvencből eltávolítás' : 'Kedvencekhez adás');
      };
      sync();
      star.addEventListener('click', () => {
        if (favorites.has(path)) favorites.delete(path); else favorites.add(path);
        saveFavs(); sync();
      });
    }
    const share = card.querySelector('.card-share-btn');
    if (share) share.addEventListener('click', async () => {
      const url = 'https://kelenref100.hu/#felvetel=' + encodeURIComponent(card.dataset.path);
      const title = card.dataset.title || 'Igehirdetés';
      const text = [card.dataset.speaker, card.dataset.datum].filter(Boolean).join(' – ');
      if (navigator.share) { try { await navigator.share({title, text: text+'\n'+title, url}); } catch {} }
      else { try { await navigator.clipboard.writeText(url); share.classList.add('copied'); setTimeout(()=>share.classList.remove('copied'),1500); } catch {} }
    });
  });

  // Lejátszó-vezérlők
  dom.playBtn?.addEventListener('click', togglePlay);
  dom.skipBack?.addEventListener('click', () => { if(current) dom.audio.currentTime = Math.max(0, dom.audio.currentTime - SKIP); });
  dom.skipFwd?.addEventListener('click', () => { if(current) dom.audio.currentTime = Math.min(dom.audio.duration||0, dom.audio.currentTime + SKIP); });
  dom.close?.addEventListener('click', () => {
    dom.audio.pause(); dom.audio.src=''; current=null; isPlaying=false;
    dom.player.classList.add('hidden'); updateCards();
  });
  dom.speed?.addEventListener('change', () => { dom.audio.playbackRate = parseFloat(dom.speed.value); });
  dom.progress?.addEventListener('input', () => {
    if (dom.audio.duration) dom.audio.currentTime = (dom.progress.value/100)*dom.audio.duration;
  });

  // Audio események
  dom.audio.addEventListener('play', () => { isPlaying=true; clearErr(); updatePlayIcon(); updateCards(); });
  dom.audio.addEventListener('playing', () => { clearErr(); });
  dom.audio.addEventListener('pause', () => { isPlaying=false; updatePlayIcon(); updateCards(); });
  dom.audio.addEventListener('timeupdate', () => {
    if (!dom.audio.duration) return;
    const pct = (dom.audio.currentTime/dom.audio.duration)*100;
    dom.progress.value = pct; progStyle(pct);
    dom.tCur.textContent = fmt(dom.audio.currentTime);
    dom.tTot.textContent = fmt(dom.audio.duration);
  });
  dom.audio.addEventListener('ended', () => { isPlaying=false; updatePlayIcon(); updateCards(); });
  function updatePlayIcon() {
    if (!dom.playBtn) return;
    dom.playBtn.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><polygon points="5,2 21,12 5,22"/></svg>';
  }

  // Témaváltás
  const themeToggle = $('themeToggle');
  themeToggle?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (dark) { delete document.documentElement.dataset.theme; localStorage.setItem(THEME_KEY,'light'); }
    else { document.documentElement.dataset.theme='dark'; localStorage.setItem(THEME_KEY,'dark'); }
  });
})();

