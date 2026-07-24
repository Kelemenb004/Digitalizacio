# Haladás — kelenref100.hu

## Ami működik
- Hangarchívum böngészése és lejátszása (audio R2-ről), 1382 felvétel.
- Igehely-linkelés: összetett (több szakaszos) igehelyek szakaszonként külön
  linket kapnak, és a "v.v." (válogatott versek) rövidítés is helyesen
  kezelt (fejezetre linkel, kiírva jelenik meg) — főoldalon és az
  előadó-oldalakon egyaránt.
- 75 generált előadó-oldal + gyűjtőoldal (`igehirdeto_generator.py`), mappás
  URL-ekkel, sitemapbe felvéve — light/dark, desktop/mobil böngészőben
  leellenőrizve.
- Hossz szerinti rendezés két irányban (legrövidebb elöl / leghosszabb elöl),
  a dátum-rendezéshez hasonlóan.
- Főoldal és előadó-oldalak kölcsönösen összekötve (kártya-link, szűrőpanel-
  link, lábléc-link).
- SEO alap: meta, JSON-LD, 78 URL-es sitemap; Search Console indexelés fut,
  korai eredmények jók.
- Footer kész, lejátszási hibák javítva, sötét téma kontraszthiba javítva.
- Véletlen háttérkép a valós `hero-1..4.jpg` fájlokra mutat, nem 404-el.
- `igehirdeto_generator.py` verziókezelve (`.gitignore` kivétellel).
- Időszak-szűrő a kereséshez: év / év+hónap minta (pl. "2006 dec") ÉS önálló
  hónapnév-felismerés prefix-alapon ("december"/"dec" mindkettő talál, de
  "Márk"/"János"/"Júlia" nem ütközik hónapnévvel) — `app.js`
  `parseDatumKereses`/`honapPrefix` + `applyFilters`.
- 10 kategóriás rendszer, sorszámozott alkalom-sorozatok.

## Ami hátravan
- [ ] Search Console: 78-URL-es sitemap beküldése.
- [ ] A 207 hiányzó felvétel feltöltése az E:-ről (ID3-ból cím+igehely
      nyerhető 93 fájlnál; R2-feltöltés + lectures.json bővítés + generátor
      futtatás).
- [ ] (opcionális) R2-ről a 2 üres fájl törlése rclone-nal.
- [ ] (opcionális) `BIBLIAI_KONYVEK` közös forrásból, hogy a két másolat
      (app.js + generátor) ne csúszhasson szét.
- Transzkripció (Whisper) — parkolva az AMD GPU / Windows korlát miatt; később.

## Ismert hibák / adósságok
- `techContext.md` Stack listájában elavult `impresszum.html` fájlnév-utalás.

## Kapcsolódó
- [activeContext](activeContext.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
