# kelenref100.hu — projekt memória (CLAUDE.md)

Ezt a fájlt a Claude Code minden session elején automatikusan beolvassa, ezért
tartsd tömören és magas jelértékűen (cél: ~200 sor / 5k token alatt). A részletes
kontextus a `docs/` mappában van — azt **csak akkor olvasd be, amikor a feladathoz
ténylegesen kell**, nem alapból.

## Mi ez
Statikus hangarchívum-weboldal a Kelenföldi Református Gyülekezet felvételeihez.
<!-- VERIFY: pontos gyülekezetnév és a "100" jelentése (100. évforduló?) -->
~1384 hangfelvétel, előadónkénti (speaker) oldalak, SEO-ra optimalizált, tiszta
URL-struktúra. Az audio nem a repóban van, hanem Cloudflare R2-n.

## Tech stack
- Frontend: statikus HTML/CSS/JS
- Hosting: GitHub Pages (repo: `Kelemenb004/<!-- repo név -->`)
- Média: Cloudflare R2 (~86 GB, ~1384 felvétel)
- Oldalgenerálás: Python generátor script (előadói oldalak, ~75 előadó)
- SEO: sitemap, meta tagek, tiszta URL-ek, Google Search Console
- Fejlesztés: VS Code + Claude Code + Filesystem MCP, commit GitHub Desktoppal

## Konvenciók / szabályok
- A generált előadói HTML-t **kézzel ne szerkeszd** — a generátor scriptet vagy a
  sablont módosítsd, aztán újragenerálj.
- A meglévő tiszta URL-sémát tartsd meg (az indexelés már fut, ne törd el).
- Nagy vagy generált fájlokat (tömeges HTML, esetleges data-dumpok) ne olvass be
  feleslegesen a kontextusba.
- <!-- TÖLTSD KI: egyéb konvenció, pl. mappastruktúra, hol a template -->

## Kulcsparancsok
- Generátor futtatása: `<!-- TÖLTSD KI -->`
- Lokális preview: `<!-- TÖLTSD KI, pl. python -m http.server 8000 -->`
- Deploy: push a `main` branchre → GitHub Pages automatikusan build-el

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
