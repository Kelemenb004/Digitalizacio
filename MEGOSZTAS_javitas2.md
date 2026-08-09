# Megosztás-javítás 2.: fejléc-tudatos görgetés + autoplay-blokk kezelése

Két hiba a megosztott linkből érkezéskor:
1. A kártya a FIX FEJLÉC alá görget (a scrollIntoView center nem tud a sticky headerről),
   ezért a kártya teteje levágódik.
2. A böngésző tiltja az automatikus hang-lejátszást interakció előtt -> csúnya piros
   "A felvétel most nem indítható el" üzenet jön, pedig ez NEM hiba (kattintásra megy).

Mindkettő az app.js-ben javítható.

═══════════════════════════════════════════════════════════════════
## 1) FEJLÉC-TUDATOS GÖRGETÉS
═══════════════════════════════════════════════════════════════════

A revealCard függvényben keresd meg ezt a részt:

```javascript
  requestAnimationFrame(() => {
    const card = findCard(path);
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (highlight) {
      card.classList.add('just-shared');
      setTimeout(() => card.classList.remove('just-shared'), 2600);
    }
  });
```

Cseréld le erre (kézi görgetés, ami leszámítja a fix fejléc magasságát):

```javascript
  requestAnimationFrame(() => {
    const card = findCard(path);
    if (!card) return;
    scrollCardIntoView(card);
    if (highlight) {
      card.classList.add('just-shared');
      setTimeout(() => card.classList.remove('just-shared'), 2600);
    }
  });
```

És vedd fel EZT az új segédfüggvényt (pl. a revealCard alá):

```javascript
// A kártyát úgy görgeti a képbe, hogy a FIX FEJLÉC ne takarja el.
// A --header-h CSS-változóból olvassa ki a fejléc magasságát (asztali 72px, mobil 116px).
function scrollCardIntoView(card) {
  const headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
    10
  ) || 72;
  const margin = 16; // kis levegő a fejléc alatt
  const rect = card.getBoundingClientRect();
  const absoluteTop = window.pageYOffset + rect.top;
  // Középre próbáljuk, de úgy hogy a kártya teteje SOSE csússzon a fejléc alá.
  const viewport = window.innerHeight;
  let target = absoluteTop - (viewport - rect.height) / 2;   // középre igazítás
  const minTop = absoluteTop - headerH - margin;             // felső határ (fejléc alatt)
  if (target > minTop) target = minTop;                      // ne takarja a fejléc
  window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
}
```

═══════════════════════════════════════════════════════════════════
## 2) AZ AUTOPLAY-BLOKK NE LEGYEN "HIBA"
═══════════════════════════════════════════════════════════════════

A böngésző interakció (kattintás) nélkül nem indít hangot -> a play() NotAllowedError-t
dob. Ez NEM valódi hiba: a felhasználó a Lejátszás gombra kattintva elindítja.
Megosztott linkből érkezéskor tehát ne "erőltessük" az azonnali lejátszást.

### a) A startPlaying fogadjon egy 'autoInditas' jelzőt

Keresd meg a startPlaying-ben:
```javascript
  dom.audio.play().catch(err => {
    // Az AbortError ártalmatlan: akkor jön, ha egy új lejátszás megszakítja az előzőt
    // (pl. gyors váltás felvételek között, vagy a böngésző még tölt). Ilyenkor NINCS valódi hiba.
    if (err.name === 'AbortError') return;
    console.warn('Lejátszási hiba:', err.message);
    showPlayerError('A felvétel most nem indítható el. Próbáld meg újra.');
  });
```

Cseréld erre:
```javascript
  dom.audio.play().catch(err => {
    // AbortError: egy új lejátszás megszakította az előzőt (gyors váltás) - ártalmatlan.
    if (err.name === 'AbortError') return;
    // NotAllowedError: a böngésző interakció előtt nem indít hangot (pl. megosztott linkből
    // érkezéskor). Ez NEM hiba - a felhasználó a Lejátszás gombbal elindítja. Ne írjunk hibát.
    if (err.name === 'NotAllowedError') return;
    console.warn('Lejátszási hiba:', err.message);
    showPlayerError('A felvétel most nem indítható el. Próbáld meg újra.');
  });
```

Ez a minimál javítás: a megosztott linkből a felvétel BETÖLTŐDIK a lejátszóba (cím,
előadó, a kártya kiemelve), és ha a böngésző tiltja az autostartot, nincs csúnya hiba -
a felhasználó egy kattintással indítja. Ahol az autostart engedélyezett (pl. már volt
interakció az oldalon), ott továbbra is azonnal indul.

MEGJEGYZÉS: a valódi lejátszási hibák (pl. nem elérhető fájl, hálózati hiba) továbbra is
megjelennek - azok más error-típusok, és az audio 'error' eseménye is kezeli őket
(a setupAudioListeners-ben).

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (python -m http.server 8080)
═══════════════════════════════════════════════════════════════════
1. Egy MÉLYEN lévő felvétel megosztás-linkjét nyisd meg ÚJ lapon.
   - A kártya a fejléc ALATT, teljesen láthatóan jelenjen meg (ne legyen levágva a teteje).
   - NE legyen piros "nem indítható el" hibaüzenet.
   - A lejátszó-sáv mutassa a felvételt (cím, előadó), készenlétben.
   - A Lejátszás gombra kattintva induljon el a hang.
2. Asztali ÉS mobil nézetben is (a fejléc magassága más - 72 vs 116px -, a görgetés
   mindkettőn a fejléc alá igazítson).
3. Ellenőrizd hogy a NORMÁL lejátszás (kártyán a Lejátszás gomb) változatlanul,
   azonnal indul (ott van interakció, nincs autoplay-blokk).
