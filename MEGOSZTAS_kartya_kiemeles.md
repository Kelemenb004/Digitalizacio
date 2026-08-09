# Megosztott linkből érkezés: a lejátszott kártya megtalálása + kiemelése

## A PROBLÉMA
Megosztott linkből érkezve (`#felvetel=...`) a felvétel elindul, de:
1. A kártya sokszor NINCS kirenderelve (az INITIAL_PAGE_SIZE csak 18), ezért a
   findCard() nem találja, és nincs mihez görgetni → a főképernyő látszik, nem tudni
   mi szól.
2. A görgetés a render előtt fut (időzítés), így pontatlan/elmarad.

## A MEGOLDÁS (2 fájl: app.js + style.css)
- Ha a megosztott felvétel benne van a szűrt listában, addig "töltünk tovább" amíg a
  kártyája kirenderelődik, majd odagörgetünk és kiemeljük.
- Az épp lejátszott kártya erősebb vizuális kiemelést kap (nem csak megosztáskor).
- Megosztásból érkezéskor egy rövid pulzálás hívja fel rá a figyelmet.

═══════════════════════════════════════════════════════════════════
## 1) APP.JS
═══════════════════════════════════════════════════════════════════

### a) A handleUrlHash CSERÉJE

Keresd meg a JELENLEGI handleUrlHash függvényt:

```javascript
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
```

Cseréld le ERRE:

```javascript
function handleUrlHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#felvetel=')) return;
  try {
    const path = decodeURIComponent(hash.slice('#felvetel='.length));
    const lecture = state.lectures.find(l => l.path === path);
    if (!lecture) return;
    startPlaying(lecture);
    // Megosztott linkből érkezés: gördülő figyelemfelhívással
    revealCard(lecture.path, { highlight: true });
  } catch {}
}

// Biztosítja hogy a felvétel kártyája ki legyen renderelve (ha kell, "tovább"-ot tölt),
// majd odagörget és opcionálisan kiemeli. A findCard csak a már renderelt kártyákat látja,
// ezért ha a felvétel a szűrt lista mélyén van, előbb be kell tölteni.
function revealCard(path, { highlight = false } = {}) {
  // Ha a felvétel a szűrt listában van, de még nincs renderelve, töltsünk amíg előkerül.
  const idx = state.filtered.findIndex(l => l.path === path);
  if (idx >= 0) {
    let guard = 0;
    while (dom.grid.children.length <= idx && guard < 200) {
      const before = dom.grid.children.length;
      loadMoreLectures();
      if (dom.grid.children.length === before) break; // nincs több betölthető
      guard++;
    }
  }
  // A render után görgessünk (requestAnimationFrame: a böngésző már elrendezte a DOM-ot).
  requestAnimationFrame(() => {
    const card = findCard(path);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (highlight) {
      card.classList.add('just-shared');
      // a pulzálás után levesszük, hogy újra kiváltható legyen
      setTimeout(() => card.classList.remove('just-shared'), 2600);
    }
  });
}
```

### b) A "Véletlen igehirdetés" is használja a robusztus görgetést (opcionális, de ajánlott)

Keresd meg a playRandomLecture-ben:
```javascript
  // Görgessünk a kártyához, ha látható
  const card = findCard(pick.path);
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
```
Cseréld erre (így a véletlen felvétel is előkerül akkor is, ha a lista mélyén van):
```javascript
  revealCard(pick.path, { highlight: true });
```

### c) startPlaying: érkezzen-e a kártya a képbe minden lejátszásnál?

Az kártya-kiemelés (is-active) már működik a updateCardStates-ben, ez OK.
 Nem kell több változtatás a startPlaying-ben.

═══════════════════════════════════════════════════════════════════
## 2) STYLE.CSS
═══════════════════════════════════════════════════════════════════

### a) Az aktív kártya kiemelésének MEGERŐSÍTÉSE

Keresd meg:
```css
.lecture-card.is-active {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 164, 74, 0.25), var(--shadow);
}
```
Cseréld erre (erősebb, jobban látható arany keret + finom háttér):
```css
.lecture-card.is-active {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 164, 74, 0.45), var(--shadow);
  background: linear-gradient(180deg, rgba(201,164,74,0.06), transparent 60%);
}
```

### b) A megosztásból érkezés pulzálása — ÚJ szabály (tedd az is-active alá)

```css
/* Megosztott linkből érkezéskor rövid figyelemfelhívó pulzálás */
@keyframes sharedPulse {
  0%   { box-shadow: 0 0 0 3px rgba(201,164,74,0.45), var(--shadow); }
  30%  { box-shadow: 0 0 0 7px rgba(201,164,74,0.55), var(--shadow); }
  100% { box-shadow: 0 0 0 3px rgba(201,164,74,0.45), var(--shadow); }
}
.lecture-card.just-shared {
  animation: sharedPulse 1.3s ease-in-out 2;
}
@media (prefers-reduced-motion: reduce) {
  .lecture-card.just-shared { animation: none; }
}
```

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (python -m http.server 8080)
═══════════════════════════════════════════════════════════════════
1. Játssz le egy felvételt a lista ALJÁRÓL (görgess le, tölts "tovább"-ot, indíts egyet
   mélyen). A kártya kapjon erős arany keretet (is-active).
2. Másold ki a megosztás-linket (a lejátszó megosztás gombja), és nyisd meg ÚJ lapon /
   inkognitóban (ilyenkor a lista alaphelyzetből indul, a felvétel a mélyben van).
   - A felvétel elinduljon, ÉS a kártyához görgessen az oldal.
   - A kártya pulzáljon néhányszor (just-shared), utána maradjon kiemelve (is-active).
3. Próbáld ki a "Véletlen igehirdetés" gombot is: ha mélyről választ, akkor is odagörgessen.
4. prefers-reduced-motion esetén (rendszerbeállítás) ne legyen pulzálás, de a kiemelés igen.

Megjegyzés: a felhúzható (Spotify-szerű) teljes lejátszó KÜLÖN, következő lépés lesz.
