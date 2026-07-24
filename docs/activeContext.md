# Aktuális kontextus — kelenref100.hu

> **Ezt a fájlt frissítsd a leggyakrabban.** Ez mondja meg egy új sessionnek, hogy
> hol tartunk és mi a következő lépés — így nem kell újra elmagyaráznod.

## Jelenlegi fókusz
Az igehirdető-oldalak SEO-alrendszerének kiépítése és visszakötése a
főoldalba: generátor, mappás URL-séma, navigáció, sötét téma véglegesítve.

## Legutóbbi változások
- Kategória-reform kész: 45 -> 10 kategória (Istentisztelet 903, Evangelizáció
  170, Bibliaóra 128, Különleges alkalom 63, Diakónia napok 30, Alliance
  Imahét 28, Bűnbánati hét 27, Imahét 16, A reformáció hete 10, Ünnepi alkalom
  7). Csak a kategoria mező íródott át (54 rekord), a cim érintetlen.
- Alkalom-sorozatok sorszámozása kész: a 6 "hetes" kategóriában 64 sorozat /
  261 felvétel kapott római sorszámot a CÍM végére (egymást követő alkalmak,
  max 3 nap szünettel csoportosítva, dátum -> időpont -> kazettaszám
  sorrendben). A magányos alkalmakról a beragadt sorszám levéve. Így egy adott
  hét alkalmai a kategóriára szűrve, dátum szerint rendezve egy blokkban,
  sorrendben olvashatók. A script (`cim_sorszamozas_teljes.py`) idempotens:
  újrafuttatva 0 módosítást ír.
- E: meghajtó leltár kész: 1642 mp3 feldolgozva; 1048 a 2013.03.28-as határ
  után (YouTube-on, nem kell), 57 már megvan, 207 HIÁNYZIK (Takaró Károly 202,
  Szántó János 4, Takaró Tamás 1), ebből 16 db a "kész" 2006-2009 időszak
  lyuka. A 330 nem-parse-olható fájlnév mind a "Reggeli áhítatok" 2020-2021-es
  sorozat, mind határ utáni - a parser bővítése felesleges.
- Összetett igehely-linkelés kész és élesben: több szakaszos igehelyek
  (pl. "Zsd.1:1-3, 3:1-3") mostantól szakaszonként külön kattintható linket
  kapnak egymás mellett, vesszővel elválasztva (`app.js` `igehelySzakaszok`/
  `renderIgehely` + `igehirdeto_generator.py` `igehely_szakaszok`/
  `render_igehely`, párhuzamos implementáció).
- "v.v." (válogatott versek) rövidítés kezelve: törlődik a linkből (a
  fejezetre mutat, nem 404-el), a megjelenítésben "(válogatott versek)"-ként
  jelenik meg. 10 igehelyet érintett.
- Igehely adatjavítások a `lectures.json`-ban: `i:Mózes` → `I.Mózes`, és 6
  korábbi elírás (Sámson→1Sám, fk→Lk, Ézsiás→Ézs, Zsoltrárok→Zsolt,
  2Krónika→2Krón, kevert Hós-mező).
- 2 üres (0 bájt, a HDD-n is 0 bájtos, nem menthető) felvétel törölve:
  Balog Zoltán egy evangelizációja + egy Advent Zenés Áhitat. 1384 → 1382
  felvétel.
- Rendezés: "Hossz szerint" kettébontva növekvő/csökkenő irányra (mint a
  dátumnál) — mellékesen ez segített kiszűrni a fenti 0:00-s hibás fájlokat.
- `config.js`: a véletlen háttérkép mostantól a valós `images/hero-1..4.jpg`
  fájlokra mutat (a nem létező `bg1/2/3.JPG` helyett) — nincs több 404.
- `.gitignore`: `!igehirdeto_generator.py` kivétel bekerült — a generátor
  mostantól verziókövetett (élő, karbantartott forrás, nem egyszeri
  segéd-script).
- `igehirdeto_generator.py` elkészült és lefutott: 75 előadó-oldal
  (`igehirdeto/<slug>/`), gyűjtőoldal (`igehirdetok/`), `igehirdeto.js`,
  78 URL-es `sitemap.xml`, `lectures.json` dátumjavítás (0998→1998).
- Impresszum mappás URL-re állítva (`/impresszum.html` → `/impresszum/`).
- Főoldal (`app.js`/`index.html`) összekötve az új oldalakkal: kártyán
  kattintható előadónév (saját JS `slugify()`), "Igehirdetők" belépési pont a
  szűrőpanelben (fejlécben túl szűk volt mobilon, onnan eltávolítva).
- Két hiba javítva: sötét téma kontraszt (`--text-invert` bevezetve a
  `--white`-ot félrehasználó szövegszíneknek), és a gyűjtőoldal témaváltó
  gombja (hiányzó script miatt nem reagált kattintásra).
- Időszak-szűrő kész: év / év+hónap minta ÉS önálló hónapnév-felismerés
  prefix-alapon (`app.js` `parseDatumKereses`/`honapPrefix`, ld. progress.md).

## Következő lépések
- [ ] Search Console: a 78-URL-es `sitemap.xml` beküldése.
- [ ] A 207 hiányzó felvétel feltöltése az E:-ről (ld. progress.md).

## Nyitott kérdések / döntésre vár
- Transzkripció (Whisper) visszahozása később, ha lesz jobb GPU-megoldás.
- `techContext.md` Stack listájában még szerepel `impresszum.html` fájlként —
  apró elavult utalás, javításra vár.
- (opcionális) A 2 törölt üres felvétel R2-ről is törölhető rclone-nal.
- (opcionális) `BIBLIAI_KONYVEK` közös forrásból generálva, hogy a két
  másolat (app.js + generátor) ne csúszhasson szét — ld. systemPatterns.md.

## Kapcsolódó
- [progress](progress.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
