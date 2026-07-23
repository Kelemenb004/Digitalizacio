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

## Ami hátravan
- [ ] Search Console: 78-URL-es sitemap beküldése.
- [ ] Kategóriák reformja: 45 → kb. 12.
- [ ] (opcionális) R2-ről a 2 üres fájl törlése rclone-nal.
- [ ] (opcionális) `BIBLIAI_KONYVEK` közös forrásból, hogy a két másolat
      (app.js + generátor) ne csúszhasson szét.
- [ ] HIÁNYPÓTLÁS az E: meghajtóról (2013.03.28 előtti felvételek):
      - Az E: meghajtón 8 előadó mappája van (Takaró Károly ~1200 fájl, Szántó
        János ~85, + Takaró János/Tamás, Szedlák, Pocsaji, Horváth, Szabó 1-15 db).
      - Fájlnév-formátum: ÉÉHHNN_ÓÓPP.mp3 (pl. 100329_1830 = 2010-03-29 18:30).
        A fájlnév dátuma a VALÓDI felvételi dátum (a fájl módosítás-dátuma 2018
        = csak a digitalizálás, nem releváns).
      - Szabály: a YouTube legrégebbi feltöltése 2013.03.28. Ami ez ELŐTTI és
        nincs meg a lectures.json-ban, az kell a weboldalra (a 2013.03.28
        utániak YouTube-on vannak).
      - SZÁMOK: a 2013.03.28 előtti E:-fájlokból 198 HIÁNYZIK a lectures.json-ból
        (Takaró Károly 193, Szántó János 4, Takaró Tamás 1). Ezek értékes
        hiánypótlások.
      - FONTOS: sok fájlban GAZDAG ID3-tag van! TIT2 (cím, pl. "Harcosképzés I."
        vagy dátumos "Istentisztelet 2008.10.27."), COMM (igehely, pl.
        "2Tim.2,1-5."), TPE1 (előadó). Ahol tartalmi cím van, onnan valódi
        cím+igehely nyerhető. Ahol csak dátumos cím vagy nincs ID3 (pl. Szántó
        János), ott a fájlnév-adat marad.
      - TEENDŐ egy külön sessionben: ID3-kiolvasó script (mutagen), a cím
        dátumos/tartalmi szétválasztása, dátum+idő+előadó+cím+igehely
        normalizálása a lectures.json formátumára, majd a 198 fájl feltöltése
        az R2-re (rclone) és beillesztés a lectures.json-ba. A generátort
        utána újra kell futtatni.
      - Az időpont-egyezésnél a fájlnév ideje is számít (ugyanaz a nap két
        alkalma = két külön felvétel).
- Transzkripció (Whisper) — parkolva az AMD GPU / Windows korlát miatt; később.

## Ismert hibák / adósságok
- `techContext.md` Stack listájában elavult `impresszum.html` fájlnév-utalás.

## Kapcsolódó
- [activeContext](activeContext.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
