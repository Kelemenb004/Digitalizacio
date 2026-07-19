# app.js – összetett igehely-linkelés (több szakasz külön link)

Ez a változás a FŐOLDAL (app.js) igehely-linkelését bővíti, hogy a több szakaszos
igehelyek (pl. "Zsd.1:1-3, 3:1-3") minden szakasza KÜLÖN kattintható link legyen.
Az egyszerű (egy szakaszos) igehelyek pontosan ugyanúgy működnek mint eddig.

## 1. LÉPÉS – Új függvények hozzáadása

Add hozzá az alábbi három függvényt az app.js-hez, a meglévő `igehelyToSzentiras`
függvény MELLÉ (közvetlenül utána). A régi `igehelyToSzentiras`-t NE töröld
(maradhat, csak már nem a createCard használja).

```javascript
// ===== ÖSSZETETT IGEHELY-LINKELÉS (több szakasz külön link) =====
function igehelySzakaszok(raw) {
  if (!raw) return [];
  let s = String(raw).trim();
  s = s.replace(/^(lecti[oó]|textus|lextus)\s*:?\s*/i, '').trim();
  s = s.split(/\s+(?:lecti[oó]|te[xz3]+tus)\s*[:.]?\s*/i)[0].trim();
  s = s.replace(/\bev\.?\s*/i, '');
  const zsoltM = s.match(/^(\d+)\.\s*(zsolt[a-záéó]*)\s*(.*)$/i);
  if (zsoltM) {
    const fej = zsoltM[1];
    let mar = zsoltM[3].trim().replace(/\s+/g, '').replace(/[-–,;.\s]+$/, '').replace(/:/g, ',');
    const url = 'https://szentiras.eu/RUF/' + encodeURIComponent(mar ? `Zsolt${fej},${mar}` : `Zsolt${fej}`);
    return [{ text: raw, url }];
  }
  const tokens = s.split(/(\s*[;,]\s*)/);
  const parsed = [];
  let ukonyv = null, ufej = null, voltVers = false;
  for (const tok of tokens) {
    const r = tok.trim();
    if (!r || /^[;,\s]*$/.test(r)) continue;
    const km = r.match(/^((?:[IVXivx]+\.?\s*)?(?:\d\.?\s*)?[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű.\s]*?)\s*([:\d].*)?$/);
    let mar;
    if (km && km[1].trim() && /[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]/.test(km[1])) {
      ukonyv = km[1].trim();
      mar = (km[2] || '').trim().replace(/^:/, '').trim();
    } else {
      mar = r;
    }
    if (!mar) {
      parsed.push({ text: r, konyv: ukonyv, fej: null, vers: null }); voltVers = false;
    } else if (mar.includes(':')) {
      const idx = mar.indexOf(':');
      ufej = mar.slice(0, idx).trim();
      parsed.push({ text: r, konyv: ukonyv, fej: ufej, vers: mar.slice(idx + 1).trim() }); voltVers = true;
    } else {
      if (voltVers && ufej) parsed.push({ text: r, konyv: ukonyv, fej: ufej, vers: mar });
      else { ufej = mar; parsed.push({ text: r, konyv: ukonyv, fej: mar, vers: null }); voltVers = false; }
    }
  }
  return parsed.map(p => {
    const rov = p.konyv ? konyvRovidites(p.konyv) : null;
    if (!rov) return { text: p.text, url: null };
    let url;
    if (p.fej === null) {
      url = 'https://szentiras.eu/RUF/' + encodeURIComponent(rov);
    } else {
      let hiv = p.fej + (p.vers ? ':' + p.vers : '');
      hiv = hiv.replace(/\s+/g, '').replace(/[-–;,.\s]+$/, '').replace(/:/g, ',');
      url = 'https://szentiras.eu/RUF/' + encodeURIComponent(hiv ? rov + hiv : rov);
    }
    return { text: p.text, url };
  });
}

function konyvRovidites(konyv) {
  let norm = konyv.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const rom = { v:'5', iv:'4', iii:'3', ii:'2', i:'1' };
  const rm = norm.match(/^(iv|iii|ii|i|v)[.,:]?\s*([a-z])/);
  if (rm) norm = rom[rm[1]] + norm.slice(rm.index + rm[1].length).replace(/^[.,:\s]+/, '');
  norm = norm.replace(/[.\s:,]/g, '');
  return BIBLIAI_KONYVEK[norm] || null;
}

function renderIgehely(raw) {
  if (!raw) return '';
  const segs = igehelySzakaszok(raw);
  const hasLink = segs.some(s => s.url);
  if (!hasLink) return escHtml(raw);
  if (segs.length === 1) {
    return `<a class="igehely-link" href="${segs[0].url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(raw)}</a>`;
  }
  return segs.map(s => s.url
    ? `<a class="igehely-link" href="${s.url}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(s.text)}</a>`
    : escHtml(s.text)
  ).join(', ');
}
```

## 2. LÉPÉS – A createCard módosítása

A createCard függvényben keresd meg a lectioHtml és textusHtml építését. A jelenlegi:

```javascript
  const lectioLink = igehelyToSzentiras(lecture.lectio);
  const lectioHtml     = lecture.lectio
    ? `<p class="card-igehely"><span class="igehely-label">Lectió:</span> ${
        lectioLink
          ? `<a class="igehely-link" href="${lectioLink}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(lecture.lectio)}</a>`
          : escHtml(lecture.lectio)
      }</p>` : '';
  const textusLink = igehelyToSzentiras(lecture.textus);
  const textusHtml     = lecture.textus
    ? `<p class="card-igehely"><span class="igehely-label">Textus:</span> ${
        textusLink
          ? `<a class="igehely-link" href="${textusLink}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">${escHtml(lecture.textus)}</a>`
          : escHtml(lecture.textus)
      }</p>` : '';
```

Cseréld le erre az egyszerűbb változatra (a renderIgehely mindent elintéz):

```javascript
  const lectioHtml = lecture.lectio
    ? `<p class="card-igehely"><span class="igehely-label">Lectió:</span> ${renderIgehely(lecture.lectio)}</p>` : '';
  const textusHtml = lecture.textus
    ? `<p class="card-igehely"><span class="igehely-label">Textus:</span> ${renderIgehely(lecture.textus)}</p>` : '';
```

## 3. FONTOS
- A BIBLIAI_KONYVEK térkép már létezik az app.js-ben, azt használja a konyvRovidites.
- Az escHtml már létezik.
- Teszteld: egy egyszerű igehely (pl. János 3:16) ugyanúgy egy link legyen; egy
  összetett (pl. "Zsd.1:1-3, 3:1-3" vagy "Efezus 3:14-21; János 3:16") pedig
  KÉT/TÖBB külön link egymás mellett, vesszővel elválasztva.
