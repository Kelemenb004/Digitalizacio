# kelenref100.hu — projekt memória (CLAUDE.md)

Ezt a fájlt a Claude Code minden session elején automatikusan beolvassa, ezért
tartsd tömören és magas jelértékűen (cél: ~200 sor / 5k token alatt). A részletes
kontextus a `docs/` mappában van — azt **csak akkor olvasd be, amikor a feladathoz
ténylegesen kell**, nem alapból.

## Mi ez
Statikus hangarchívum-weboldal a Budapest-Kelenföldi Református Egyházközség
igehirdetéseinek. A "100" a kelenref100.hu névben a gyülekezet 100 éves
jubileumára utal ("100 éve Krisztussal" — ld. a pecsét-logó alt szövege).
~2677 hangfelvétel (~1900 óra, 1990–2017), ~105 igehirdetőtől. A főoldal (`index.html`) egyoldalas
alkalmazás kliensoldali kereséssel/szűréssel. EMELLETT van ~105 statikusan
GENERÁLT előadó-oldal (`igehirdeto/<slug>/index.html`) és egy gyűjtőoldal
(`igehirdetok/index.html`), amelyeket az `igehirdeto_generator.py` állít elő
a `lectures.json`-ból — ezek SEO-célú, indexelhető, mappás URL-ű oldalak.
Az audio nem a repóban van, hanem Cloudflare R2-n.

## Tech stack
- Frontend: statikus HTML/CSS/vanilla JS (`index.html`, `app.js`, `style.css`,
  `config.js`), nincs build lépés, nincs framework.
- Hosting: GitHub Pages (repo: `Kelemenb004/Digitalizacio`), egyedi domain
  `kelenref100.hu` a `CNAME` fájlon keresztül.
- Média: Cloudflare R2 publikus bucket (`hangarchivum`, rclone remote `r2`), URL:
  `config.js` → `CONFIG.R2_BASE_URL` (`https://pub-...r2.dev`). Mappák:
  `1.KR_1991-`, `2.KR_2000-`, `3.KR_2007-` (saját kazettás digitalizálás),
  `4.KR_2006-2013` (207 digitális felvétel), `5.KR_2008-2017` (a gyülekezet
  pendrive-ja, régi kelenref.hu). rclone: `--s3-no-check-bucket` kell.
- Adat: `lectures.json` (2677 rekord, TÖMÖR egysoros JSON, mezők: `path, eloado, datum, ido, lectio,
  textus, megjegyzes, cim, kategoria, evkor, hossz_sec, tipus`) — ezt tölti be
  és szűri/rendezi kliensoldalon az `app.js`.
- Oldalgenerátor: `igehirdeto_generator.py` (a gyökérben) — a `lectures.json`-ból
  legenerálja az előadó-oldalakat (`igehirdeto/<slug>/index.html`), a
  gyűjtőoldalt (`igehirdetok/index.html`), az `igehirdeto.js` lejátszót,
  frissíti a `sitemap.xml`-t és hozzáfűzi a stílusokat a `style.css`-hez.
  Idempotens (újrafuttatható). A `lectures.json` MAGA a `_forrasok/`
  ID3-scriptekből és Excelből állt össze egyszeri folyamattal (az nem
  újrafuttatható).
- SEO: sitemap.xml (főoldal + igehirdetok/ + impresszum/ + előadó-oldalak, a
  generátor írja), meta tagek, JSON-LD, Google Search Console. Megszűnt
  előadó-oldal helyére a generátor átirányító oldalt tesz (`ATIRANYITAS`).
- Videók: `videok.json`, kétféle tétel: YouTube (`id`) vagy saját videó az
  R2-ről (`tipus: "video"`, `src: "filmek/…mp4"`). Közös mezők: `cim, alkalom,
  datum, eloado, megjegyzes`, opcionális `hossz_sec`, `kiemelt: true`,
  `keparany`, `poszter`. Megjelenítés: `videok.js` (közös) — a `/videok/` oldal
  listája, és a `kiemelt: true` tételek a főoldalon is, a nyitókép alatti ünnepi
  filmsávban (`#filmekSection`; keresés/szűrés közben rejtve). Kattintásig nem
  tölt semmit; egyszerre egy videó szól, a hanglejátszóval kölcsönösen
  megállítják egymást. A saját videóknál nincs letöltés gomb és jobb klikkes
  mentés (`controlslist="nodownload"`) — szándékosan NEM úgy, mint a hanganyagok.
- A két Sebestyén Andor-kori némafilm (R2: `filmek/sebestyen-andor-1.mp4`, `-2.mp4`)
  az eredeti digitalizált fájl VÁLTOZATLANUL — a felhasználó kérésére a videókat
  nem kódoljuk át, nem vágjuk, nem javítjuk. Feltöltés: `_forrasok/r2_filmek_feltoltes.sh`.
  A forrás mp4-ek a gyökérben vannak, a `.gitignore` kizárja őket (GitHub: max. 100 MB/fájl).
- Fejlesztés: VS Code + Claude Code + Filesystem MCP, commit GitHub Desktoppal.

## Konvenciók / szabályok
- `index.html`, `app.js`, `style.css`, `config.js` **kézzel szerkesztett**
  fájlok — nincs sablon/generátor, amit helyettük módosítani kellene.
- A gyökérben lévő `*.py` scriptek (`kepfeldolgozas.py`, `hero_tomorites.py`,
  `logo_favicon.py`, `pwa_ikonok.py`) kép-/ikon-feldolgozó egyszeri
  segédeszközök (Pillow), nem oldalgenerátorok. A `.gitignore` `*.py`-t kizár,
  a `kepfeldolgozas.py` kivétel, mert korábban lett trackelve.
- A `_forrasok/` mappa a `lectures.json` forrásanyaga (Excel, ID3 riportok) —
  fejlesztői/archív cucc, nem a publikált oldal része. Az `_archiv/` mappa
  (gitignore-olt) a régi útmutatók, egyszeri scriptek és `.bak_*` mentések helye.
- HIVATALOS FORRÁS: a gyülekezettől kapott `Kelenref_Prédikációk.xlsx` (régi
  kelenref.hu katalógus, 2008–2019) jóváhagyott — cím/idő/igehely ehhez igazodik;
  igehirdetőt nem írunk át, igehelyet csak érdemi eltérésnél. Ha a saját kazettás
  és a gyülekezeti felvétel ugyanaz, a kazettás marad.
- URL-struktúra (mappás, tiszta): `/`, `/impresszum/`, `/igehirdetok/`,
  `/igehirdeto/<slug>/`, plusz mélylink `#felvetel=<encodeURIComponent(path)>`.
  Az indexelés már fut — meglévő URL-t ne törölj/nevezz át redirect nélkül.
- Ha a `lectures.json` változik, az előadó-oldalak frissítéséhez futtasd
  újra: `python igehirdeto_generator.py` (a gyökérből). A generált oldalakat
  NE szerkeszd kézzel — a generátort módosítsd.
- Nagy vagy generált fájlokat (pl. `lectures.json`, tömeges data-dumpok) ne
  olvass be feleslegesen a kontextusba.

## Kulcsparancsok
- Előadó-oldalak generálása: `python igehirdeto_generator.py` (a projekt
  gyökeréből, idempotens).
- A főoldal (`index.html`/`app.js`/`style.css`) továbbra is közvetlenül
  szerkesztett, nincs sablon.
- Lokális preview: `python -m http.server 8080`, majd `http://localhost:8080`.
- Deploy: push a `main` branchre → GitHub Pages automatikusan build-el.

## Munkamódszer
- Lépésenként dolgozz; nagyobb változtatás előtt erősítsd meg velem a tervet.
- Ha új tartós tényt tudsz meg a projektről, azt a megfelelő `docs/` fájlba írd,
  ne ebbe — ez maradjon rövid.

## Részletes kontextus (csak kérésre olvasd be)
- [docs/projectbrief.md](docs/projectbrief.md) — mit és miért
- [docs/techContext.md](docs/techContext.md) — stack és felépítés részletei
- [docs/systemPatterns.md](docs/systemPatterns.md) — generálás és URL-séma
- [docs/activeContext.md](docs/activeContext.md) — jelenlegi fókusz, következő lépések
- [docs/progress.md](docs/progress.md) — mi kész, mi hátravan, ismert hibák
