# Projekt alapja — kelenref100.hu

> Ez a memory bank "gyökér" fájlja. A projekt lényegét rögzíti; ritkán változik.

## Mi ez
Statikus weboldal (kelenref100.hu) a Budapest-Kelenföldi Református
Egyházközség digitalizált igehirdetéseinek, prédikációinak és bibliaóráinak
archiválására és böngészésére. A "100" a gyülekezet 100 éves jubileumára utal
("100 éve Krisztussal" — ld. hero-logó alt szövege az index.html-ben).

## Miért létezik / kinek szól
- A gyülekezeti igehirdetések, előadások hosszú távú, kereshető megőrzése.
- Cél, hogy bárki (gyülekezeti tagok, érdeklődők) könnyen megtalálja egy adott
  előadó vagy alkalom felvételét, és keresőből is jól megtalálható legyen.

## Fő funkciók
- Hangfelvételek böngészése, keresése/szűrése (előadó, kategória, évkör,
  kedvencek) és lejátszása (audio az R2-ről szolgálva) — mindez egyetlen
  `index.html` egyoldalas alkalmazáson belül, kliensoldali JS-sel.
- Előadó szerinti böngészés KÉT módon: a főoldalon egy szűrő-legördülővel, ÉS
  külön, indexelhető előadó-oldalakon (`/igehirdeto/<slug>/`) — 75 előadóhoz,
  plusz egy gyűjtőoldal (`/igehirdetok/`). Ezeket az `igehirdeto_generator.py`
  generálja a `lectures.json`-ból.
- SEO-infrastruktúra: meta tagek, JSON-LD, sitemap (78 URL: főoldal +
  igehirdetok/ + impresszum/ + 75 előadó-oldal), Google Search Console.

## Nagyságrend
- ~1384 hangfelvétel, ~86 GB média Cloudflare R2-n.
- ~75 előadói oldal.

## Kapcsolódó
- [techContext](techContext.md) · [systemPatterns](systemPatterns.md) ·
  [activeContext](activeContext.md) · [progress](progress.md)
