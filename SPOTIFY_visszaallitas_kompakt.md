# Spotify-lejátszó: vissza a letisztult verzióhoz + kompaktabb arányok

A két-zónás (pex-scroll/pex-dock) kísérlet szétvágta az elrendezést és levágta a pecsétet.
Visszaállunk az EREDETI, egy-blokkos, letisztult verzióra, és az egészet kicsit kisebbre
vesszük, hogy egy képernyőre elférjen görgetés nélkül - így a play magától mindig látszik.

═══════════════════════════════════════════════════════════════════
## 1) HTML: a két wrapper ELTÁVOLÍTÁSA (index.html)
═══════════════════════════════════════════════════════════════════
A #playerExpanded > .pex-inner-ből VEDD KI a <div class="pex-scroll"> és
<div class="pex-dock"> wrappereket, hogy a belső elemek KÖZVETLENÜL a .pex-inner
gyerekei legyenek újra (mint eredetileg):

Az eredmény ez a sorrend legyen a .pex-inner-en belül (wrapperek NÉLKÜL):
```html
    <div class="pex-top">...</div>
    <div class="pex-cover">...</div>
    <div class="pex-meta">...</div>
    <div class="pex-timeline">...</div>
    <div class="pex-controls">...</div>
    <div class="pex-extra">...</div>
```
(Csak a két új wrapper nyitó/záró <div>-jét töröld; a belső elemek maradnak.)

═══════════════════════════════════════════════════════════════════
## 2) CSS: a pex-scroll/pex-dock szabályok TÖRLÉSE (style.css)
═══════════════════════════════════════════════════════════════════
Töröld a korábban hozzáadott .pex-scroll és .pex-dock szabályokat (már nem kellenek).

═══════════════════════════════════════════════════════════════════
## 3) CSS: kompaktabb, letisztult arányok (style.css)
═══════════════════════════════════════════════════════════════════
Cél: minden elférjen egy képernyőn, elegánsan, görgetés nélkül. A .pex-inner legyen
középre igazított flex-oszlop, kisebb elemekkel.

### a) .pex-inner - vissza a natúr, középre igazított elrendezéshez
Keresd meg a jelenlegi .pex-inner-t és cseréld erre:
```css
.pex-inner {
  max-width: 560px;
  margin: 0 auto;
  min-height: 100%;
  padding: 0.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;       /* az egész tartalom függőlegesen középen */
  gap: 0.9rem;
}
```

### b) .pex-cover-img - kompaktabb pecsét, teljes körirattal
```css
.pex-cover-img {
  width: min(42vw, 190px);       /* kisebb, elegánsabb */
  height: auto;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  padding: 7px;                  /* a körirat befér */
  object-fit: contain;
  box-shadow: 0 10px 32px rgba(0,0,0,0.38), 0 0 0 5px rgba(201,164,74,0.15);
}
```

### c) A cím/meta kicsit visszafogottabb
```css
.pex-title { font-size: 1.35rem; margin: 0 0 0.35rem; }
.pex-cover { padding: 0.25rem 0; }
.pex-meta { text-align: center; }
```
(Ha ezek a szabályok már léteznek, csak a font-size / padding értékeket igazítsd ezekhez.)

### d) A .pex-timeline vissza a normál (nem fix) helyére
Ha maradt rajta bármi fix/sticky pozicionálás a korábbi kísérletből, állítsd vissza:
```css
.pex-timeline {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%;
}
```

### e) A vezérlők maradjanak a mostani szép formájukban
A .pex-controls és .pex-extra maradhat az EREDETI (első verziós) formájában:
```css
.pex-controls {
  display: flex; align-items: center; justify-content: center; gap: 2rem;
}
.pex-extra {
  display: flex; align-items: center; justify-content: center; gap: 1.5rem;
  padding-top: 0.25rem;
}
```
(A .pex-play 72px, a gombok a korábbiak - azok szépek voltak, nem kell változtatni.)

═══════════════════════════════════════════════════════════════════
## AZ EREDMÉNY
═══════════════════════════════════════════════════════════════════
- Az egész nagy nézet EGY blokk, függőlegesen középre igazítva, elegánsan.
- A pecsét kisebb (190px), a teljes körirat látszik, nincs levágás, nincs scrollbar.
- Minden elfér egy képernyőn -> a play/pause magától mindig látszik, nincs fix-zóna hack.
- Ha egy nagyon alacsony képernyőn mégis sok lenne, a .pex-inner justify-content:center
  miatt szépen középen marad; a player-expanded overflow-y:auto-ja végső esetben görget,
  de a kompakt méretek miatt ez ritka.

## TESZTELÉS
- A pecsét teljes (kör + körirat), nincs levágva, nincs scrollbar a pecsét mellett.
- Cím, előadó, igehely, dátum középen, letisztultan.
- A play/pause + idővonal + extra egy képernyőn, görgetés nélkül látszik.
- Asztali + telefon-nézet + sötét mód rendben, letisztult.
