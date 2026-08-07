# kelenref100.hu — Teljes projektdokumentáció

*Digitális egyházi hangarchívum. Utolsó frissítés: 2026-08-05.*

Ez az átfogó dokumentum összefoglalja a projekt teljes állapotát: mi az, hogyan
épül fel, mi készült el, mi van hátra, és milyen csapdákra kell figyelni. Célja,
hogy bárki (te magad hosszabb szünet után, vagy egy új közreműködő) percek alatt
képbe kerüljön.

---

## 1. Mi ez a projekt?

A **kelenref100.hu** a Kelenföldi Református Egyházközség digitális hangarchívuma:
kb. **1382 igehirdetés / előadás** (~997 óra hanganyag) kereshető, böngészhető,
online meghallgatható formában. A felvételek 1990–2010 közöttiek (csúcs: 1999–2009),
75 igehirdetőtől.

**Fő funkciók:**
- Teljes szövegű keresés (cím, előadó, igehely, megjegyzés)
- Okos időszak-keresés (évszám és hónapnév felismerése a keresőmezőben)
- Szűrők: kategória, előadó, év, rendezés (dátum, előadó, hossz, véletlen)
- Igehely-linkelés a szentiras.eu-ra (összetett igehelyek is)
- Előadónkénti aloldalak (SEO + böngészés)
- Reszponzív, mobilbarát felület, sötét téma, PWA-alapok

---

## 2. Technikai architektúra

**Frontend:** statikus HTML/CSS/JS (nincs build-lépés, nincs keretrendszer).
- `index.html` — a főoldal, benne a hamburger-menüs szűrőpanel
- `app.js` — a teljes kliensoldali logika (keresés, szűrés, rendezés, kártyák)
- `style.css` — stílusok
- `config.js` — konfiguráció (pl. háttérképek)
- `lectures.json` — az ADATBÁZIS: minden felvétel egy rekord (lásd 4. pont)

**Hosting:**
- A statikus oldal → **GitHub Pages** (repo: `Kelemenb004/digitalizacio`)
- A hangfájlok (mp3, ~86 GB) → **Cloudflare R2** objektumtároló
- Domain → Rackhost, HTTPS-sel

**Cloudflare R2 részletek:**
- Nyilvános URL-bázis: `https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`
- rclone remote: `r2`, bucket: `hangarchivum`
- Költség: ~$0.45/hó (~165 Ft) — CSAK a tárolás fizetős; a letöltések és
  műveletek ingyenesek, nincs egress-díj → a költség független a látogatottságtól.

**Generátor:**
- `igehirdeto_generator.py` — a lectures.json-ból legenerálja a 75 előadó-oldalt,
  a gyűjtőoldalt (`igehirdetok/`), és frissíti a sitemap-et + az `igehirdeto.js`-t.
  Ez a projekt ÉLŐ, karbantartott része (verziókövetett, a `.gitignore` kivétellel).

**Munkafolyamat:**
1. A fejlesztés Claude segítségével történik (scriptek, kódrészletek).
2. A tényleges alkalmazást Claude Code végzi a gépen.
3. A commit + push MINDIG a felhasználó köre (GitHub Desktop) — Claude Code sosem commitol.
4. Push előtt lokális teszt: `python -m http.server 8080`.

---

## 3. Infrastruktúra-azonosítók (NE töröld ezeket)

- Google Search Console verifikáció: `content="kRf1ESJTB9PxL2Bj4gh1nic1Wt_YZo18i8t6R2Lob2Y"`
- GitHub: `Kelemenb004` / repo `digitalizacio`
- Domain: kelenref100.hu (Rackhost), CNAME fájl a repóban
- A gyülekezet fő oldala: kelenref.hu (ettől külön projekt)

---

## 4. Az adatszerkezet (lectures.json)

**Formátum:** TÖMÖR, egyetlen soros JSON (nincs behúzás), ~396 KB, ~1382 rekord.
> KRITIKUS: bármilyen író script `separators=(",", ":")` formátummal írjon,
> különben a fájl felduzzad és a git diff használhatatlanul nagy lesz.

**Egy rekord mezői:**
| mező | jelentés | példa |
|---|---|---|
| `path` | a fájl útvonala az R2-n | `1.KR_1991-/Takaró Károly/207_A.mp3` |
| `eloado` | igehirdető neve | `Takaró Károly` |
| `datum` | felvétel dátuma (ISO) | `1999-10-04` |
| `ido` | időpont (ha ismert) | `10:30` |
| `lectio` | lekció igehely | `Zsolt 23` |
| `textus` | alapige | `Jn 3,16` |
| `megjegyzes` | egyéb megjegyzés | `Betegeknek` |
| `cim` | a felvétel címe | `Imahét III.` |
| `kategoria` | a 10 kategória egyike | `Imahét` |
| `evkor` | egyházi évkör-besorolás | |
| `hossz_sec` | hossz másodpercben | `2100` |
| `tipus` | típus | |

**A 10 kategória (a reform után):**
Istentisztelet (903), Evangelizáció (170), Bibliaóra (128), Különleges alkalom (63),
Diakónia napok (30), Alliance Imahét (28), Bűnbánati hét (27), Imahét (16),
A reformáció hete (10), Ünnepi alkalom (7).

---

## 5. Mi készült el (kész, élesben)

### Alapok (korábbi fázisok)
- Teljes R2-feltöltés (~86 GB), domain élesítés HTTPS-sel
- szentiras.eu igehely-linkelés
- Teljes SEO: Schema.org, OpenGraph, sitemap, Search Console igazolva
- Vizuális megújulás: hero-kép pecséttel, hamburger-menü, favicon/PWA, mobil-optimalizáció
- Kiberbiztonsági alapok: CSP + Referrer-Policy
- Mappás URL-struktúra: `/`, `/impresszum/`, `/igehirdetok/`, `/igehirdeto/<slug>/`
- 75 indexelhető előadó-oldal, lábléc + impresszum
- Obsidian-alapú memory-bank a `docs/` mappában (activeContext, progress,
  projectbrief, systemPatterns, techContext)

### Igehely-kezelés
- **Összetett igehelyek:** a több szakaszos igehelyek (pl. `Zsd.1:1-3, 3:1-3`)
  minden szakasza külön kattintható link, könyv- és fejezet-örökléssel.
- **v.v. (válogatott versek):** a `v.v.`/`vv` formák a linkből törlődnek (a
  fejezetre mutatnak, nincs 404), a megjelenítésben "(válogatott versek)"-ként.
- Több igehely-adatjavítás (elírt könyvnevek stb.).

### Keresés és szűrés
- **Időszak-keresés (okos kereső):** a keresőmező felismeri az évszámot és a
  hónapnevet. Pl. "Takaró Károly 2006", "Pocsaji Miklós 2006 június", "december".
  - Prefix-alapú hónapfelismerés: egy szó akkor hónap, ha egy hónapnév ELEJE
    (`már`/`márc` → március, de `márk` = Márk evangélium NEM; `janos` = János NEM).
    Így nincs névütközés, és a rövidítések (dec, jan) sosem adnak üres találatot.
  - A kereső szétválasztja a szöveget és a dátumot: a szöveget a megszokott
    mezőkben keresi, a dátum-mintát a `datum` mezőre illeszti.
- **Év-szűrő** legördülő a hamburger-menüben (1990–2010, dinamikusan az adatból).
- **Hossz-rendezés** két irányban: leghosszabb elöl / legrövidebb elöl (utóbbi a
  hibás 0:00-s fájlok kiszűrésére is jó).

### Adattisztítás
- **2 üres (0 bájt) felvétel törlése** (az eredeti digitalizálás hibás volt; a HDD-n
  is 0 bájtosak voltak) → 1384-ről 1382-re.
- **Kategória-reform:** 45 → 10 kategória. A `kategoria` mező 97%-ban azonos volt a
  `cim` mezővel (a címből lett átmásolva, ezért burjánzott el). A reform CSAK a
  `kategoria` mezőt írta át (54 rekord), a `cim` érintetlen maradt — így a részletes
  infó (pl. "Imahét III.") megmaradt a címben.
- **Alkalom-sorozatok sorszámozása:** a 6 "hetes" kategóriában (Bűnbánati hét,
  Imahét, Alliance Imahét, A reformáció hete, Diakónia napok, Evangelizáció) az
  egymást követő alkalmak (max 3 nap szünet) CÍMÉBE római sorszám került (I., II., …),
  dátum → időpont → kazettaszám sorrendben. **64 sorozat, 261 felvétel.** A magányos
  alkalmakról a beragadt sorszám levéve. Így egy adott hét alkalmai a kategóriára
  szűrve, dátum szerint rendezve egy blokkban, sorrendben olvashatók.
  A script idempotens (újrafuttatva 0 módosítást ír).

---

## 6. Ami hátravan

### A) A 207 hiányzó felvétel feltöltése (a nagy blokk)
Az **E: meghajtón** új felvételek érkeztek (8 előadó-mappában), lazább kitöltéssel
mint a weboldal saját adata.

**A szűrési szabály:** a YouTube legrégebbi feltöltése **2013.03.28**. Ami ez UTÁNI,
az már fent van YouTube-on → NEM kell. Ami ez ELŐTTI és hiányzik a weboldalról → KELL.

**A leltár végeredménye (E_hianypotlas_leltar.py futtatásából):**
- 1642 mp3 feldolgozva
- 1048 a 2013.03.28-as határ után (YouTube-on, nem kell)
- 57 már megvan a weboldalon
- **207 HIÁNYZIK** → ez kell: Takaró Károly 202, Szántó János 4, Takaró Tamás 1
- Ebből **16 db a "kész" (2006–2009) időszak LYUKA** (nem csak folytatás, hanem
  javítás is: olyan alkalmak, amiket nem digitalizáltak, vagy csak az egyik napi
  alkalom van meg).
- 93 fájlban van igehely az ID3-ban.
- A 330 "dátum-hiba" fájlnév mind a "Reggeli áhítatok" 2020–2021-es sorozat
  (`ahitat_ÉÉÉÉ.HH.NN_Ó.PP.mp3`), mind 2013.03.28 UTÁNI → a parser bővítése felesleges.

**Fontos technikai részletek a feltöltéshez:**
- Fájlnév-formátum: `ÉÉHHNN_ÓÓPP.mp3` (pl. `100510_1830` = 2010-05-10 18:30). A
  fájlnév dátuma a VALÓDI felvételi dátum. A fájl módosítás-dátuma (pl. 2018) csak a
  digitalizálás időpontja; az ID3-ban NINCS dátum-mező.
- Sok fájlban gazdag ID3: `TIT2` (cím — vagy tartalmi mint "Harcosképzés I.", vagy
  dátumos mint "Istentisztelet 2008.10.27."), `COMM` (igehely, pl. "2Tim.2,1-5.",
  néha több is), `TPE1` (előadó). Szántó Jánosnál NINCS ID3.
- Az összevetés ELŐADÓ + DÁTUM + IDŐPONT szerint (egy napon két alkalom is lehet).

**A feltöltés menete (külön session, Claude Code-dal):**
1. Rekordépítés a `hianyzo_2013_elott.csv`-ből: 207 új lectures.json-rekord.
   Az ID3 igehely → `textus`; a dátumos ID3-cím → "Istentisztelet"; a tartalmi cím
   megtartva. DÖNTÉSI PONT: az R2 path-séma.
2. R2-feltöltés rclone-nal a megfelelő mappaszerkezetbe.
3. lectures.json bővítés: 1382 → 1589 (tömör formátumban!).
4. Generátor újrafuttatás (Szántó János + Takaró János új előadó-oldalt kap).

### B) Search Console — indexelés
A sitemap beküldve, a Google látja a 78 URL-t. DE 77 előadó-oldal státusza
"Felfedezve – jelenleg nincs indexelve" (a Google ismeri, de még nem indexelte).
Ez normális új, alacsony tekintélyű oldalnál. A forgalom alacsony; ami van, az
szinte teljesen a főoldalra jut (az indexelve van).

**Javaslatok hatás szerint:**
1. **A legerősebb: backlink a kelenref.hu-ról** (a gyülekezet fő oldaláról egy link
   a hangarchívumra). Ez ad tekintélyt és bejárási ösztönzést. Szervezési, nem
   technikai lépés — a gyülekezetnél kell elintézni.
2. Kézi indexelés-kérés a legfontosabb oldalakra (GSC URL-ellenőrző).
3. Az előadó-oldalak egyedibbé tétele (a generátorral): egyedi bevezető,
   felvételszám, gyakori igehelyek — csökkenti a "vékony/hasonló tartalom" gyanút.
4. Türelem: friss oldalnál a "Felfedezve – nincs indexelve" gyakran magától javul.

**Amit NE:** ne kérj tömeges újraindexelést, ne nyomd naponta az "Indexelés kérése"
gombot minden URL-re — nem gyorsít.

### C) Távoli ötletek
- Hang-szöveg átirat (Whisper) — elhalasztva (AMD RX580, nincs CUDA Windows-on,
  a CPU túl lassú a ~997 órához).

---

## 7. Ismert csapdák (FONTOS)

1. **A lectures.json TÖMÖR, egysoros JSON.** Minden író script
   `separators=(",", ":")`-vel írjon, különben felduzzad és óriási lesz a git diff.
2. **A BIBLIAI_KONYVEK térkép KÉT helyen létezik** (app.js + igehirdeto_generator.py),
   és MINDIG szinkronban kell lennie (147-147 bejegyzés). Ha az egyikben javítasz,
   a másikban is javítsd.
3. **A kategoria mező korábban a cim-ből lett átmásolva** (ezért volt 45 kategória).
   A reform után: a kategória a csoportosítás, a cim hordozza a részletet (sorszám,
   egyedi cím). Új rekordnál is így kell kitölteni.
4. **Az igehely-linkelés kezel összetett + v.v. eseteket** — új igehely-adatnál
   ügyelni kell a formátumra.
5. **Commit/push mindig a felhasználó köre** (GitHub Desktop), Claude Code sosem commitol.
6. **Az ideiglenes fájlok nem verziókövetettek:** `*.bak_*` és a leltár-CSV-k
   (`hianyzo_2013_elott.csv`, `datumhiba_fajlok.csv`) a `.gitignore` alatt vannak.
   Az egyszeri segédscriptek (`*.py`) is kimaradnak, KIVÉVE az igehirdeto_generator.py-t.

---

## 8. Kulcsfüggvények (app.js) — gyors referencia

- `createCard` — a felvétel-kártya HTML-je (renderIgehely-lyel)
- `audioUrl` — a path → R2 URL (encodeURIComponent szegmensenként)
- `applyFilters` — a fő szűrő: szöveg + dátum-minta + év-szűrő + kategória/előadó
- `parseDatumKereses` / `HONAP_NEVEK` / `honapPrefix` — a prefix-alapú dátumfelismerés
- `igehelySzakaszok` / `konyvRovidites` / `renderIgehely` — összetett igehely-linkelés
- `valogatottVersek` — a v.v. kezelése
- `sortLectures` — rendezés (date-desc/asc, speaker, duration-desc/asc, random)
- `populateFilters` / `refreshFilterOptions` / `resetFilters` — szűrő-feltöltés
- `normalizeStr`, `formatDate`, `escHtml`, `slugify` — segédfüggvények
- `BIBLIAI_KONYVEK` — a bibliai könyvek rövidítés-térképe (147 elem)

---

## 9. A projekt fájlstruktúrája (D:\programozas\Digitalizacio)

```
index.html, style.css, app.js, config.js
lectures.json            <- az adatbázis (tömör JSON)
CNAME, robots.txt, sitemap.xml, README.md
CLAUDE.md                <- a memory-bank gyökere (Claude Code utasításai)
.gitignore               <- *.py kizárva, kivéve igehirdeto_generator.py; *.bak_*; CSV-k
igehirdeto_generator.py  <- az ÉLŐ generátor (verziókövetett)
*.py                     <- egyszeri segédscriptek (nem verziókövetett)
images/                  <- hero-1..4.jpg, favicon, stb.
docs/                    <- Obsidian memory-bank (activeContext, progress, ...)
igehirdeto/              <- generált előadó-oldalak (75 mappa)
igehirdetok/             <- a gyűjtőoldal
impresszum/
```

---

## 10. Gyors indítás egy új munkamenethez

Ha új chatet nyitsz a folytatáshoz, ez a mondat elég a képbe kerüléshez:

> Folytatjuk a kelenref100.hu-t (digitális egyházi hangarchívum, a részletek a
> docs/-ban). A következő nagy feladat a 207 hiányzó (2013.03.28 előtti) felvétel
> feltöltése az E: meghajtóról, a hianyzo_2013_elott.csv-ből. Kezdjük a CSV
> ellenőrzésével (első 3 sor, oszlopok).

---

*Ez a dokumentum pillanatkép. A napi munka részletei a projekt docs/ mappájában
(activeContext.md, progress.md) frissülnek — mindig az a mérvadó.*
