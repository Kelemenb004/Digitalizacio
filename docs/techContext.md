# Technikai kontextus — kelenref100.hu

## Stack
- **Frontend:** statikus HTML/CSS/JS (nincs backend futásidőben).
- **Hosting:** GitHub Pages, repo: `Kelemenb004/<!-- repo név -->`.
- **Média:** Cloudflare R2 bucket (~86 GB, ~1384 felvétel). Az audio közvetlenül
  R2-ről szolgálódik. <!-- VERIFY: publikus bucket URL / egyedi domain -->
- **Oldalgenerálás:** Python generátor script, ami az előadói oldalakat állítja elő.
  <!-- TÖLTSD KI: script neve/útvonala, bemenet (pl. adatforrás), kimenet -->

## Fejlesztői környezet
- VS Code + Claude Code extension + Filesystem MCP.
- Commitok GitHub Desktoppal a `main` branchre → GitHub Pages automata deploy.

## Deploy folyamat
1. Módosítás lokálisan (kód / sablon / generátor).
2. Ha generált oldalak érintettek: generátor futtatása.
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
