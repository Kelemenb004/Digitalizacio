# Aktuális kontextus — kelenref100.hu

> **Ezt a fájlt frissítsd a leggyakrabban.** Ez mondja meg egy új sessionnek, hogy
> hol tartunk és mi a következő lépés — így nem kell újra elmagyaráznod.

## Jelenlegi fókusz
Az igehirdető-oldalak SEO-alrendszerének kiépítése és visszakötése a
főoldalba: generátor, mappás URL-séma, navigáció, sötét téma véglegesítve.

## Legutóbbi változások
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

## Következő lépések
- [ ] `igehirdeto_generator.py` jelenleg a `.gitignore` `*.py` szabálya miatt
      nincs verziókezelve — döntés kell, force-add-dal bekerüljön-e (enélkül
      a generált oldalak forrása nincs a repóban).
- [ ] `config.js` `BACKGROUND.images` hibás fájlneveket hivatkoz
      (`bg1/2/3.JPG`), a tényleges fájlok `hero-1..4.jpg` — a véletlen
      háttérkép funkció emiatt 404-el.

## Nyitott kérdések / döntésre vár
- Transzkripció (Whisper) visszahozása később, ha lesz jobb GPU-megoldás.
- `techContext.md` Stack listájában még szerepel `impresszum.html` fájlként —
  apró elavult utalás, javításra vár.

## Kapcsolódó
- [progress](progress.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
