# Spotify-lejátszó finomítás: play mindig látszik + pecsét körirat befér

Két javítás a style.css-ben. A JS NEM változik. A HTML-ben egy pici csoportosítás kell (2. pont).

═══════════════════════════════════════════════════════════════════
## 1) A PECSÉT KÖRIRATA FÉRJEN BELE  (csak CSS)
═══════════════════════════════════════════════════════════════════
A négyzetes pecsét-képet a border-radius:50% körre vágja, ezért a sarkokban futó körirat
levágódik. Megoldás: a kép ne vágódjon, csak legyen kör-háttere kis belső levegővel.

Keresd meg a .pex-cover-img szabályt:
```css
.pex-cover-img {
  width: min(58vw, 260px);
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 6px rgba(201,164,74,0.15);
  background: #fff;
}
```
Cseréld erre:
```css
.pex-cover-img {
  width: min(52vw, 230px);
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  padding: 8px;                  /* levegő -> a teljes körirat befér */
  object-fit: contain;           /* a pecsét nem vágódik */
  box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 0 6px rgba(201,164,74,0.15);
}
```
(Kicsit kisebb is lett: min(52vw,230px), így több hely marad a szövegnek és a vezérlőknek.)

═══════════════════════════════════════════════════════════════════
## 2) KÉT ZÓNA: görgethető felső + FIX alsó vezérlők  (HTML pici + CSS)
═══════════════════════════════════════════════════════════════════
A nagy nézetet két részre osztjuk:
- FELSŐ (pecsét + cím + meta): ez görgethető, ha kevés a hely.
- ALSÓ (idővonal + fő vezérlők + extra): ez FIXEN a képernyő alján marad -> a play/pause
  mindig látszik.

### a) HTML: csoportosítsd az alsó három blokkot egy közös konténerbe (index.html)
A #playerExpanded > .pex-inner-en belül a HTML most így néz ki (leegyszerűsítve):
```
  <div class="pex-top">...</div>
  <div class="pex-cover">...</div>
  <div class="pex-meta">...</div>
  <div class="pex-timeline">...</div>
  <div class="pex-controls">...</div>
  <div class="pex-extra">...</div>
```
Tedd a pex-cover + pex-meta köré egy "pex-scroll" wrappert, és a timeline+controls+extra
köré egy "pex-dock" wrappert. Az eredmény:
```html
    <div class="pex-top">...változatlan...</div>

    <div class="pex-scroll">
      <div class="pex-cover">...változatlan...</div>
      <div class="pex-meta">...változatlan...</div>
    </div>

    <div class="pex-dock">
      <div class="pex-timeline">...változatlan...</div>
      <div class="pex-controls">...változatlan...</div>
      <div class="pex-extra">...változatlan...</div>
    </div>
```
Csak két új wrapper <div> (pex-scroll, pex-dock) - a belső elemek változatlanok.

### b) CSS: a két zóna elrendezése (style.css)
A .pex-inner már flex-column. Add hozzá / módosítsd:

Keresd meg a .pex-inner szabályt és cseréld erre (a belső magasság-kezeléshez):
```css
.pex-inner {
  max-width: 640px;
  margin: 0 auto;
  height: 100%;                  /* a teljes magasságot kitölti (nem min-height) */
  padding: 0.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

Majd vedd fel EZEKET az új szabályokat (pl. a .pex-extra szabály után):
```css
/* Felső, görgethető zóna (pecsét + cím + meta) */
.pex-scroll {
  flex: 1 1 auto;
  min-height: 0;                 /* hogy a flex-gyerek görgethessen */
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  justify-content: center;       /* ha van hely, középre; ha nincs, görget */
  gap: 1rem;
  padding-bottom: 0.5rem;
}
/* Alsó, FIX vezérlő-zóna (idővonal + fő gombok + extra) - mindig látszik */
.pex-dock {
  flex: 0 0 auto;               /* nem zsugorodik, mindig a helyén */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.08);
}
```

### c) A régi pozicionálás eltávolítása
Ha a .pex-timeline-on van `margin-top: auto;`, azt VEDD KI (már nem kell, a dock kezeli).
A .pex-controls és .pex-extra maradhat ahogy van (a dock-on belül flex-elemek).

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (python -m http.server 8080)
═══════════════════════════════════════════════════════════════════
- A pecsét TELJES körirata látszik ("...100 ÉVE KRISZTUSSAL"), nem vágódik.
- A play/pause + ±10mp + idővonal MINDIG az alsó, fix zónában van - görgetéskor sem tűnik el.
- Ha sok a tartalom (kis képernyő): a FELSŐ zóna (pecsét+cím+igehely) görgethető, az alsó
  vezérlők a helyükön maradnak.
- Ha elég a hely: a felső tartalom középen, nincs felesleges görgetés.
- Telefon-nézetben a le-húzás a tetejéből (fogantyú) zár; a vezérlők végig kéznél.
- Sötét mód rendben.
