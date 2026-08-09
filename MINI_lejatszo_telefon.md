# Mini-lejátszó telefonos elrendezés – Spotify-szerű letisztítás

Telefonon a mini-sáv legyen minimál: cím/előadó + play + ±10mp + idővonal.
A sebesség és hangerő rejtve (a nagy nézetben elérhető). Tiszta CSS, a HTML/JS marad.

A jelenlegi 768px-es blokkban már rejtve van a hangerő (.player-volume) és külön a
sebesség (.speed-select). Most letisztítjuk és Spotify-szerűvé tesszük az elrendezést.

═══════════════════════════════════════════════════════════════════
## style.css – a 768px-es mobil player-blokk cseréje
═══════════════════════════════════════════════════════════════════

Keresd meg a @media (max-width: 768px) blokkban ezt a részt:
```css
  .player-inner {
    flex-wrap: wrap;
    padding: 0.625rem 1rem;
    gap: 0.5rem;
    align-content: center;
    height: var(--player-h);
  }
  .player-info     { order: 1; flex: 1; min-width: 0; }
  .close-btn       { order: 2; }
  .player-controls { order: 3; }
  .player-timeline { order: 4; flex: 1 1 100%; max-width: none; }
  .player-volume   { display: none; }
  .ctrl-btn        { min-height: 40px; }
```

Cseréld erre (Spotify-szerű kétsoros elrendezés):
```css
  .player-inner {
    flex-wrap: wrap;
    padding: 0.5rem 0.75rem;
    gap: 0.4rem 0.6rem;
    align-content: center;
    height: var(--player-h);
  }
  /* 1. sor: nyíl + cím/előadó (bal) ... play + skip (jobb) */
  .player-expand-btn { order: 1; flex: 0 0 auto; }
  .player-info       { order: 2; flex: 1 1 auto; min-width: 0; }
  .player-controls   { order: 3; flex: 0 0 auto; gap: 0.35rem; }
  /* 2. sor: teljes szélességű idővonal */
  .player-timeline   { order: 4; flex: 1 1 100%; max-width: none; margin-top: 0.15rem; }

  /* Telefonon rejtett: sebesség, hangerő, megosztás, X (a nagy nézetben elérhető) */
  .player-volume   { display: none; }
  .speed-select    { display: none; }
  .player-share-btn { display: none; }
  .close-btn       { display: none; }

  .ctrl-btn        { min-height: 40px; }

  /* A cím/előadó legyen koppintható a nagy nézethez (a JS is erre köt) */
  .player-info { cursor: pointer; }
}
```

MEGJEGYZÉS a bezárásról: mivel a mini-sáv X gombja (.close-btn) telefonon rejtve lesz,
a lejátszást a nagy nézetben lehet leállítani (oda kell egy X vagy stop). HA szeretnéd
hogy telefonon is legyen gyors bezárás a mini-sávon, NE rejtsd el a .close-btn-t - hagyd
láthatóan. Az alábbi "B változat" ezt teszi.

--- B VÁLTOZAT (ha a bezáró X maradjon telefonon is) ---
Ugyanaz mint fent, de a .close-btn NE legyen display:none, hanem:
```css
  .close-btn { order: 3; flex: 0 0 auto; }
  .player-controls { order: 2; }
  .player-info { order: 1; }
```
Így: cím (1) | vezérlők (2) | X (3), majd alatta az idővonal. A sebesség/hangerő/megosztás
rejtve marad, de a bezárás elérhető.

═══════════════════════════════════════════════════════════════════
## AJÁNLÁS
═══════════════════════════════════════════════════════════════════
Javaslom a B változatot: a bezáró X maradjon telefonon is a mini-sávon (gyors leállítás),
csak a sebesség/hangerő/megosztás rejtve. A megosztás a nagy nézetből elérhető, a hangerőt
a telefon gombjaival állítják, a sebesség ritka - ezek jogosan tűnnek el a mini-sávról.

Így a telefonos mini-sáv:
  1. sor:  [cím/előadó .......]  [−10] [play] [+10]  [X]
  2. sor:  [0:00 ====csúszka==== 00:00]
Letisztult, minden fontos kéznél, a cím-részre koppintva felnyílik a nagy nézet.

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (telefon vagy DevTools eszköz-nézet)
═══════════════════════════════════════════════════════════════════
- A mini-sáv két soros: fent cím + vezérlők (+X), lent az idővonal.
- Nincs sebesség/hangerő a mini-sávon (a nagy nézetben van).
- A cím/előadó részre koppintva felnyílik a nagy nézet.
- A play/pause, ±10mp, idővonal működik.
- Asztali nézet (768px felett) VÁLTOZATLAN - ott minden látszik.
- Sötét mód rendben.
