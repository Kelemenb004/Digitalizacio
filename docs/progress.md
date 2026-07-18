# Haladás — kelenref100.hu

## Ami működik
- Hangarchívum böngészése és lejátszása (audio R2-ről).
- 75 generált előadó-oldal + gyűjtőoldal (`igehirdeto_generator.py`), mappás
  URL-ekkel, sitemapbe felvéve — light/dark, desktop/mobil böngészőben
  leellenőrizve.
- Főoldal és előadó-oldalak kölcsönösen összekötve (kártya-link, szűrőpanel-
  link, lábléc-link).
- SEO alap: meta, JSON-LD, 78 URL-es sitemap; Search Console indexelés fut,
  korai eredmények jók.
- Footer kész, lejátszási hibák javítva, sötét téma kontraszthiba javítva.

## Ami hátravan / ötletek
- `igehirdeto_generator.py` verziókezelésbe vétele (jelenleg gitignore-olt).
- `config.js` háttérkép-hivatkozások javítása (hiányzó `bg*.JPG` fájlok).
- Transzkripció (Whisper) — parkolva az AMD GPU / Windows korlát miatt; később.

## Ismert hibák / adósságok
- Véletlen háttérkép (`BACKGROUND.images`) 404-el hiányzó fájlok miatt (ld. fent).
- `techContext.md` Stack listájában elavult `impresszum.html` fájlnév-utalás.

## Kapcsolódó
- [activeContext](activeContext.md) · [projectbrief](projectbrief.md) ·
  [techContext](techContext.md) · [systemPatterns](systemPatterns.md)
