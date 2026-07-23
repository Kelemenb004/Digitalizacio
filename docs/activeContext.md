# Aktuális kontextus — kelenref100.hu

> **Ezt a fájlt frissítsd a leggyakrabban.** Ez mondja meg egy új sessionnek, hogy
> hol tartunk és mi a következő lépés — így nem kell újra elmagyaráznod.

## Jelenlegi fókusz
Az igehirdető-oldalak SEO-alrendszerének kiépítése és visszakötése a
főoldalba: generátor, mappás URL-séma, navigáció, sötét téma véglegesítve.

## Legutóbbi változások
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
- [ ] Kategóriák reformja: 45 → kb. 12.

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
