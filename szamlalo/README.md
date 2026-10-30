# Megtekintés-számláló (kelenref100.hu)

A ☰ menü alján látható szem ikon + szám forrása. Cloudflare Worker + D1 adatbázis,
ugyanabban a Cloudflare-fiókban, ahol a `hangarchivum` R2-bucket van.

- **Adatbázis:** `kelenref-szamlalo` (D1, EEUR), táblák: `szamlalo` (összesen), `napi` (napi darabszám, UTC).
  Szerkezet: `schema.sql`. Létrehozva: 2026-10-30.
  Kezdőérték: **156** (a Google Search Console-ban addig mért összes kattintás, 2026-10-30) – a napi tábla innen indul.
- **Worker:** `kelenref-szamlalo`, kód: `worker.js`, D1-kötés neve: **DB**.
- **Az oldalon:** `szamlalo.js` (gyökér), a cím a `config.js` → `SZAMLALO_URL`; a CSP `connect-src`-ben is szerepel.
- Az élő oldal minden főoldal-megnyitásnál +1-et kér (`POST /hit`); más oldalról / közvetlen hívással nem lehet számolni.
  Kiolvasás: `GET /` → `{"osszes": N}`.
- Személyes adatot nem tárol (nincs IP, nincs süti).

## Telepítés a Cloudflare felületén (egyszer)
1. Cloudflare → **Workers & Pages** → **Create** → „Hello World” sablon → név: `kelenref-szamlalo` → **Deploy**.
2. **Edit code** → a teljes kódot cseréld a `worker.js` tartalmára → **Deploy**.
3. A Worker oldalán **Settings → Bindings → Add → D1 database**: változónév `DB`, adatbázis `kelenref-szamlalo` → mentés / **Deploy**.
4. A Worker címe: `https://kelenref-szamlalo.<fiók>.workers.dev` – ezt kell a `config.js`-be és a CSP-be írni.

Parancssorból ugyanez: a `szamlalo/` mappában `npx wrangler deploy` (a `wrangler.toml` alapján).

## Napi adatok megnézése
Cloudflare → D1 → `kelenref-szamlalo` → Console:
`SELECT * FROM napi ORDER BY nap DESC;`
