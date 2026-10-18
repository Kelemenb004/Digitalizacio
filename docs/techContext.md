# Technikai kontextus — kelenref100.hu

## Stack
- **Frontend:** statikus HTML/CSS/vanilla JS (nincs backend futásidőben, nincs
  build lépés, nincs framework). Fő fájlok: `index.html`, `app.js` (~1000
  sor, a teljes UI-logika), `style.css`, `config.js` (beállítások),
  `impresszum/index.html` (különálló statikus oldal).
- **Hosting:** GitHub Pages, repo: `Kelemenb004/Digitalizacio`. Egyedi domain
  `kelenref100.hu` a `CNAME` fájlon keresztül.
- **Média:** Cloudflare R2 publikus bucket (~2677 felvétel, 5 évkör-mappa – ld. CLAUDE.md). Az audio
  közvetlenül R2-ről szolgálódik, a bucket dev URL-je a `config.js`
  `CONFIG.R2_BASE_URL`-jében van (`https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`,
  nem egyedi domain).
- **Oldalgenerálás:** a főoldal (`index.html`) egyetlen statikus oldal, amely
  betölti a `lectures.json`-t (2677 rekord: `path, eloado, datum, ido, lectio,
  textus, megjegyzes, cim, kategoria, evkor, hossz_sec, tipus`), és az `app.js`
  kliensoldalon szűri/rendezi/lapozza. EMELLETT van egy Python oldalgenerátor,
  az `igehirdeto_generator.py` (gyökér), amely a `lectures.json`-ból legenerálja
  az előadó-oldalakat (~105) (`igehirdeto/<slug>/index.html`) és a gyűjtőoldalt
  (`igehirdetok/index.html`), az `igehirdeto.js` lejátszót, frissíti a
  `sitemap.xml`-t és a `style.css`-t. Idempotens. A főoldalon az előadó továbbra
  is elérhető szűrőként is (`speakerFilter` legördülő az `eloado` mezőre), de
  MOST MÁR van külön, indexelhető előadó-oldal is minden előadóhoz.
  A `lectures.json` MAGA nem generátorral készül: a `_forrasok/` mappában lévő
  `id3_teljes.py` (ID3 tag-kiolvasás → `id3_minden.json`) és egy Excel tábla
  (`Kelenref_FINAL.xlsx`) alapján állt össze egyszeri, kézi/Claude-asszisztált
  folyamattal — ez nem újrafuttatható parancs (ELLENTÉTBEN az
  igehirdeto_generator.py-val, ami az).
- **Videók:** a `videok.json` (kézzel szerkesztett) listát a közös `videok.js`
  jeleníti meg: a `/videok/` oldalon (kiemeltek elöl, külön blokkban) és a
  főoldalon a `kiemelt: true` tételeket a nyitókép alatti ünnepi filmsávban.
  Kétféle tétel: YouTube (`id`, youtube-nocookie iframe, csak kattintásra) és
  saját videó az R2-ről (`tipus: "video"`, `src: "filmek/…mp4"`, `<video>` elem
  `controlslist="nodownload"`-dal, jobb klikk tiltva; az R2-cím a `config.js`-ből,
  ezért a Videók oldal is betölti a `config.js`-t). Opcionális mezők: `kiemelt`,
  `hossz_sec`, `keparany` (pl. `"4:3"`), `poszter` (`/images/...`).
  2026-10: a két Sebestyén Andor-kori (1926–1954) némafilm, az eredeti fájl
  változatlanul az R2 `filmek/` mappájában (forrás: Illés Barna digitalizálása;
  a 02-es, német film nem került fel). Teljes letöltés-védelem a weben nincs —
  ez az átlagos látogatót tartja vissza.
  CSP: a főoldalon és a Videók oldalon `frame-src https://www.youtube-nocookie.com`,
  `img-src https://i.ytimg.com`, a `media-src` az R2-t engedi. A közös
  lejátszó-stílusok (`.video-embed`, `.video-poster`, `.video-play`) a `style.css` végén.
- **Telepíthető alkalmazás (PWA, 2026-10-18):** `manifest.json` (id/scope `/`,
  ikonok 192/512 + maskable), `telepites.js` (a `beforeinstallprompt` elkapása; a gomb
  ezzel hívja a böngésző telepítő ablakát, ha nincs ilyen – iPhone, Firefox, korai
  látogatás –, platformfüggő útmutatót mutat; Messenger/Facebook belső böngészőjére
  figyelmeztet), `sw.js` (a Chrome telepítő ablakához kell fetch-kezelő; csak a
  navigációs kéréseket figyeli, hiba esetén `offline.html`; a hang/videó/kép kéréseket
  nem érinti, semmit nem gyorsítótáraz a tartalomból). iOS: `apple-mobile-web-app-title`
  = „Hangarchívum”. A manifest egyelőre csak a főoldalon van belinkelve. A gomb fő helye
  a fejléc alatti sáv (`#installSav`, nem ragadós – görgetéskor nem foglal helyet).

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
