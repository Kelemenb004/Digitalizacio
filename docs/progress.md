# Haladás — kelenref100.hu

## Ami működik
- Hangarchívum böngészése és lejátszása (audio R2-ről), 2677 felvétel (~1900 óra, 1990–2017).
- Igehely-linkelés: összetett (több szakaszos) igehelyek szakaszonként külön
  linket kapnak, és a "v.v." (válogatott versek) rövidítés is helyesen
  kezelt (fejezetre linkel, kiírva jelenik meg) — főoldalon és az
  előadó-oldalakon egyaránt.
- ~105 generált előadó-oldal + gyűjtőoldal (`igehirdeto_generator.py`), mappás
  URL-ekkel, sitemapbe felvéve — light/dark, desktop/mobil böngészőben
  leellenőrizve.
- Hossz szerinti rendezés két irányban (legrövidebb elöl / leghosszabb elöl),
  a dátum-rendezéshez hasonlóan.
- Főoldal és előadó-oldalak kölcsönösen összekötve (kártya-link, szűrőpanel-
  link, lábléc-link).
- SEO alap: meta, JSON-LD, generált sitemap (~108 URL); Search Console indexelés fut,
  korai eredmények jók.
- Footer kész, lejátszási hibák javítva, sötét téma kontraszthiba javítva.
- Véletlen háttérkép a valós `hero-1..4.jpg` fájlokra mutat, nem 404-el.
- `igehirdeto_generator.py` verziókezelve (`.gitignore` kivétellel).
- Időszak-szűrő a kereséshez: év / év+hónap minta (pl. "2006 dec") ÉS önálló
  hónapnév-felismerés prefix-alapon ("december"/"dec" mindkettő talál, de
  "Márk"/"János"/"Júlia" nem ütközik hónapnévvel) — `app.js`
  `parseDatumKereses`/`honapPrefix` + `applyFilters`.
- 12 kategóriás rendszer (+ Történelmi előadás, Zenei alkalom saját színnel), sorszámozott alkalom-sorozatok.
- 2026-09-23: 207 felvétel (`4.KR_2006-2013`). 2026-10: a gyülekezet pendrive-ja
  (régi kelenref.hu) – 915 + 174 felvétel (`5.KR_2008-2017`); 223 meglévő felvétel
  szövege a hivatalos katalógushoz igazítva; igehirdető-nevek egységesítve.

## Ami hátravan
- [ ] 17 pendrive-felvétel előadó nélkül – meghallgatandó (`_archiv/adatok/pendrive_maradek_javaslat.xlsx`).
- [ ] Takaró Mihály irodalmi előadása (2017) – hiányzik a dátum.
- [ ] 3 házaspár-bizonyságtétel (2015) – egyelőre kihagyva.
- [ ] 2018–2019: a katalógusban 426 alkalom, hang nincs – rákérdezni a gyülekezetnél.
- [ ] 26 felvétel dátum nélkül (főleg zenei/rádiómissziós kazetták).
- [ ] (opcionális) `BIBLIAI_KONYVEK` közös forrásból (app.js + generátor).
- Transzkripció (Whisper) — parkolva.

## Ismert hibák / adósságok
- Néhány zenei/óvodai felvétel előadója „Ismeretlen előadó”; a 2017-es
  történelmi estek előadója feltételezett (ifj. Takaró Károly).

## Kapcsolódó
- [activeContext](activeContext.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
