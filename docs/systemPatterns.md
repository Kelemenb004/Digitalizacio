# Rendszerminták — kelenref100.hu

> Hogyan áll össze az oldal és miért így. Ha egy döntés megváltozik, itt frissítsd.

## Oldalgenerálás
- Az előadói oldalak **generáltak** egy Python scripttel, nem kézzel írtak.
- Aranyszabály: a **sablont / generátort** módosítsd, ne a kimeneti HTML-t.
  Kézi szerkesztés a következő generáláskor felülíródik.
- <!-- TÖLTSD KI: sablon helye, milyen adatból generál (JSON? mappa-struktúra?) -->

## URL-séma és SEO
- Tiszta, olvasható URL-ek (SEO-ra tervezve). A séma már indexelve van a
  Google-nél, ezért **visszafelé kompatibilisen** kell kezelni — ne törd el a
  meglévő útvonalakat.
- SEO elemek: meta tagek, sitemap, előadói oldalak.
- <!-- TÖLTSD KI: konkrét URL-minta, pl. /eloadok/<slug>/ -->

## Média-hivatkozás
- Az audio R2-ről jön; a HTML csak hivatkozik rá (nem lokális fájl).
- <!-- VERIFY: hogyan épül fel egy média-URL (bucket domain + útvonal) -->

## Kapcsolódó
- [techContext](techContext.md) · [projectbrief](projectbrief.md) ·
  [activeContext](activeContext.md) · [progress](progress.md)
