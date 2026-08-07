# Videók oldal + menüpont + impresszum-bővítés — megvalósítási útmutató

Négy rész: (1) a /videok/ oldal + videok.json, (2) a "Videók" gomb a hamburger-menübe,
(3) a lábléc-link a főoldalon, (4) impresszum-bővítés, (5) sitemap.

═══════════════════════════════════════════════════════════════════
## 1) ÚJ FÁJLOK
═══════════════════════════════════════════════════════════════════

### a) videok.json — a projekt GYÖKERÉBE
Az 5 videó adata. Később új videó = egy új sor ehhez a tömbhöz (a generátort NEM kell
futtatni, az oldal futásidőben tölti be).

### b) videok/index.html — ÚJ MAPPA a gyökérben (mint az impresszum/)
A kész oldal. A meglévő legal-page stílusra épül, a videó-rács reszponzív
(mobilon 1, nagyobb kijelzőn 2 oszlop). A YouTube-beágyazás youtube-nocookie.com-ról
megy (adatvédelmi okból, illik az oldal "nem követünk" elvéhez).

FONTOS – CSP: a videok/index.html HEAD-jében a Content-Security-Policy már bővítve van
a YouTube-beágyazáshoz: `frame-src https://www.youtube-nocookie.com;` és
`img-src ... https://i.ytimg.com;`. Ez CSAK ezen az oldalon kell — a többi oldal CSP-jét
NE bántsd.

Mindkét fájl tartalma külön mellékelve (videok.json, videok_index.html).
A videok_index.html-t a videok/ mappába kell tenni index.html néven.

═══════════════════════════════════════════════════════════════════
## 2) A "VIDEÓK" GOMB A HAMBURGER-MENÜBE (index.html)
═══════════════════════════════════════════════════════════════════

Keresd meg az index.html-ben az Igehirdetők nav-linket:

```html
      <a href="/igehirdetok/" class="panel-nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Igehirdetők böngészése</span>
      </a>
```

És KÖZVETLENÜL UTÁNA szúrd be a Videók gombot (ugyanaz a panel-nav-link stílus,
YouTube-play ikonnal):

```html
      <a href="/videok/" class="panel-nav-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg>
        <span>Videók</span>
      </a>
```

═══════════════════════════════════════════════════════════════════
## 3) LÁBLÉC-LINK A FŐOLDALON (index.html)
═══════════════════════════════════════════════════════════════════

Keresd meg a láblécben:
```html
          &nbsp;·&nbsp; <a href="/igehirdetok/" class="footer-email">Igehirdetők</a>
          &nbsp;·&nbsp; <a href="/impresszum/" class="footer-email">Impresszum</a>
```
és a kettő KÖZÉ szúrd be:
```html
          &nbsp;·&nbsp; <a href="/videok/" class="footer-email">Videók</a>
```

(A videok/index.html láblécében ez már eleve benne van.)

═══════════════════════════════════════════════════════════════════
## 4) IMPRESSZUM-BŐVÍTÉS (impresszum/index.html)
═══════════════════════════════════════════════════════════════════

Keresd meg az "Az oldal" szekciót:

```html
      <section class="legal-section">
        <h2>Az oldal</h2>
        <p>A <strong>Digitális Hangarchívum</strong> (kelenref100.hu) a Budapest-Kelenföldi Református Egyházközség igehirdetéseinek, prédikációinak és bibliaóráinak digitalizált, kereshető gyűjteménye. Az oldal célja, hogy a gyülekezet hangörökségét bárki számára ingyenesen elérhetővé és kereshetővé tegye.</p>
      </section>
```

Cseréld le erre (kiegészítve az idő-lefedettséggel és a YouTube-folytatással):

```html
      <section class="legal-section">
        <h2>Az oldal</h2>
        <p>A <strong>Digitális Hangarchívum</strong> (kelenref100.hu) a Budapest-Kelenföldi Református Egyházközség igehirdetéseinek, prédikációinak és bibliaóráinak digitalizált, kereshető gyűjteménye. Az oldal célja, hogy a gyülekezet hangörökségét bárki számára ingyenesen elérhetővé és kereshetővé tegye.</p>
        <p>Az archívum a jelenleg elérhető, digitalizált <strong>hangfelvételeket</strong> tartalmazza, jellemzően az <strong>1990-es évektől 2010-ig</strong> terjedő időszakból. Az ennél frissebb istentiszteletek és igehirdetések a gyülekezet <a href="https://www.youtube.com/channel/UCgxsQUUs2R8l6kT-hQr-Qlg" target="_blank" rel="noopener" class="legal-link">hivatalos YouTube-csatornáján</a> érhetők el, ahol hétről hétre új felvételek jelennek meg.</p>
        <p>Néhány kiemelt <a href="/videok/" class="legal-link">videófelvétel</a> a gyülekezet történetéből külön oldalon is megtekinthető.</p>
      </section>
```

MEGJEGYZÉS: az "1990-es évektől 2010-ig" a mostani adat alapján igaz. Ha a 207 hiányzó
felvétel feltöltése után a felső határ tolódik (2013-ig), ezt a mondatot frissíteni kell.

═══════════════════════════════════════════════════════════════════
## 5) SITEMAP (sitemap.xml)
═══════════════════════════════════════════════════════════════════

Vedd fel az új oldalt a sitemap.xml-be (a meglévő <url> bejegyzések mintájára, pl. az
impresszum után):

```xml
  <url>
    <loc>https://kelenref100.hu/videok/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
```

(A pontos mezőket igazítsd a meglévő bejegyzésekhez — ha nincs changefreq/priority
a többinél, akkor csak a <loc> kell.)

═══════════════════════════════════════════════════════════════════
## TESZTELÉS (python -m http.server 8080)
═══════════════════════════════════════════════════════════════════
- A főoldalon nyisd meg a hamburger-menüt: az "Igehirdetők böngészése" alatt ott a "Videók".
- Kattints rá → /videok/ betölt, felül a csatorna-gomb, alatta az 5 videó két oszlopban
  (mobilnézetben egymás alatt). A beiktatás I–II. van elöl, majd a fogadalomtétel (1999),
  végül a két 1989-es evangelizáció.
- A videók lejátszhatók (beágyazva, nem visznek el a YouTube-ra).
- Az egyes kártyákon: kategória-jelvény (Beiktatás/Istentisztelet/Evangelizáció), cím,
  és alatta a megjegyzés · dátum · előadó (ahol van).
- Az impresszumban az "Az oldal" szekció mutatja az 1990–2010 lefedettséget és a
  YouTube-linket.
- A láblécben (főoldal + videók + impresszum) ott a "Videók" link.
- Ellenőrizd hogy a többi oldal változatlanul működik (a videó-CSP csak a /videok/-ra vonatkozik).
