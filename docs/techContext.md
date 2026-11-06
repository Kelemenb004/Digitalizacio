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
  `hossz_sec`, `keparany` (pl. `"4:3"`), `poszter` (`/images/...`),
  `szovegkonyv` (a lapozható olvasó, pl. `/szovegkonyv/chronica-hominis/` → „Szövegkönyv”
  gomb, ugyanazon a lapon; vagy egy `/dokumentumok/*.pdf` → „Szövegkönyv (PDF)”, új lapon).
  2026-11-06: első kiemelt tétel a jubileumi színdarab, „Chronica hominis – Történetek
  Ember Ádámról” (Friderikusz Nándor; YouTube `88kX0Mclpp8`; bemutató 2026-10-16),
  saját borító: `images/chronica-hominis.webp` (a plakátból, `_forrasok/chronica_borito_javitas.py`:
  enyhe zajszűrés + élesítés, 1600×900; forrás: `_forrasok/chronica-hominis-borito-eredeti.jpg`).
  Hivatalos szövegkönyve: `dokumentumok/chronica-hominis-szovegkonyv.pdf` (74 oldal, A4).
  Főoldali sáv = lapozós, végtelenített körhinta (`korhinta()` a `videok.js`-ben,
  `#filmekKarusszel`): egyszerre egy videó középen, asztalon a szomszédok halványan
  (felirat nélkül) bekandikálnak; nyilak, pontok, húzás (ujj/egér), ←/→; két szélén
  2-2 klón dia, az átmenet után átmenet nélkül visszaugrik a valódira
  (`.karusszel--azonnal`). Diaváltáskor a lejátszott videó megáll. A sorrend a
  `videok.json` sorrendje (a legfrissebb legyen elöl). Egy kiemelt tételnél nincs lapozó.
  2026-10: a két Sebestyén Andor-kori (1926–1954) némafilm, az eredeti fájl
  változatlanul az R2 `filmek/` mappájában (forrás: Illés Barna digitalizálása;
  a 02-es, német film nem került fel). Teljes letöltés-védelem a weben nincs —
  ez az átlagos látogatót tartja vissza.
  CSP: a főoldalon és a Videók oldalon `frame-src https://www.youtube-nocookie.com`,
  `img-src https://i.ytimg.com`, a `media-src` az R2-t engedi. A közös
  lejátszó-stílusok (`.video-embed`, `.video-poster`, `.video-play`) a `style.css` végén.
- **Lapozható szövegkönyv (2026-11-06):** `/szovegkonyv/chronica-hominis/` – saját oldal
  (`lapozo.js` + `lapozo.css`, közös, más szövegkönyvhöz is jó: a `#konyv` data-attribútumai:
  `data-oldalak`, `data-arany`, `data-kep`, `data-nagy`). Az oldalak előre elkészített képek
  (`_forrasok/szovegkonyv_oldalak.py <pdf> <célmappa>`: pdftoppm 240 dpi → `oldalak/NNN.webp`
  1100 px a lapozáshoz, `nagy/NNN.webp` 1800 px csak nagyításhoz; KÉPET A GÉPEN KELL GENERÁLNI).
  Gépen/fekvő tableten kétoldalas könyv (a lap a gerinc körül 3D-ben átfordul, előtte/utána
  árnyék, lapélek), telefonon egy oldal (a lap a bal szélén fordul el), fekvő telefonon az oldal
  kitölti a szélességet és görgethető. Lapozás: húzás (a megfogott pont követi az ujjat,
  pöccintés is), koppintás a szélekre, nyilak, ←/→/Home/End, csúszka; `#oldalszám` a címben.
  Fekvő telefonon (magasság < 520 px) soha nem kétoldalas, hanem teljes szélesség + görgetés.
  Nagyítás 100–300%: + / − gomb (lépcsők 125/150/200/250/300%, a képernyő közepe marad),
  két ujjal (a böngésző saját nagyítása ki van kapcsolva – touch-action + iOS gesture* –,
  így a fejléc és a lapozó sáv a helyén marad), Ctrl+görgő, dupla koppintás (150% / vissza).
  Nagyítva a lap natívan görgethető; lapozni a nyilakkal, vagy a lap széléig görgetve még
  egy húzással lehet. Androidon a vissza gomb a nagyítást állítja vissza. Csak transform/
  opacity animál; a környező oldalak képe sorrendben előtöltődik (előbb a látható).
  PDF letöltés gomb a fejlécben. Helyi próba: `_forrasok/helyi_szerver.bat` (localhost:8000).
- **Telepíthető alkalmazás (PWA, 2026-10-18):** `manifest.json` (id/scope `/`,
  ikonok 192/512 + maskable), `telepites.js` (a `beforeinstallprompt` elkapása; a gomb
  ezzel hívja a böngésző telepítő ablakát, ha nincs ilyen – iPhone, Firefox, korai
  látogatás –, platformfüggő útmutatót mutat; Messenger/Facebook belső böngészőjére
  figyelmeztet), `sw.js` (a Chrome telepítő ablakához kell fetch-kezelő; csak a
  navigációs kéréseket figyeli, hiba esetén `offline.html`; a hang/videó/kép kéréseket
  nem érinti, semmit nem gyorsítótáraz a tartalomból). iOS: `apple-mobile-web-app-title`
  = „Hangarchívum”. A manifest egyelőre csak a főoldalon van belinkelve. A gomb fő helye
  a fejléc alatti sáv (`#installSav`, nem ragadós – görgetéskor nem foglal helyet).
- **Tekerés (2026-10-18):** a két pozíció-csúszka (`#progressBar`, `#pexProgress`) közös
  vezérlője az `app.js` `tekeroCsuszka()` függvénye: pointer-eseményekkel húzás közben
  csak kijelez (a `timeupdate` ilyenkor és `audio.seeking` alatt nem írja felül), az
  ugrás elengedéskor egyszer történik; koppintásra is ugrik (iOS-en is). Érinthető
  terület 26/30 px, a látható csík háttérképként rajzolódik; `touch-action: none`;
  a lejátszó fel/le húzó gesztusa csúszkán indított érintésre nem reagál.
- **Lejátszó-finomítások (2026-10-18, `app.js`):** egyenletes sáv (`requestAnimationFrame`,
  csak lejátszás alatt és látható lapon); a betöltött rész halvány csíkkal (`pufferSzazalek`);
  töltés-jelzés (`toltesJelzes` → `.tolt` forgó kör a play gombon); időbuborék húzáskor /
  egérrel (`buborek`); finom rezgés Androidon (`rezges`); Media Session (lezárt képernyő,
  értesítés, fülhallgató-gombok: play/pause, ±10 mp, tekerés, sorozatnál előző/következő);
  nagy nézet: kategóriaszínű háttér (`pexSzinezes`, `--pex-tint`), lejátszáskor „kinyíló”
  borító, ujjkövető lehúzás (`pexHuzas`: 140 px vagy gyors mozdulat → zár, különben visszapattan).
- **Sorozatok:** `sorozatBont` / `sorozatSzomszed` – „… IV.” (római) vagy „…, 4. rész” forma,
  azonos cím-alap, sorszám ±1, legfeljebb 62 nap eltérés (a különböző évek azonos nevű
  sorozatai így nem keverednek; az előadó eltérhet). 407 sorozatrész, ebből 312-nek van
  következő része. A nagy nézetben „‹ Előző rész / Következő rész ›”; a felvétel végén
  8 mp-es ajánló („Lejátszás” / „Mégse”), utána magától indul a következő rész.
- **Megtekintés-számláló (2026-10-30):** a ☰ menü alján szem ikon + szám (`szamlalo.js`).
  Háttér: Cloudflare Worker `kelenref-szamlalo` (`https://kelenref-szamlalo.kelemen-botond04.workers.dev`)
  + D1 adatbázis `kelenref-szamlalo` (táblák: `szamlalo`, `napi`); forrás és leírás: `szamlalo/`
  (a Jekyll kizárja). Az élő oldal minden főoldal-megnyitásnál `POST /hit`; más origin → 403.
  Kezdőérték 156 (Search Console összes kattintás, 2026-10-30). A cím a `config.js`
  `SZAMLALO_URL`-jében és az index CSP `connect-src`-jében. Személyes adatot nem tárol.

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
