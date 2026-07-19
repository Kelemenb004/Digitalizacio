# "v.v." (válogatott versek) javítás – app.js ÉS igehirdeto_generator.py

## Háttér
Néhány igehelynél szerepel a "v.v." rövidítés (válogatott versek), pl. "I.Péter 2:vv",
"II.Mózes 33-34 v.v.", "Mk.1:1-15 vv.". Ez benne ragad a link URL-jében, ezért a
szentiras.eu 404-et dob. Megoldás:
- A LINK URL-hez: a "v.v." (és változatai: vv, vv., v. v., :vv) TÖRLÉSE, így csak a
  könyv+fejezet marad -> a szentiras.eu a fejezetet nyitja meg.
- A MEGJELENÍTÉSHEZ: a "v.v." helyett írjuk ki teljesen: " (válogatott versek)".

FONTOS: mindkét fájlban UGYANÚGY kell javítani (app.js + generátor), hogy a főoldal és
az előadó-oldalak egyformán működjenek. A BIBLIAI_KONYVEK térképet NE módosítsd.

═══════════════════════════════════════════════════════════════════
## 1) app.js
═══════════════════════════════════════════════════════════════════

### a) A LINK-hez: v.v. törlése az igehelySzakaszok függvényben

Keresd meg az igehelySzakaszok függvényben ezt a sort:

```javascript
  s = s.replace(/\bev\.?\s*/i, '');
```

KÖZVETLENÜL UTÁNA szúrd be ezt az új sort:

```javascript
  s = s.replace(/[:\s]*\bv\.?\s*v\.?\b\.?/gi, '').trim();  // "v.v." (válogatott versek) törlése a link URL-hez
```

### b) A MEGJELENÍTÉSHEZ: új segédfüggvény

Add hozzá ezt az új függvényt a renderIgehely függvény MELLÉ (elé vagy mögé):

```javascript
function valogatottVersek(text) {
  // "v.v." és változatai -> " (válogatott versek)" a MEGJELENÍTETT szövegben
  return text.replace(/[:\s.]*\bv\.?\s*v\.?\b\.?/gi, ' (válogatott versek)').replace(/\s+/g, ' ').trim();
}
```

### c) A renderIgehely függvényben a MEGJELENÍTETT szöveg cseréje

A renderIgehely függvényben KÉT helyen kell a megjelenített szöveget átvezetni a
valogatottVersek-en:

Keresd meg (egy szakaszos ág):
```javascript
  if (segs.length === 1) {
    return `<a class="igehely-link" href="${segs[0].url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(raw)}</a>`;
  }
```
Cseréld az `escHtml(raw)` részt `escHtml(valogatottVersek(raw))`-ra:
```javascript
  if (segs.length === 1) {
    return `<a class="igehely-link" href="${segs[0].url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(valogatottVersek(raw))}</a>`;
  }
```

Majd a több szakaszos ágban keresd meg:
```javascript
  return segs.map(s => s.url
    ? `<a class="igehely-link" href="${s.url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(s.text)}</a>`
    : escHtml(s.text)
  ).join(', ');
```
Cseréld MINDKÉT `escHtml(s.text)`-et `escHtml(valogatottVersek(s.text))`-re:
```javascript
  return segs.map(s => s.url
    ? `<a class="igehely-link" href="${s.url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(valogatottVersek(s.text))}</a>`
    : escHtml(valogatottVersek(s.text))
  ).join(', ');
```

═══════════════════════════════════════════════════════════════════
## 2) igehirdeto_generator.py
═══════════════════════════════════════════════════════════════════

### a) A LINK-hez: v.v. törlése az igehely_szakaszok függvényben

Keresd meg az igehely_szakaszok függvényben ezt a sort:

```python
    s=re.sub(r'\bev\.?\s*','',s,flags=re.I)
```

KÖZVETLENÜL UTÁNA szúrd be:

```python
    s=re.sub(r'[:\s]*\bv\.?\s*v\.?\b\.?','',s,flags=re.I).strip()  # "v.v." (valogatott versek) torlese a link URL-hez
```

### b) A MEGJELENÍTÉSHEZ: új segédfüggvény

Add hozzá ezt a függvényt a render_igehely függvény MELLÉ:

```python
def valogatott_versek(text):
    # "v.v." es valtozatai -> " (válogatott versek)" a megjelenitett szovegben
    return re.sub(r'\s+',' ',re.sub(r'[:\s.]*\bv\.?\s*v\.?\b\.?',' (válogatott versek)',text,flags=re.I)).strip()
```

### c) A render_igehely függvényben a megjelenített szöveg cseréje

A render_igehely függvényben keresd meg az egy szakaszos ágat:
```python
    if len(segs)==1:
        return f'<a class="igehely-link" href="{esc(segs[0][1])}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(raw)}</a>'
```
Cseréld az `esc(raw)`-t `esc(valogatott_versek(raw))`-ra:
```python
    if len(segs)==1:
        return f'<a class="igehely-link" href="{esc(segs[0][1])}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(valogatott_versek(raw))}</a>'
```

Majd a több szakaszos ágban keresd meg:
```python
    for szoveg,url in segs:
        if url: parts.append(f'<a class="igehely-link" href="{esc(url)}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(szoveg)}</a>')
        else: parts.append(esc(szoveg))
```
Cseréld MINDKÉT `esc(szoveg)`-et `esc(valogatott_versek(szoveg))`-re:
```python
    for szoveg,url in segs:
        if url: parts.append(f'<a class="igehely-link" href="{esc(url)}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(valogatott_versek(szoveg))}</a>')
        else: parts.append(esc(valogatott_versek(szoveg)))
```

### d) Újragenerálás
A generátor módosítása után futtasd: python igehirdeto_generator.py

═══════════════════════════════════════════════════════════════════
## TESZTELÉS
═══════════════════════════════════════════════════════════════════
python -m http.server 8080, majd keress egy v.v.-s felvételt (pl. az igehely
tartalmazza: "I.Péter 2:vv" vagy "Mk.1:1-15 vv."):
- A megjelenített szöveg: "I.Péter 2 (válogatott versek)" legyen.
- A linkre kattintva NYÍLJON MEG a szentiras.eu a helyes fejezeten (NE 404).
- Ellenőrizd a főoldalon ÉS egy előadó-oldalon is.
- A többi (nem v.v.-s) igehely maradjon változatlan.

A 10 érintett igehely: I.Péter 2:vv, 139.Zsolt.v.v., II.Mózes 33-34 v.v.,
János 1 v.v., Fil.3:vv, Kol.2:vv, Hós.2 v.v., Mk.1:1-15 vv., Ézsaiás 9 v.v., Sám.17 v.v
