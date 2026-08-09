# Mini-lejátszó: hosszú lectio/textus ne feszítse szét (telefon)

## A PROBLÉMA
Ha a felvétel lectio/textus mezője hosszú (pl. "Takaró Károly – János 8:31 Textus :
Zsoltárok 119:56-57 · Zsoltárok 1..."), a mini-sáv második sora (előadó + igehely)
szétfeszíti a lejátszót telefonon. Normál hosszúságnál nincs gond.

## AZ OK
A .player-info flex-basis-a `auto` (flex: 1 1 auto), ezért a flexbox a TARTALOM
szélességéből indul. Hosszú szövegnél a tartalom nagyon széles, és az első sorban a
player-info + controls + X együtt túlcsordul -> a szöveg szétnyomja a sávot, az
ellipsis nem érvényesül.

## A MEGOLDÁS (style.css)

### 1) A .player-info flex-basis legyen 0, ne auto (a 768px-es mobil-blokkban)
Keresd meg a @media (max-width: 768px) blokkban:
```css
  .player-info       { order: 1; flex: 1 1 auto; min-width: 0; }
```
Cseréld erre (flex-basis: 0 -> a rendelkezésre álló helyhez igazodik, nem a tartalomhoz):
```css
  .player-info       { order: 1; flex: 1 1 0; min-width: 0; max-width: 100%; }
```

### 2) A nyíl-gomb order javítása (most ütközik: expand-btn és info is order:1)
Ugyanitt keresd meg:
```css
  .player-expand-btn { order: 1; flex: 0 0 auto; }
  .player-info       { order: 1; ... }
```
A nyíl-gomb telefonon amúgy is felesleges (a cím-részre koppintva / felhúzva nyílik a
nagy nézet), ezért REJTSD el telefonon - tisztább is lesz:
```css
  .player-expand-btn { display: none; }
```
(Ha inkább megtartanád, akkor legalább adj neki order: 0-t, hogy a cím elé kerüljön:
`.player-expand-btn { order: 0; flex: 0 0 auto; }` - de a rejtés a tisztább.)

### 3) Biztosítsd a belső szövegek levágását (globálisan, nem csak mobilon)
Keresd meg a .player-title és .player-speaker szabályokat (a ~749-767 sor környékén):
```css
.player-title {
  font-family: var(--font-serif);
  font-size: 0.9375rem;
  color: var(--text-invert);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}
.player-speaker {
  font-family: var(--font-ui);
  font-size: 0.78rem;
  color: var(--gold-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```
Ezek jók, CSAK add hozzá MINDKETTŐHÖZ a max-width-et, hogy a flex-szülőben biztosan
levágódjanak (ne tudjanak kilógni):
```css
.player-title {
  font-family: var(--font-serif);
  font-size: 0.9375rem;
  color: var(--text-invert);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  max-width: 100%;         /* ÚJ */
}
.player-speaker {
  font-family: var(--font-ui);
  font-size: 0.78rem;
  color: var(--gold-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;         /* ÚJ */
}
```

## MIÉRT MŰKÖDIK
- flex: 1 1 0 -> a player-info a MARADÉK helyet kapja (nem a tartalom szélességét),
  így sosem tolja szét a sávot; a belső nowrap+ellipsis+max-width szépen levág "..."-tal.
- A nyíl rejtése telefonon egyszerűsít és helyet ad (a nagy nézet a cím-koppintással/
  felhúzással is nyílik).

## TESZTELÉS (telefon vagy DevTools eszköz-nézet)
- Játssz le egy HOSSZÚ lectio/textusú felvételt (pl. a képen lévő Takaró Károly - János
  8:31 / Zsoltárok 119:56-57): a mini-sáv NE feszüljön szét, a második sor "..."-tal
  levágódjon.
- Rövid szövegnél változatlanul néz ki.
- A cím-részre koppintva felnyílik a nagy nézet (ott a teljes igehely látszik).
- Asztali nézet változatlan.
