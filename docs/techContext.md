# Technikai kontextus — kelenref100.hu

## Stack
- **Frontend:** statikus HTML/CSS/vanilla JS (nincs backend futásidőben, nincs
  build lépés, nincs framework). Fő fájlok: `index.html`, `app.js` (~1000
  sor, a teljes UI-logika), `style.css`, `config.js` (beállítások),
  `impresszum.html` (különálló statikus oldal).
- **Hosting:** GitHub Pages, repo: `Kelemenb004/Digitalizacio`. Egyedi domain
  `kelenref100.hu` a `CNAME` fájlon keresztül.
- **Média:** Cloudflare R2 publikus bucket (~86 GB, ~1384 felvétel). Az audio
  közvetlenül R2-ről szolgálódik, a bucket dev URL-je a `config.js`
  `CONFIG.R2_BASE_URL`-jében van (`https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`,
  nem egyedi domain).
- **Oldalgenerálás:** a főoldal (`index.html`) egyetlen statikus oldal, amely
  betölti a `lectures.json`-t (1384 rekord: `path, eloado, datum, ido, lectio,
  textus, megjegyzes, cim, kategoria, evkor, hossz_sec, tipus`), és az `app.js`
  kliensoldalon szűri/rendezi/lapozza. EMELLETT van egy Python oldalgenerátor,
  az `igehirdeto_generator.py` (gyökér), amely a `lectures.json`-ból legenerálja
  a 75 előadó-oldalt (`igehirdeto/<slug>/index.html`) és a gyűjtőoldalt
  (`igehirdetok/index.html`), az `igehirdeto.js` lejátszót, frissíti a
  `sitemap.xml`-t és a `style.css`-t. Idempotens. A főoldalon az előadó továbbra
  is elérhető szűrőként is (`speakerFilter` legördülő az `eloado` mezőre), de
  MOST MÁR van külön, indexelhető előadó-oldal is minden előadóhoz.
  A `lectures.json` MAGA nem generátorral készül: a `_forrasok/` mappában lévő
  `id3_teljes.py` (ID3 tag-kiolvasás → `id3_minden.json`) és egy Excel tábla
  (`Kelenref_FINAL.xlsx`) alapján állt össze egyszeri, kézi/Claude-asszisztált
  folyamattal — ez nem újrafuttatható parancs (ELLENTÉTBEN az
  igehirdeto_generator.py-val, ami az).

## Fejlesztői környezet
- VS Code + Claude Code extension + Filesystem MCP.
- Commitok GitHub Desktoppal a `main` branchre → GitHub Pages automata deploy.

## Deploy folyamat
1. Módosítás lokálisan (kód / sablon / generátor).
2. Ha az előadó-oldalak érintettek (pl. változott a lectures.json):
   `python igehirdeto_generator.py` futtatása a gyökérből.
3. Commit + push `main`-re GitHub Desktoppal.
4. GitHub Pages újraépít.

## Korlátok / döntések
- **Whisper-alapú transzkripció elhalasztva** — AMD GPU-val Windows alatt nem
  praktikus jelenleg. Nem lezárt, csak parkolva.
- Statikus oldal, tehát minden dinamikát (kereső, szűrés) kliensoldalon vagy
  előre generálva kell megoldani.

## Kapcsolódó
- [projectbrief](projectbrief.md) · [systemPatterns](systemPatterns.md) ·
  [activeContext](activeContext.md) · [progress](progress.md)
