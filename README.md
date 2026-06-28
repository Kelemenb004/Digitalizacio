# Digitális Hangarchívum

A Budapest-Kelenföldi Református Egyházközség digitalizált igehirdetéseinek böngészője.

A gyülekezet kazettatárából digitalizált felvételek (prédikációk, bibliaórák, evangelizációk) kereshető, szűrhető webes gyűjteménye.

## Technológia

- **Frontend:** statikus HTML + CSS + vanilla JavaScript (szerver nélkül futtatható)
- **Hangtárolás:** Cloudflare R2 (publikus bucket, MP3 fájlok)
- **Adatok:** `lectures.json` – a felvételek metaadatai (cím, előadó, dátum, igehely, hossz stb.)

## Beállítás

A `config.js` fájlban állítható:

- `R2_BASE_URL` – a Cloudflare R2 bucket publikus URL-je
- `CHECK_R2_AVAILABILITY` – `true`: induláskor ellenőrzi, mely fájlok érhetők el az R2-n (eredmény 24 órára gyorsítótárazódik); `false`: ellenőrzés nélkül tölti be az összes felvételt (ajánlott, ha a bucket már teljes)

## Helyi futtatás

```bash
python -m http.server 8080
```

Majd nyisd meg: `http://localhost:8080`
