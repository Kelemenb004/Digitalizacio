# kelenref100.hu — Teljes összefoglaló

*Digitális egyházi hangarchívum. Állapot: 2026-09-10.*

Ez a dokumentum a projekt teljes aktuális állapotát rögzíti: mi az, hogyan épül fel,
mi készült el, mi van hátra, és milyen csapdákra kell figyelni. Célja, hogy hosszabb
szünet után (vagy egy új közreműködő) percek alatt képbe kerüljön.

---

## 1. Mi ez a projekt?

A **kelenref100.hu** a Kelenföldi Református Egyházközség digitális hangarchívuma:
**1382 igehirdetés / előadás** (~997 óra) kereshető, böngészhető, online meghallgatható
formában. A felvételek 1990–2010 közöttiek, 75 igehirdetőtől.

**Fő funkciók:**
- Teljes szövegű keresés (cím, előadó, igehely, megjegyzés)
- Okos időszak-keresés (évszám + hónapnév felismerése a keresőmezőben)
- Szűrők: kategória, előadó, év, rendezés (dátum, előadó, hossz, véletlen)
- Igehely-linkelés a szentiras.eu-ra (összetett igehelyek is)
- Előadónkénti aloldalak (SEO + böngészés)
- Videók oldal (archív YouTube-felvételek)
- Spotify-szerű felhúzható lejátszó, reszponzív felület, sötét téma, PWA-alapok

---

## 2. Technikai architektúra

**Frontend:** statikus HTML/CSS/JS (nincs build-lépés, nincs keretrendszer).
- `index.html` — főoldal, hamburger-menüs szűrőpanel, mini-lejátszó + nagy lejátszó nézet
- `app.js` — teljes kliensoldali logika
- `style.css` — stílusok
- `config.js` — konfiguráció (INITIAL_PAGE_SIZE: 18, PAGE_SIZE: 50, SKIP_SECONDS: 10, háttérképek)
- `lectures.json` — az ADATBÁZIS (lásd 4. pont)
- `videok.json` — a videók adatai (6 videó)

**Hosting:**
- Statikus oldal → **GitHub Pages** (repo: `Kelemenb004/digitalizacio`)
- Hangfájlok (mp3, ~86 GB) → **Cloudflare R2**
- Domain → Rackhost, HTTPS-sel

**Cloudflare R2:**
- Nyilvános URL-bázis: `https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`
- rclone remote: `r2`, bucket: `hangarchivum`
- Költség: ~$0.45/hó (~165 Ft) — CSAK a tárolás fizetős; nincs egress-díj → a költség
  független a látogatottságtól.

**Generátor:** `igehirdeto_generator.py` — a lectures.json-ból legenerálja a 75 előadó-
oldalt, a gyűjtőoldalt, frissíti a sitemap-et és az `igehirdeto.js`-t. Ez a projekt ÉLŐ,
verziókövetett része.

**Munkafolyamat:**
1. Fejlesztés Claude segítségével (útmutatók, scriptek, kódrészletek)
2. Az alkalmazást Claude Code végzi a gépen (Filesystem MCP-vel közvetlen fájlelérés)
3. Commit + push MINDIG a felhasználó köre (GitHub Desktop) — Claude Code sosem commitol
4. Push előtt lokális teszt: `python -m http.server 8080`

---

## 3. Infrastruktúra-azonosítók (NE töröld)

- Google Search Console verifikáció: `content="kRf1ESJTB9PxL2Bj4gh1nic1Wt_YZo18i8t6R2Lob2Y"`
- GitHub: `Kelemenb004` / repo `digitalizacio`
- Domain: kelenref100.hu (Rackhost), CNAME a repóban
- Gyülekezet fő oldala: kelenref.hu (külön projekt)
- YouTube-csatorna: `https://www.youtube.com/channel/UCgxsQUUs2R8l6kT-hQr-Qlg`
- Projektmappa: `D:\programozas\Digitalizacio`

---

## 4. Adatszerkezet (lectures.json)

**Formátum:** TÖMÖR, egyetlen soros JSON (nincs behúzás), ~396 KB, 1382 rekord.
> KRITIKUS: minden író script `separators=(",", ":")` formátummal írjon, különben a
> fájl felduzzad és a git diff használhatatlanul nagy lesz.

**Rekord mezői:** `path, eloado, datum, ido, lectio, textus, megjegyzes, cim, kategoria,
evkor, hossz_sec, tipus`

**A 10 kategória:** Istentisztelet (903), Evangelizáció (170), Bibliaóra (128),
Különleges alkalom (63), Diakónia napok (30), Alliance Imahét (28), Bűnbánati hét (27),
Imahét (16), A reformáció hete (10), Ünnepi alkalom (7).

**Létező evkor értékek:** 1991-1999, 2000-2006, 2007-2010 (+ az új 207-hez: 2006-2013)
**Létező tipus értékek:** felvetel, kulonleges

---

## 5. Mi készült el (élesben)

### Alapok
- Teljes R2-feltöltés (~86 GB), domain HTTPS-sel
- szentiras.eu igehely-linkelés (összetett igehelyek + v.v. „válogatott versek")
- Teljes SEO: Schema.org, OpenGraph, sitemap, Search Console igazolva
- Vizuális megújulás: hero-kép pecséttel, hamburger-menü, favicon/PWA, mobil-optimalizáció
- CSP + Referrer-Policy
- Mappás URL: `/`, `/impresszum/`, `/igehirdetok/`, `/igehirdeto/<slug>/`, `/videok/`
- 75 indexelhető előadó-oldal, lábléc + impresszum
- Obsidian memory-bank a `docs/` mappában

### Keresés és szűrés
- **Időszak-keresés:** prefix-alapú év + hónapnév felismerés (`már`/`márc` → március,
  de `márk` = Márk evangélium NEM). A kereső szétválasztja a szöveget és a dátumot.
- **Év-szűrő** legördülő (dinamikusan az adatból)
- **Hossz-rendezés** két irányban

### Adattisztítás
- 2 üres (0 bájt) felvétel törlése (1384 → 1382)
- **Kategória-reform:** 45 → 10 kategória. Csak a `kategoria` mező íródott át (54 rekord),
  a `cim` érintetlen maradt.
- **Alkalom-sorozatok sorszámozása:** a 6 „hetes" kategóriában 64 sorozat / 261 felvétel
  kapott római sorszámot a CÍM végére (max 3 nap szünet a csoportosításhoz, dátum →
  időpont → kazettaszám sorrend). A magányos alkalmakról a beragadt sorszám levéve.
  A script IDEMPOTENS (újrafuttatva 0 módosítást ír).

### Videók oldal (/videok/)
- Külön `videok.json` (6 videó), a hamburger-menüben „Videók" gomb az Igehirdetők alatt
- **Poszteres beágyazás:** betöltéskor csak borítókép + play gomb; kattintásra töltődik be
  az iframe (youtube-nocookie.com, autoplay). Új videó indításakor az előző visszavált
  poszterre → SOHA nem szól egyszerre kettő. Gyorsabb + adatvédelmibb.
- Csatorna-gomb felül, külön bővített CSP CSAK ezen az oldalon (frame-src, img-src)
- Az 6 videó: Takaró Károly beiktatása I–II., Fogadalommegerősítő istentisztelet
  (1999.03.16), Istentisztelet (2001.08.05, Takaró Károly), 2 db 1989-es
  Debrecen-csapókerti evangelizáció

### Megosztás-élmény
- **`revealCard`**: ha a megosztott felvétel kártyája nincs kirenderelve, betölti/előhozza,
  majd görget és kiemel (just-shared pulzálás 2.6 mp)
- **Fejléc-tudatos görgetés** (`scrollCardIntoView`): a `--header-h` változóból számol
  (72px asztali / 116px mobil), hogy a kártya ne csússzon a fix fejléc alá
- **Autoplay-blokk kezelése:** a `NotAllowedError` némán kezelve (a böngésző interakció
  előtt nem indít hangot — ez nem hiba, a felhasználó a Lejátszás gombbal indítja)
- Erősebb `.lecture-card.is-active` kiemelés (3px arany keret + finom háttér)

### Logó = tiszta főoldal-reset
Ha van hash (`#felvetel=...`) vagy keresési paraméter → teljes újratöltés a tiszta
útvonalra (mindent nulláz). Ha már tiszta a főoldal → csak felgörget (nincs villanás).

### Háttérképek
- Két háttér: hero (felül, élesen) + mögöttes elmosott (a kártyák mögött)
- **Mindkettő ugyanabból a 9-es készletből** választ véletlenszerűen (a két sorsolás
  független, ezért néha egyezhet — ritka, nem zavaró)
- Új kép: `hero-kazetta-biblia.jpg` (kazetták + nyitott Károli-Biblia), optimalizálva
  4080×1836 6 MB → 1920×864 184 KB
- JAVÍTVA: a kód hivatkozott egy törölt képre (`296bbcb1-...jpg`) → néha üres hero

### Spotify-szerű felhúzható nagy lejátszó
**Kulcs-elv:** NINCS külön lejátszó — a nagy nézet UGYANAZT az `#audioElement`-et és
`state.current`-et vezérli, csak egy másik NÉZET. Csak a megjelenítést kell szinkronban
tartani.
- **Nyitás háromféleképp:** a cím/előadó részre kattintva, a felfelé-nyíl gombbal,
  vagy felfelé húzva (mobil)
- **Tartalom:** pecsét-logó „borító" (`pecset-logo.png`), kategória-jelvény, nagy cím,
  kattintható előadó-link, kattintható igehely (Lectió/Textus), dátum, nagy vezérlők
  (play/pause, ±10mp), idővonal, sebesség, megosztás, letöltés
- **Zárás:** lehúzó nyíl, Esc, lefelé húzás
- **Elrendezés:** egy-blokkos, függőlegesen középre igazított, kompakt arányok
  (pex-inner max-width 560px, pex-cover-img min(42vw,190px) padding 8px object-fit
  contain — hogy a pecsét körirata beférjen, pex-title 1.35rem)
- Új JS függvények: `cachePexDom, openPex, closePex, updatePexView, updatePexPlayIcon,
  setupExpandedPlayer, attachSwipe`
- Szinkron-pontok: `startPlaying` vége → updatePexView; `timeupdate` → pexProgress +
  pexTimeCurrent; `loadedmetadata` → pexTimeTotal; `play`/`pause` → updatePexPlayIcon;
  `stopPlayer` vége → closePex

### Mobil lejátszó-optimalizálás
- **Telefonos nyitás javítása:** a zárt `.player-expanded` `pointer-events: none`
  (nyitva `auto`) — enélkül elnyelte az érintést a mini-sáv fölött. Plusz
  `.audio-player { touch-action: pan-x }`, a nyíl-gomb `touchend`-re is, swipe-küszöb
  55→40px.
- **Spotius-szerű mini-sáv (768px alatt), B változat:** két soros — fent cím/előadó +
  vezérlők (−10/play/+10) + X, lent teljes szélességű idővonal. Rejtve: sebesség,
  hangerő, megosztás (a nagy nézetben elérhetők). A cím/előadó koppintható.
- **Hosszú igehely-fix:** a `.player-info` `flex: 1 1 0` (nem `auto`) + `max-width: 100%`
  a `.player-title`/`.player-speaker`-en — enélkül a hosszú lectio/textus szétfeszítette
  a sávot. A nyíl-gomb telefonon rejtve (order-ütközése is volt).

### KRITIKUS crash-fixek (telefon)
**A gyökér-ok:** a `revealCard` egy while-ciklusban addig töltött `loadMoreLectures()`-t,
amíg a kiválasztott felvétel kártyája előkerült. Ha a felvétel a lista végén volt
(pl. 1300. elem), az **1300+ kártya egyidejű renderelése** telefonon megfagyasztotta /
összeomlasztotta az oldalt (404-szerű hiba), és megszűnt az autolejátszás.

Mindkét érintett helyen ugyanaz a megoldás: **a felvétel a LISTA TETEJÉRE kerül**
(`state.filtered = [pick, ...többi]`, `state.page = 0`, `renderLectures`), majd
`requestAnimationFrame`-ben `scrollCardIntoView` + `just-shared` kiemelés.
- **`playRandomLecture`** — a random továbbra is a TELJES archívumból választ
- **`handleUrlHash`** (megosztott link) — ugyanígy
- A `revealCard` MAX_BETOLTES korlátja (4 adag) biztonsági hálónak megmarad

---

## 6. Ami hátravan

### A) A 207 hiányzó felvétel feltöltése — ELŐKÉSZÍTVE, feltöltésre kész

**A szűrési szabály:** a YouTube legrégebbi feltöltése **2013.03.28**. Ami ez UTÁNI, az
már fent van YouTube-on → NEM kell. Ami ez ELŐTTI és hiányzik a weboldalról → KELL.

**A leltár:** 1642 mp3 feldolgozva; 1048 a határ után (YouTube), 57 már megvan,
**207 HIÁNYZIK** (Takaró Károly 202, Szántó János 4, Takaró Tamás 1). Ebből 16 db a
„kész" 2006–2009 időszak LYUKA. Forrás: `hianyzo_2013_elott.csv` (pontosvesszős,
oszlopok: eloado;datum;ido;cim;igehely;cim_tipus;hossz_sec;fajlnev;path).

**A 207 rekord ELŐKÉSZÍTVE és ÁTVIZSGÁLVA:**
- Kategóriák: 193 Istentisztelet + 7 Bibliaóra + 2 Különleges alkalom + 2 Evangelizáció
  + 2 Diakónia napok + 1 Imahét
- Évkör: mind `2006-2013` (külön blokk, ahogy kérted)
- Path-séma: `3.KR_2006-2013/Előadó/ÉÉHHNN_ÓÓPP.mp3` (egy évkör-mappa, nem bontva tovább)
- Dátumtartomány: 2006-05-07 … 2013-03-27, 0 duplikátum, +125 óra 49 perc anyag
- Igehely: 93/207 rekordban, MIND normalizálva a szentiras.eu-linkeléshez

**A rekordépítés szabályai (amit alkalmaztunk):**
- A `dátumos` ID3-címek (154 db, pl. „Istentisztelet 2012.09.16. 9:00") → cím
  „Istentisztelet"
- A `üres` típus (29 db) → „Istentisztelet"
- A `tartalmi` (24 db) KETTÉVÁLT: 9 db elcsúszott ID3-szemét (`roly`, `óra`,
  `óra 30 perc`, `No01`, `11`, `ó`) → „Istentisztelet"; 14 db ÉRTÉKES cím megtartva:
  - Harcosképzés I.–V. → **Bibliaóra** (sorszám megtartva, látszik hogy sorozat)
  - Jézus ismeretében állva I.–II. → **Bibliaóra** („álva" → „állva" javítva)
  - Diakóniai napok 2011 – … → **Diakónia napok**
  - evangélizációs → **Evangelizáció**, imahét → **Imahét**
  - a többi → **Különleges alkalom**
  - Az igehely-szerű cím (Apcsel. 5:34-42) → cím „Istentisztelet", az igehely a textusba
- Az igehely `L.:`/`T.:` szétbontva lectio/textusra; ahol nincs jelölés, a textusba
- **Igehely-normalizálás** a meglévő stílusra: `2Tim.2,1-5.` → `2Timóteus 2:1-5`
  (vessző → kettőspont, záró pont le, könyvnév kiírva). Több körben tömtük be a réseket:
  a `Jn.15` pont-minta, az `1Jn`/`1Pt` szám-előtagok (hiányoztak a ROV térképből),
  a `Ján`/`Rm`/`sam` alakok, a szóközzel elválasztott dupla igehelyek. A csonka
  forrásadatok kézzel csinosítva (`12:9-` → `12:9`, `2Korintus 5.10,11,17` →
  `2Korintus 5:10; 5:11; 5:17`, `Titusz 2:11-14. 3,3` → `Titusz 2:11-14; 3:3`).

**Átadott fájlok a feltöltéshez** (mind az outputs mappában):
- `uj_207_rekord.json` — a 207 kész rekord
- `r2_feltoltes.sh` — 207 rclone-parancs (fájlonként, PONTOSAN a 207-et tölti)
- `r2_feltoltes_lista.json` — forrás→cél párok ellenőrzéshez
- `FELTOLTES_207_utmutato.md` — a teljes 6 lépéses menet

**A 6 lépés:**
1. **R2-feltöltés:** `bash r2_feltoltes.sh`. FONTOS: a fájlonkénti feltöltés a
   biztonságos — a mappa-szintű `rclone copy` felvinné a 2013 UTÁNI (YouTube-on lévő)
   felvételeket is! Ellenőrzés: `rclone ls "r2:hangarchivum/3.KR_2006-2013/" | wc -l` → 207
2. **lectures.json bővítés:** 1382 → 1589, path-alapú duplikátum-szűréssel, TÖMÖR
   formátumban (`separators=(',', ':')`). Előtte: `copy lectures.json lectures.json.bak_207`
3. **Generátor futtatás:** `python igehirdeto_generator.py`
4. **Lokális teszt:** felvételszám ~1589, „Harcosképzés" keresés → az 5 részes sorozat,
   2012-es dátum-keresés, igehely-linkek működnek, új felvétel lejátszható (R2 OK)
5. **Impresszum frissítés:** a felső határ 2010 → **2013**! Az „Az oldal" szekcióban az
   „1990–2010" mondatot át kell írni.
6. **Commit + push** (GitHub Desktop)

### B) Search Console — indexelés

**Aktuális állapot (2026-09):** 1 oldal indexelt (a főoldal), 79 nem indexelt, 2 okból:
- **„Nem található (404)" — 1 oldal: `/impresszum.html`**
  Ártalmatlan régi szellem-URL: a projekt mappás struktúrát használ (`/impresszum/`),
  a `.html`-es alak sosem létezett. A Google egy régi hivatkozásból ismeri.
  Teendő: max. ellenőrizni hogy a sitemap a helyes `/impresszum/`-ot tartalmazza-e.
  (GitHub Pages nem támogat natív 301-et, egy fantom-URL-ért nem éri meg trükközni.)
- **„Felfedezve – jelenleg nincs indexelve" — 78 oldal (az előadó-oldalak)**
  NEM hiba: a Google ismeri őket, de még nem járta be. Tipikus új, alacsony tekintélyű
  oldalnál.

**Javaslatok hatás szerint:**
1. **A legerősebb: backlink a kelenref.hu-ról** (a gyülekezet fő oldaláról egy link a
   hangarchívumra). Tekintélyt és bejárási ösztönzést ad. SZERVEZÉSI lépés.
2. Az előadó-oldalak egyedibbé tétele a generátorral (egyedi bevezető, felvételszám,
   gyakori igehelyek) — csökkenti a „vékony/hasonló tartalom" gyanút. TECHNIKAI.
3. Kézi indexelés-kérés néhány kulcsoldalra (GSC URL-ellenőrző).
4. Türelem: friss oldalnál gyakran magától javul.

**Amit NE:** tömeges újraindexelés-kérés, napi „Indexelés kérése" minden URL-re.

### C) Távoli ötletek
- Hang-szöveg átirat (Whisper) — elhalasztva (AMD RX580, nincs CUDA Windows-on, a CPU
  túl lassú a ~997 órához)

---

## 7. Ismert csapdák (FONTOS)

1. **A lectures.json TÖMÖR, egysoros JSON.** Minden író script `separators=(",", ":")`-vel
   írjon, különben felduzzad és óriási lesz a git diff.
2. **A BIBLIAI_KONYVEK térkép KÉT helyen létezik** (app.js + igehirdeto_generator.py),
   és MINDIG szinkronban kell lennie (147-147 bejegyzés).
3. **A kategoria mező korábban a cim-ből lett átmásolva** (ezért volt 45 kategória).
   A reform után: a kategória a csoportosítás, a cim hordozza a részletet.
4. **Az igehely-linkelés kezel összetett + v.v. eseteket** — új igehely-adatnál ügyelni
   kell a formátumra.
5. **Commit/push mindig a felhasználó köre** (GitHub Desktop), Claude Code sosem commitol.
6. **Ideiglenes fájlok nem verziókövetettek:** `*.bak_*`, leltár-CSV-k, egyszeri `*.py` —
   KIVÉVE az `igehirdeto_generator.py`-t.
7. **ÚJ képfájlt kézzel hozzá kell adni a githez!** A `pecset-logo.png` hiánya miatt a
   nagy lejátszó pecsétje élesben 404-elt (lokálisan működött). Push előtt ellenőrizd:
   `git ls-files images/ | grep <fájlnév>`
8. **Telefon-crash veszély:** SOHA ne rendereljünk ki több száz kártyát egyszerre.
   A mélyen lévő felvételt a lista TETEJÉRE kell emelni, nem odáig betölteni.
9. **A localhost + böngésző-cache összeakadhat** a `#felvetel=` hash-linknél — teszteléskor
   hard refresh (Ctrl+Shift+R), mert a hash-változás önmagában nem tölti újra az oldalt.

---

## 8. Kulcsfüggvények (app.js) — gyors referencia

**Kártya/lista:** `createCard`, `renderLectures`, `loadMoreLectures`, `applyFilters`,
`sortLectures`, `populateFilters`, `refreshFilterOptions`, `resetFilters`, `findCard`
**Igehely:** `igehelySzakaszok`, `konyvRovidites`, `renderIgehely`, `valogatottVersek`,
`BIBLIAI_KONYVEK` (147 elem)
**Keresés:** `parseDatumKereses`, `HONAP_NEVEK`, `honapPrefix`, `normalizeStr`
**Lejátszó:** `startPlaying`, `togglePlayPause`, `stopPlayer`, `updateCardStates`,
`audioUrl` (path → R2 URL, encodeURIComponent szegmensenként), `downloadLecture`,
`shareLecture`
**Nagy lejátszó:** `cachePexDom`, `openPex`, `closePex`, `updatePexView`,
`updatePexPlayIcon`, `setupExpandedPlayer`, `attachSwipe`
**Navigáció:** `revealCard`, `scrollCardIntoView`, `handleUrlHash`, `goHome`,
`playRandomLecture`
**Háttér:** `initHeroBackground`, `initBackground`, `HERO_BACKGROUNDS`
**Segéd:** `formatDate`, `formatTime`, `escHtml`, `slugify`

**CSS-változók:** `--header-h` (72px / 116px mobil), `--player-h` (90px), `--navy`,
`--navy-dark`, `--gold`, `--gold-light`, `--cream`, `--text-invert`, sötét mód.

---

## 9. Fájlstruktúra (D:\programozas\Digitalizacio)

```
index.html, style.css, app.js, config.js
lectures.json            <- az adatbázis (TÖMÖR JSON, 1382 rekord)
videok.json              <- a videók adatai (6 videó)
CNAME, robots.txt, sitemap.xml, README.md
CLAUDE.md                <- a memory-bank gyökere
.gitignore               <- *.py kizárva (kivéve igehirdeto_generator.py); *.bak_*; CSV-k
igehirdeto_generator.py  <- az ÉLŐ generátor (verziókövetett)
images/                  <- hero-1..4.jpg, hero-kazetta.jpg, hero-kazetta-biblia.jpg,
                            3 UUID-s jpg, pecset-logo.png, pecset-logo-transparent.png,
                            logo.png, logo-dark.png, hatterkep og picture.JPG (OG-kép)
docs/                    <- Obsidian memory-bank (activeContext, progress, projectbrief,
                            systemPatterns, techContext)
igehirdeto/              <- generált előadó-oldalak (75 mappa)
igehirdetok/             <- gyűjtőoldal
impresszum/
videok/                  <- a videók oldal
```

---

## 10. Gyors indítás egy új munkamenethez

> Folytatjuk a kelenref100.hu-t. A 207 hiányzó (2013.03.28 előtti) felvétel feltöltése
> van hátra — a rekordok elő vannak készítve (uj_207_rekord.json), a feltöltő script kész
> (r2_feltoltes.sh). A menet a FELTOLTES_207_utmutato.md-ben van.

---

*A napi munka részletei a projekt `docs/` mappájában (activeContext.md, progress.md)
frissülnek — mindig az a mérvadó.*
