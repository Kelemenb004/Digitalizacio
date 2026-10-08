# kelenref100.hu — Átadó összefoglaló

*Állapot: 2026-09-23. Ez a dokumentum egy chat-menet lezárása. A következő munkamenet
ebből indul.*

---

## 1. ALAPOK

**Mi ez:** a Budapest-Kelenföldi Református Egyházközség digitális hangarchívuma.
**1589 igehirdetés / előadás**, ~1123 óra hanganyag, 1990–2013 közötti felvételek,
76 igehirdetőtől. Kereshető, szűrhető, online hallgatható.

**Technika:** statikus HTML/CSS/JS, nincs build-lépés, nincs keretrendszer.
- `index.html`, `app.js`, `style.css`, `config.js`
- `lectures.json` — az adatbázis (TÖMÖR, egysoros JSON, 1589 rekord)
- `videok.json` — a videók adatai (10 videó)
- `igehirdeto_generator.py` — az ÉLŐ generátor (ez az egyetlen verziókövetett .py)

**Hosting:**
- Statikus oldal → GitHub Pages (repo: `Kelemenb004/digitalizacio`)
- Hangfájlok (mp3) → Cloudflare R2, bucket: `hangarchivum` (EEUR)
- Domain: kelenref100.hu (Rackhost), HTTPS
- R2 költség ~$0.45/hó — csak a tárolás fizetős, nincs egress-díj

**Azonosítók (NE töröld):**
- Google Search Console verifikáció: `content="kRf1ESJTB9PxL2Bj4gh1nic1Wt_YZo18i8t6R2Lob2Y"`
- R2 nyilvános URL-bázis: `https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`
- rclone remote: `r2`, bucket: `hangarchivum`
- YouTube-csatorna: `https://www.youtube.com/channel/UCgxsQUUs2R8l6kT-hQr-Qlg`
- Gyülekezet fő oldala: kelenref.hu (külön projekt)
- Projektmappa: `D:\programozas\Digitalizacio`

**Munkafolyamat:**
1. Claude útmutatót/scriptet ad
2. Claude Code alkalmazza a gépen (Filesystem MCP-vel közvetlen fájlelérés)
3. **Commit + push MINDIG a felhasználó köre** (GitHub Desktop) — Claude Code sosem commitol
4. Push előtt lokális teszt: `python -m http.server 8080`

**Adatszerkezet (lectures.json rekord, 12 mező):**
`path, eloado, datum, ido, lectio, textus, megjegyzes, cim, kategoria, evkor, hossz_sec, tipus`

**R2 mappaszerkezet:**
`1.KR_1991-`, `2.KR_2000-`, `3.KR_2007-`, `4.KR_2006-2013` (az új blokk)

**A 10 kategória:** Istentisztelet, Evangelizáció, Bibliaóra, Különleges alkalom,
Diakónia napok, Alliance Imahét, Bűnbánati hét, Imahét, A reformáció hete, Ünnepi alkalom

---

## 2. AMI EBBEN A MENETBEN ELKÉSZÜLT

### A 207 hiányzó felvétel feltöltése — KÉSZ, ÉLESBEN (2026-09-23)
Ez volt a legnagyobb hátralévő tartalmi blokk. Lezárva.

- **Forrás:** E: meghajtó, `hianyzo_2013_elott.csv` (a korábbi leltárból)
- **Szűrési szabály:** a YouTube legrégebbi feltöltése 2013.03.28 — ami ez utáni, az már
  fent van YouTube-on, nem kell. Ami ez előtti és hiányzott → ez a 207.
- **Eredmény:** lectures.json 1382 → **1589**, +125 óra 49 perc anyag
- **Előadók:** Takaró Károly 202, Szántó János 4, Takaró Tamás 1
- **Kategóriák:** 193 Istentisztelet + 7 Bibliaóra + 2 Különleges alkalom +
  2 Evangelizáció + 2 Diakónia napok + 1 Imahét
- **Évkör:** mind `2006-2013` (szándékosan külön blokk)
- **Path-séma:** `4.KR_2006-2013/<Előadó>/<ÉÉHHNN_ÓÓPP>.mp3`
- **Szántó János új előadó-oldalt kapott**, sitemap 78 → 79 URL
- Az impresszum már 1990–2013-at ír

**A rekordépítés szabályai (ha valaha újra kell csinálni):**
- A `dátumos` ID3-címek (154 db, pl. "Istentisztelet 2012.09.16. 9:00") → cím: "Istentisztelet"
- Az `üres` típus (29 db) → "Istentisztelet"
- A `tartalmi` (24 db) kettévált: 9 db elcsúszott ID3-szemét (`roly`, `óra`, `No01`, `11`,
  `ó`) → "Istentisztelet"; **14 db értékes cím megtartva**:
  - Harcosképzés I.–V. → Bibliaóra (sorszám megtartva)
  - Jézus ismeretében állva I.–II. → Bibliaóra ("álva" → "állva" javítva)
  - Diakóniai napok 2011 – … → Diakónia napok
  - evangélizációs → Evangelizáció, imahét → Imahét
  - a többi → Különleges alkalom
  - Az igehely-szerű cím (Apcsel. 5:34-42) → cím "Istentisztelet", az igehely a textusba
- Az igehely `L.:`/`T.:` szétbontva lectio/textusra; jelölés nélkül a textusba
- **Igehely-normalizálás** a meglévő stílusra: `2Tim.2,1-5.` → `2Timóteus 2:1-5`
- A `tipus` mező: `felvetel` az istentiszteleteknél, `kulonleges` a 14 egyedinél

### Videók oldal (/videok/) — KÉSZ
- Külön `videok.json`, jelenleg **10 videó** (Sebestyén Andor-kori felvételek is)
- **Poszteres beágyazás:** betöltéskor csak borítókép + play gomb; kattintásra töltődik be
  az iframe (youtube-nocookie.com). Új videó indításakor az előző visszavált poszterre →
  soha nem szól egyszerre kettő. Gyorsabb + adatvédelmibb.
- Csatorna-gomb felül, külön bővített CSP CSAK ezen az oldalon (frame-src, img-src)
- Menüpont az Igehirdetők alatt + lábléc-link + sitemap

### Spotify-szerű felhúzható nagy lejátszó — KÉSZ
**Kulcs-elv:** NINCS külön lejátszó — a nagy nézet ugyanazt az `#audioElement`-et és
`state.current`-et vezérli, csak egy másik NÉZET.
- Nyitás háromféleképp: cím/előadó részre kattintva, felfelé-nyíl gombbal, felfelé húzva
- Tartalom: pecsét-logó "borító", kategória-jelvény, nagy cím, kattintható előadó-link,
  kattintható igehely, dátum, nagy vezérlők, idővonal, sebesség, megosztás, letöltés
- Zárás: lehúzó nyíl, Esc, lefelé húzás
- Elrendezés: **egy-blokkos, függőlegesen középre igazított, kompakt** (pex-inner
  max-width 560px, pex-cover-img min(42vw,190px) padding 8px object-fit contain)
- Új függvények: `cachePexDom, openPex, closePex, updatePexView, updatePexPlayIcon,
  setupExpandedPlayer, attachSwipe`

### Mobil lejátszó-optimalizálás — KÉSZ
- **Telefonos nyitás javítása:** a zárt `.player-expanded` `pointer-events: none`
  (nyitva `auto`) — enélkül elnyelte az érintést a mini-sáv fölött
- `.audio-player { touch-action: pan-x }`, a nyíl-gomb `touchend`-re is, swipe-küszöb 55→40px
- **Spotify-szerű mini-sáv (768px alatt):** két soros — fent cím/előadó + vezérlők
  (−10/play/+10) + X, lent teljes szélességű idővonal. Rejtve: sebesség, hangerő, megosztás.
- **Hosszú igehely-fix:** `.player-info { flex: 1 1 0 }` (nem `auto`) + `max-width: 100%`
  a címen/előadón — enélkül a hosszú lectio/textus szétfeszítette a sávot

### Megosztás-élmény — KÉSZ
- `revealCard` + `scrollCardIntoView` (a `--header-h`-ból számol: 72px asztali / 116px mobil)
- `just-shared` pulzálás 2.6 mp, erősebb `.lecture-card.is-active` kiemelés
- Az autoplay-blokk (`NotAllowedError`) némán kezelve — nem hiba, a böngésző tiltja
  interakció előtt a hangot

### Logó = tiszta főoldal-reset — KÉSZ
Ha van hash (`#felvetel=...`) vagy keresési paraméter → teljes újratöltés a tiszta
útvonalra. Ha már tiszta a főoldal → csak felgörget (nincs villanás).

### Háttérképek — KÉSZ
- Két háttér: hero (felül, élesen) + mögöttes elmosott (a kártyák mögött)
- **Mindkettő ugyanabból a 9-es készletből** választ véletlenszerűen (független sorsolás,
  ezért néha egyezhet — ritka, nem zavaró)
- Új kép: `hero-kazetta-biblia.jpg` (kazetták + nyitott Károli-Biblia), 6 MB → 184 KB
- Javítva: a kód hivatkozott egy törölt képre (`296bbcb1-...jpg`) → néha üres hero

---

## 3. HIBÁK ÉS TANULSÁGOK (ezekre FIGYELJ)

1. **A lectures.json TÖMÖR, egysoros JSON.** Minden író script
   `separators=(",", ":")`-vel írjon, különben felduzzad és óriási lesz a git diff.

2. **ÚJ képfájlt kézzel hozzá kell adni a githez!** A `pecset-logo.png` hiánya miatt a
   nagy lejátszó pecsétje élesben 404-elt (lokálisan működött). Push előtt:
   `git ls-files images/ | grep <fájlnév>`

3. **Telefon-crash veszély:** SOHA ne rendereljünk ki több száz kártyát egyszerre.
   A `revealCard` régi verziója addig töltött `loadMoreLectures()`-t, amíg a kiválasztott
   felvétel kártyája előkerült — ha a lista végén volt (1300. elem), az 1300+ kártya
   egyidejű renderelése telefonon megfagyasztotta/összeomlasztotta az oldalt.
   **Megoldás mindkét érintett helyen** (`playRandomLecture`, `handleUrlHash`): a felvétel
   a LISTA TETEJÉRE kerül (`state.filtered = [pick, ...többi]`, `state.page = 0`,
   `renderLectures`), majd `requestAnimationFrame`-ben görgetés + kiemelés.
   A random továbbra is a TELJES archívumból választ.

4. **rclone + R2 buktatók (a 207-es feltöltésnél jöttek elő):**
   - `rclone lsd r2:` NEM működik, ha a token egy bucketre van szűkítve (ListBuckets jog
     kell hozzá). Helyette: `rclone lsd r2:hangarchivum`
   - **`CreateBucket AccessDenied`** hiba: az rclone feltöltés előtt ellenőrizni/létrehozni
     akarja a bucketet. Megoldás: **`--s3-no-check-bucket`** kapcsoló (vagy
     `rclone config update r2 no_check_bucket true`)
   - Git Bash alatt a windowsos visszaperjeles útvonalak (`E:\...`) elakadhatnak a
     `[ -f ... ]` tesztnél → **perjelesen** írd (`E:/...`)

5. **A BIBLIAI_KONYVEK térkép KÉT helyen létezik** (app.js + igehirdeto_generator.py),
   és MINDIG szinkronban kell lennie (147-147 bejegyzés).

6. **A kategoria mező korábban a cim-ből lett átmásolva** (ezért volt 45 kategória).
   A reform után: a kategória a csoportosítás, a cim hordozza a részletet.

7. **A localhost + böngésző-cache összeakadhat** a `#felvetel=` hash-linknél — teszteléskor
   hard refresh (Ctrl+Shift+R), mert a hash-változás önmagában nem tölti újra az oldalt.

8. **Privát YouTube-videó nem ágyazható be** — a nem listázott igen, a privát nem. Ha
   ilyet vennénk fel a videok.json-ba, a látogatóknak hibát mutatna.

---

## 4. JELENLEGI ÁLLAPOT (2026-09-23)

**Minden élesben van és pusholva.**
- lectures.json: **1589 rekord**
- videok.json: **10 videó**
- sitemap: **79 URL**
- előadó-oldalak: **76**
- R2: 4 mappa (`1.KR_1991-`, `2.KR_2000-`, `3.KR_2007-`, `4.KR_2006-2013`)
- Az impresszum 1990–2013-at ír

**Search Console (2026-09):**
- 1 oldal indexelt (a főoldal)
- 79 nem indexelt, 2 okból:
  - **"Nem található (404)" — 1 oldal: `/impresszum.html`** — ártalmatlan régi szellem-URL.
    A projekt mappás struktúrát használ (`/impresszum/`), a `.html`-es alak sosem létezett.
    Nincs valódi teendő. (GitHub Pages nem támogat natív 301-et.)
  - **"Felfedezve – jelenleg nincs indexelve" — 78 oldal (az előadó-oldalak)** — NEM hiba:
    a Google ismeri őket, de még nem járta be. Tipikus új, alacsony tekintélyű oldalnál.
- A forgalom alacsony, szinte teljesen a főoldalra

---

## 5. NYITOTT FELADATOK

### A) TAKARÍTÁS (rövid, technikai)
A projektgyökérben felgyűltek a fejlesztési segéd-`.md`-k, ezek nem az oldal részei:
`SPOTIFY_*` (5 db), `MEGOSZTAS_*` (3 db), `MINI_lejatszo_*` (2 db),
`RANDOM_lista_tetejere_fix.md`, `LOGO_fooldal_reset.md`, `HATTERKEP_uj_es_kozos_lista.md`,
`IDOSZAK_*` (2 db), `APP_JS_igehely_valtozas.md`, `VV_valogatott_versek_javitas.md`,
`SORSZAMOZAS_javaslat.md`, `KELENREF100_PROJEKT_DOKUMENTACIO.md`,
`KELENREF100_TELJES_OSSZEFOGLALO.md`

Menete: `git ls-files "*.md"` — ami ebben szerepel, az már verziókövetett, ahhoz `git rm`
kell. Ami nincs benne, az simán törölhető. A `README.md` és a `CLAUDE.md` MARADJON.
Érdemes lehet a hasznos dokumentációt a `docs/` mappába konszolidálni.

A `.gitignore` már fedi: `*.py` (kivéve a generátort), `*.bak_*`, a leltár-CSV-ket, és
újonnan az `uj_207_rekord.json` / `r2_feltoltes.sh` / `r2_feltoltes_lista.json` fájlokat.

### B) GYÜLEKEZETI MEGBÍZÁS (nagy blokk, szept. 27-i egyeztetés)
A templom vezetői elsődleges hanganyag-forrásnak akarják használni az oldalt.
Vállalt feladatok:

1. **Biztonsági mentés biztosítása a gyülekezetnek** (privát API-kulcsok nélkül)
   - A kód: a GitHub repo maga a mentés (nincs benne kulcs — az R2-hozzáférés az rclone
     lokális configjában van, az nem kerül be)
   - Az adat: `lectures.json`, `videok.json`
   - A hanganyag: ~86 GB az R2-ről, `rclone copy`-val letölthető
   - Praktikusan: külső HDD-n átadott csomag
2. **A náluk lévő további mp3-ak összegyűjtése és feltöltése** (ezt nekik kell elkezdeniük,
   ez lesz a leglassabb rész)
3. **YouTube-csatorna archiválása** — automatizált videó/hang letöltés mentés céljából
   - **A csatornán sok nem listázott és PRIVÁT videó van, ezek a legfontosabbak** (róluk
     sehol nincs nyilvános másolat)
   - **Google Takeout a fő eszköz:** a tulajdonosi fiókkal MINDENT exportál (privát,
     unlisted, nyilvános), az EREDETI feltöltött fájlokat, nem újrakódolva
   - **yt-dlp a folyamatos frissítéshez** (`--download-archive`-val csak az újakat hozza),
     de a privát/unlisted videókhoz cookie kell, és a márkafiók-váltás cookie-alapon
     körülményes — ezt ki kell próbálni
   - Tárhely-igényt fel kell mérni (videóval együtt sok TB lehet)
4. **Hozzáférés kiépítése a YouTube-hoz**
   - Megkapta az e-mailt + jelszót, de a helyes megoldás: **egyszeri belépés után**
     Studio → Beállítások → **Engedélyek** → Meghívás → a saját Google-fiókja,
     **Kezelő** (Manager) szerepkörrel. Onnantól nem kell a jelszavuk.
   - **Buktató:** ez csak márkafiók (Brand Account) esetén működik. Ha régi, személyes
     fiókhoz kötött csatorna, előbb át kell vinni márkafiókba (Studio → Beállítások →
     Speciális). Ingyenes, a videók/feliratkozók megmaradnak.
   - **A csatorna-engedélyek NEM terjednek ki a YouTube API-ra** — a Takeouthoz a
     tulajdonosi fiók kell, az yt-dlp viszont nyilvános videókhoz nem igényel bejelentkezést
   - Javasolni nekik: a beállítás után **cseréljék le a jelszót** és kapcsoljanak be
     kétlépcsős azonosítást (a mostani 8 karakteres, csupa kisbetűs jelszó gyenge)
5. **1-2 VHS-kazetta digitalizálása** — kell hozzá működő videomagnó + USB-s video capture
   (kompozit/S-Video). 1-2 kazettánál külső szolgáltató akár olcsóbb/gyorsabb is lehet;
   érdemes mindkét verziót árazva vinni.

**A szept. 27-i egyeztetésre viendő kérdések:**
- YouTube API / automatikus letöltés megvalósíthatósága
- VHS-digitalizálás megoldhatósága
- A kelenref100 biztonsági mentés mikéntje, mi kell hozzá

### C) SEO / INDEXELÉS (ráér, lassan javul)
Hatás szerint sorrendben:
1. **A legerősebb: backlink a kelenref.hu-ról** — a gyülekezet fő oldaláról egy link a
   hangarchívumra. Tekintélyt és bejárási ösztönzést ad. **SZERVEZÉSI lépés**, a
   gyülekezetnél kell elintézni. (A szept. 27-i egyeztetésen szóba hozható!)
2. Az előadó-oldalak egyedibbé tétele a generátorral (egyedi bevezető, felvételszám,
   gyakori igehelyek) — csökkenti a "vékony/hasonló tartalom" gyanút. TECHNIKAI.
3. Kézi indexelés-kérés néhány kulcsoldalra (GSC URL-ellenőrző)
4. Türelem

**Amit NE:** tömeges újraindexelés-kérés, napi "Indexelés kérése" minden URL-re.

### D) TÁVOLI ÖTLETEK
- Hang-szöveg átirat (Whisper) — elhalasztva (AMD RX580, nincs CUDA Windows-on, a CPU
  túl lassú a ~1123 órához)
- A videók oldalon igehely-megjelenítés (most nincs, de az új videóknál lenne adat)

---

## 6. KULCSFÜGGVÉNYEK (app.js) — gyors referencia

**Kártya/lista:** `createCard`, `renderLectures`, `loadMoreLectures`, `applyFilters`,
`sortLectures`, `populateFilters`, `refreshFilterOptions`, `resetFilters`, `findCard`
**Igehely:** `igehelySzakaszok`, `konyvRovidites`, `renderIgehely`, `valogatottVersek`,
`BIBLIAI_KONYVEK` (147 elem)
**Keresés:** `parseDatumKereses`, `HONAP_NEVEK`, `honapPrefix`, `normalizeStr`
**Lejátszó:** `startPlaying`, `togglePlayPause`, `stopPlayer`, `updateCardStates`,
`audioUrl`, `downloadLecture`, `shareLecture`
**Nagy lejátszó:** `cachePexDom`, `openPex`, `closePex`, `updatePexView`,
`updatePexPlayIcon`, `setupExpandedPlayer`, `attachSwipe`
**Navigáció:** `revealCard`, `scrollCardIntoView`, `handleUrlHash`, `goHome`,
`playRandomLecture`
**Háttér:** `initHeroBackground`, `initBackground`, `HERO_BACKGROUNDS`
**Segéd:** `formatDate`, `formatTime`, `escHtml`, `slugify`

**CSS-változók:** `--header-h` (72px / 116px mobil), `--player-h` (90px), `--navy`,
`--navy-dark`, `--gold`, `--gold-light`, `--cream`, `--text-invert`
**CONFIG (config.js):** INITIAL_PAGE_SIZE 18, PAGE_SIZE 50, SKIP_SECONDS 10,
DEFAULT_VOLUME 0.85, BACKGROUND (mode 'random', blur 3px)

---

## 7. GYORS INDÍTÁS AZ ÚJ MUNKAMENETHEZ

> Folytatjuk a kelenref100.hu-t. A 207 felvétel feltöltése kész és élesben (1589 rekord).
> A következő: [takarítás a gyökérben / a gyülekezeti megbízás — mentés, YouTube-archiválás,
> VHS — a szept. 27-i egyeztetésre].

