# Digitális Hangarchívum

A Budapest-Kelenföldi Református Egyházközség digitalizált igehirdetéseinek böngészője.

A gyülekezet kazettatárából digitalizált és a gyülekezet saját digitális archívumából származó felvételek (prédikációk, bibliaórák, evangelizációk) kereshető, szűrhető webes gyűjteménye.

## Technológia

- **Frontend:** statikus HTML + CSS + vanilla JavaScript (szerver nélkül futtatható)
- **Hangtárolás:** Cloudflare R2 (publikus bucket, MP3 fájlok)
- **Adatok:** `lectures.json` – a felvételek metaadatai (cím, előadó, dátum, igehely, hossz stb.)

## Beállítás

A `config.js` fájlban állítható:

- `R2_BASE_URL` – a Cloudflare R2 bucket publikus URL-je
- `INITIAL_PAGE_SIZE` / `PAGE_SIZE` – hány kártya jelenjen meg elsőre / a „Tovább” gombra
- `BACKGROUND` – a háttérképek listája és beállításai

## Helyi futtatás

```bash
python -m http.server 8080
```

Majd nyisd meg: `http://localhost:8080`

## Igehirdető-oldalak

A `lectures.json` változása után: `python igehirdeto_generator.py` (a gyökérből). Ez írja az `igehirdeto/`, `igehirdetok/` oldalakat és a `sitemap.xml`-t.
