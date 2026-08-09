# Spotify-szerű felhúzható lejátszó — megvalósítási útmutató

A mostani alsó mini-sáv MARAD. Rákattintva / felfelé húzva / a nyílra nyomva felnyílik
egy teljes képernyős nagy nézet (pecsét-logó "borító", nagy cím, előadó-link, kattintható
igehely, dátum, nagy vezérlők, idővonal). Lefelé húzva / nyílra nyomva / Esc-re bezárul.

FONTOS ELV: NINCS külön lejátszó. A nagy nézet UGYANAZT az #audioElement-et és a
state.current-et használja, mint a mini-sáv - csak egy másik NÉZET ugyanarra. Ezért nem
kell két lejátszót szinkronban tartani, csak a nagy nézet MEGJELENÍTÉSÉT frissíteni.

A 4 rész: (1) HTML, (2) egy nyíl-gomb a mini-sávba, (3) CSS, (4) JS + a szinkron-pontok.
A HTML és CSS tartalma külön fájlban: SPOTIFY_lejatszo_resz1_html.txt, _resz2_css.txt,
_resz3_js.txt.

═══════════════════════════════════════════════════════════════════
## 1) HTML — a nagy nézet (index.html)
═══════════════════════════════════════════════════════════════════
Az #audioPlayer (mini-sáv) záró </div>-je UTÁN illeszd be a SPOTIFY_lejatszo_resz1_html.txt
teljes tartalmát. FONTOS: az <audio id="audioElement"> marad az eredeti mini-sávban,
NE duplázd - a nagy nézet is azt használja.

═══════════════════════════════════════════════════════════════════
## 2) A NYITÓ NYÍL-GOMB a mini-sávba (index.html)
═══════════════════════════════════════════════════════════════════
A mini-sávban a player-info blokk (a cím+előadó) MELLÉ, elé teszünk egy felfelé-nyíl
gombot. Keresd meg a mini-sávban:

```html
      <div class="player-info">
        <div class="player-title" id="playerTitle" aria-label="Lejátszott előadás">—</div>
        <div class="player-speaker" id="playerSpeaker">—</div>
      </div>
```

És KÖZVETLENÜL ELÉ szúrd be a nyíl-gombot:

```html
      <button class="player-expand-btn" id="playerExpandBtn" aria-label="Teljes lejátszó megnyitása" title="Teljes nézet">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
```

═══════════════════════════════════════════════════════════════════
## 3) CSS (style.css)
═══════════════════════════════════════════════════════════════════
A SPOTIFY_lejatszo_resz2_css.txt teljes tartalmát illeszd a style.css VÉGÉRE (vagy a
lejátszó-stílusok mellé). Használja a meglévő CSS-változókat (--navy, --gold, stb.),
így a sötét mód is automatikusan működik.

═══════════════════════════════════════════════════════════════════
## 4) JS (app.js) + a SZINKRON-PONTOK
═══════════════════════════════════════════════════════════════════

### a) A fő logika beillesztése
A SPOTIFY_lejatszo_resz3_js.txt teljes tartalmát illeszd az app.js-be (pl. a lejátszó-
függvények köré, a setupAudioListeners közelébe).

### b) A dom-objektumhoz: playerInfo
A cachePexDom külön kezeli a nagy nézet elemeit, DE kell a mini-sáv info-blokkja is.
A dom cache-hez (ahol a többi g('...') van) vedd fel:
```javascript
    playerInfo:      g('audioPlayer') ? document.querySelector('.player-info') : null,
```
VAGY egyszerűbben, a setupExpandedPlayer elején már úgy hivatkozunk rá hogy
dom.playerInfo - ha nincs a cache-ben, tedd be:
```javascript
  dom.playerInfo = document.querySelector('.player-info');
```
(A cachePexDom-ba is beteheted ezt az egy sort, a lényeg hogy dom.playerInfo létezzen.)

### c) A setupExpandedPlayer meghívása az indításkor
Keresd meg ahol a többi setup fut (pl. setupAudioListeners() hívása a DOMContentLoaded-ban
vagy egy init-blokkban), és MELLÉ tedd:
```javascript
  setupExpandedPlayer();
```

### d) SZINKRON-PONTOK — a nagy nézet megjelenítése kövesse a lejátszást
A nagy nézet ugyanazt az audiót vezérli, de a saját idővonalát/ikonját frissíteni kell.
Négy meglévő helyre kell egy-egy sort beszúrni:

1. A startPlaying VÉGÉRE (a updateCardStates() mellé):
```javascript
  updateCardStates();
  updatePexView();          // <-- ÚJ: a nagy nézet feltöltése az új felvétellel
```

2. A 'timeupdate' handlerbe (a meglévő progress-frissítés mellé):
```javascript
  dom.audio.addEventListener('timeupdate', () => {
    if (!dom.audio.duration) return;
    const pct = (dom.audio.currentTime / dom.audio.duration) * 100;
    dom.progressBar.value = pct;
    updateProgressBarStyle(pct);
    dom.timeCurrent.textContent = formatTime(dom.audio.currentTime);
    // ÚJ: a nagy nézet idővonala
    if (dom.pexProgress) dom.pexProgress.value = pct;
    if (dom.pexTimeCurrent) dom.pexTimeCurrent.textContent = formatTime(dom.audio.currentTime);
  });
```

3. A 'loadedmetadata' handlerbe (a teljes hossz):
```javascript
  dom.audio.addEventListener('loadedmetadata', () => {
    dom.timeTotal.textContent = formatTime(dom.audio.duration);
    if (dom.pexTimeTotal) dom.pexTimeTotal.textContent = formatTime(dom.audio.duration); // ÚJ
  });
```

4. A 'play' és 'pause' handlerekbe (az ikon szinkronhoz) - a updateCardStates() mellé
   MINDKETTŐBE:
```javascript
    updateCardStates();
    updatePexPlayIcon();     // <-- ÚJ (a play ÉS a pause handlerbe is)
```
   (Az 'ended' handlerbe is teheted, ha szeretnéd hogy a végén a play-ikonra váltson.)

### e) A stopPlayer is zárja a nagy nézetet (opcionális, ajánlott)
A stopPlayer függvény végére (ahol a mini-sávot elrejti):
```javascript
  closePex();               // <-- ÚJ: a nagy nézet is zárul, ha a lejátszót bezárják
```

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (python -m http.server 8080)
═══════════════════════════════════════════════════════════════════
ASZTALI:
- Indíts egy felvételt -> alul a mini-sáv. Kattints a cím/előadó részre VAGY a felfelé-
  nyílra -> felnyílik a nagy nézet (pecsét-logó, nagy cím, előadó-link, igehely linkekkel,
  dátum, nagy vezérlők).
- A nagy nézetben: play/pause, -10/+10, sebesség, idővonal-húzás, megosztás, letöltés
  mind működik és SZINKRONBAN van a mini-sávval (ha ott állítod, itt is látszik).
- A lehúzó nyíl (felül) / Esc bezárja -> vissza a mini-sávhoz, a lejátszás MEGY tovább.
- Az igehely-linkek és az előadó-link a nagy nézetből is a jó helyre visznek.

MOBIL (szűk nézet / eszköz):
- A mini-sávon FELFELÉ húzva nyíljon; a nagy nézeten a tetejénél LEFELÉ húzva záruljon.
- A nagy nézet elrendezése rendben (a pecsét-logó, a cím, a vezérlők jól elférnek).

SÖTÉT MÓD:
- Váltsd sötétre -> a nagy nézet is illeszkedjen (a CSS-változók miatt automatikus).

ELLENŐRIZD hogy a mini-sáv minden eddigi funkciója VÁLTOZATLANUL működik.
