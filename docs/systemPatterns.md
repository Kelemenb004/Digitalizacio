# Rendszerminták — kelenref100.hu

> Hogyan áll össze az oldal és miért így. Ha egy döntés megváltozik, itt frissítsd.

## Oldalgenerálás
- **Van oldalgenerátor:** `igehirdeto_generator.py` a repo gyökerében. A
  `lectures.json`-ból legenerálja a 75 előadó-oldalt
  (`igehirdeto/<slug>/index.html`) és a gyűjtőoldalt
  (`igehirdetok/index.html`), kiírja az `igehirdeto.js` lejátszót, frissíti a
  `sitemap.xml`-t, és hozzáfűzi az igehirdető-stílusokat a `style.css`-hez
  (duplikáció-védett markerrel). Idempotens — bármikor újrafuttatható.
- A slug magyar ékezet-mentesítéssel készül (pl. "Takaró Károly" ->
  `takaro-karoly`, "Dr.Gyökössy Endre" -> `dr-gyokossy-endre`).
- **A főoldal viszont NEM generált:** `index.html` + `app.js` + `style.css`
  kézzel szerkesztett, kliensoldali szűréssel/kereséssel. A generátor csak az
  előadó-oldalakat és a gyűjtőoldalt gyártja.
- Ha a `lectures.json` változik: futtasd újra a generátort
  (`python igehirdeto_generator.py`) az előadó-oldalak frissítéséhez. A
  generált oldalakat NE szerkeszd kézzel — a generátor sablonjait módosítsd.
- Az egyetlen adatforrás a `lectures.json` (1384 rekord) — ezt tölti be az
  `app.js` a főoldalon, és ebből dolgozik a generátor is.
- **Kettős slug-implementáció, szinkronban tartandó:** a főoldal kártyáin az
  előadónév linkje (`app.js` `slugify()`) és a generátor `slugify()`-a
  (Python) egymástól függetlenül, de azonos logikával állítják elő ugyanazt
  a slugot. Ha bármelyiket módosítod (pl. ékezetkezelés, írásjelek), a
  másikat is frissítsd — eltérés esetén a főoldali link 404-re fut.

## URL-séma és SEO
- **Mappás, tiszta URL-séma.** Publikus útvonalak: `/` (főoldal),
  `/impresszum/`, `/igehirdetok/` (gyűjtő), `/igehirdeto/<slug>/` (75 előadó).
  Minden mappás (mappa + `index.html`), így nincs `.html` a címben. A
  `sitemap.xml` mind a 78 URL-t listázza. Az előadó-oldalak linkjei
  gyökér-abszolútak (`/style.css`, `/config.js`, `/igehirdeto.js`, `/images/...`).
- Egyedi felvételre mutató mélylink hash-alapú, nem külön oldal:
  `https://kelenref100.hu/#felvetel=<encodeURIComponent(lecture.path)>`
  (ld. `app.js` `shareLecture()` és `handleUrlHash()`). Ez kliensoldalon
  nyitja meg és indítja el az adott felvételt, nincs szerveroldali route.
- SEO elemek: meta tagek (title, description, OG/Twitter kártya,
  JSON-LD `WebSite` séma keresősávval) az `index.html` fejlécében, sitemap,
  Search Console. Ha ez a séma változik (pl. valódi al-oldalak jönnek), az
  indexelés miatt körültekintően, redirectekkel kell kezelni.

## Média-hivatkozás
- Az audio R2-ről jön; a HTML/JS csak hivatkozik rá (nem lokális fájl).
- Felépítés (`app.js` `audioUrl()`): `CONFIG.R2_BASE_URL + '/' +
  path.split('/').map(encodeURIComponent).join('/')`, ahol `path` a
  `lectures.json` rekord `path` mezője (pl. `1.KR_1991-/50_AB_Betegeknek.mp3`).
- `CONFIG.R2_BASE_URL` (`config.js`) jelenleg az R2 publikus **dev** URL-je
  (`https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev`), nincs rá kötött
  egyedi domain.

## Kapcsolódó
- [techContext](techContext.md) · [projectbrief](projectbrief.md) ·
  [activeContext](activeContext.md) · [progress](progress.md)
