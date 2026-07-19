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

## Ami hátravan
- [ ] Időszak-szűrő (év / év+hónap) a kereséshez — hogy ne kelljen 50-esével
      görgetni egy konkrét évhez (gyülekezeti kérés). Adat: 1353/1382
      felvételnek van teljes dátuma, 1990–2010 közt, csúcs 1999–2009.
- [ ] Search Console: 78-URL-es sitemap beküldése.
- [ ] Kategóriák reformja: 45 → kb. 12.
- [ ] (opcionális) R2-ről a 2 üres fájl törlése rclone-nal.
- [ ] (opcionális) `BIBLIAI_KONYVEK` közös forrásból, hogy a két másolat
      (app.js + generátor) ne csúszhasson szét.
- Transzkripció (Whisper) — parkolva az AMD GPU / Windows korlát miatt; később.

## Ismert hibák / adósságok
- `techContext.md` Stack listájában elavult `impresszum.html` fájlnév-utalás.

## Kapcsolódó
- [activeContext](activeContext.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
