# Időszak-keresés: okos kereső (évszám-felismerés) + év-szűrő a hamburger-menübe

Két funkció, hogy ne kelljen 50-esével görgetni egy konkrét időszakhoz:
- (A) OKOS KERESŐ: a keresőmező felismeri az évszámot/hónapot (pl. "Takaró Károly 2006",
  "Pocsaji Miklós 2006 június", "2008 december") és a dátumra is szűr.
- (B) ÉV-SZŰRŐ: a hamburger-menüben egy legördülő az évekkel (1990-2010).

═══════════════════════════════════════════════════════════════════
## 1) APP.JS – okos kereső (dátum-felismerés)
═══════════════════════════════════════════════════════════════════

### a) Segédfüggvény: dátum kinyerése a keresőszövegből

Add hozzá az app.js-hez (a normalizeStr közelébe, a segédfüggvények közé):

```javascript
// A keresőszövegből kinyeri az évszám / év-hónap mintákat.
// Visszaad: { szoveg: "maradék keresőszöveg", datumMintak: ["2006", "2006-06", ...] }
const HONAP_NEVEK = {
  januar:'01', februar:'02', marcius:'03', aprilis:'04', majus:'05', junius:'06',
  julius:'07', augusztus:'08', szeptember:'09', oktober:'10', november:'11', december:'12'
};
function parseDatumKereses(q) {
  let qn = normalizeStr(q);
  const mintak = [];
  // "2006-12" / "2006.12" / "2006 12"
  qn = qn.replace(/\b(19\d{2}|20[01]\d)[\s.\-]+(\d{1,2})\b/g, (all, ev, ho) => {
    const h = ho.padStart(2, '0');
    if (+h >= 1 && +h <= 12) { mintak.push(`${ev}-${h}`); return ' '; }
    return all;
  });
  // "2006 december" és "december 2006"
  for (const [hnev, hszam] of Object.entries(HONAP_NEVEK)) {
    qn = qn.replace(new RegExp(`\\b(19\\d{2}|20[01]\\d)\\s+${hnev}\\b`, 'g'), (a, ev) => { mintak.push(`${ev}-${hszam}`); return ' '; });
    qn = qn.replace(new RegExp(`\\b${hnev}\\s+(19\\d{2}|20[01]\\d)\\b`, 'g'), (a, ev) => { mintak.push(`${ev}-${hszam}`); return ' '; });
  }
  // önálló évszám "2006"
  qn = qn.replace(/\b(19\d{2}|20[01]\d)\b/g, (a, ev) => { mintak.push(ev); return ' '; });
  return { szoveg: qn.replace(/\s+/g, ' ').trim(), datumMintak: mintak };
}
```

### b) Az applyFilters módosítása

Keresd meg az applyFilters függvényben ezt a részt:

```javascript
    if (q) {
      const hay = normalizeStr([l.cim, l.eloado, l.lectio, l.textus, l.megjegyzes].join(' '));
      if (!hay.includes(q)) return false;
    }
```

A függvény ELEJÉN (a const q = ... sor UTÁN) számold ki a dátum-mintát EGYSZER:

Keresd meg:
```javascript
  const q       = normalizeStr(dom.searchInput?.value || '');
```
és KÖZVETLENÜL UTÁNA szúrd be:
```javascript
  const { szoveg: qSzoveg, datumMintak } = parseDatumKereses(dom.searchInput?.value || '');
  const yearSel = dom.yearFilter?.value || '';
```

Majd a fenti `if (q) { ... }` blokkot cseréld le erre (a q helyett a szétbontott szöveget + dátumot használja):

```javascript
    // Év-szűrő (hamburger-menüből)
    if (yearSel && (l.datum || '').slice(0, 4) !== yearSel) return false;

    // Okos kereső: dátum-minta illesztése (a keresőmezőben megadott év/hónap)
    if (datumMintak.length) {
      const d = l.datum || '';
      if (!datumMintak.some(m => d.startsWith(m))) return false;
    }

    // Okos kereső: a maradék szöveg a megszokott mezőkben
    if (qSzoveg) {
      const hay = normalizeStr([l.cim, l.eloado, l.lectio, l.textus, l.megjegyzes].join(' '));
      if (!hay.includes(qSzoveg)) return false;
    }
```

FONTOS: a régi `const q` sort HAGYD MEG (más helyen még használhatja pl. az isDefaultMode),
csak a szűrési blokkot cseréld. Ha az isDefaultMode a q-t nézi, az továbbra is jó.

### c) A yearFilter regisztrálása a dom objektumban és eseménykezelő

Keresd meg a dom objektumban a szűrők felsorolását (pl. speakerFilter: g('speakerFilter')),
és add hozzá:
```javascript
    yearFilter:      g('yearFilter'),
```

Keresd meg ahol a szűrők change-eseményét kötik (pl. dom.speakerFilter.addEventListener('change', ...)),
és add hozzá ugyanígy:
```javascript
  dom.yearFilter?.addEventListener('change', () => { refreshFilterOptions(); applyFilters(); });
```

### d) Az év-legördülő feltöltése + a resetFilters

Keresd meg ahol a szűrők opcióit feltöltik (pl. appendOptions(dom.speakerFilter, előadók)
vagy a kezdeti feltöltés). Add hozzá az évek feltöltését. Az évek a lectures.json datum
mezőiből jönnek (csökkenő sorrendben, újabb elöl):

```javascript
  // Év-szűrő feltöltése (a datum mezőkből, csökkenő sorrendben)
  const evek = [...new Set(state.lectures
    .map(l => (l.datum || '').slice(0, 4))
    .filter(ev => /^\d{4}$/.test(ev)))].sort((a, b) => b.localeCompare(a));
  if (dom.yearFilter) {
    evek.forEach(ev => {
      const opt = document.createElement('option');
      opt.value = ev; opt.textContent = ev;
      dom.yearFilter.appendChild(opt);
    });
  }
```

A resetFilters függvényben (ahol a többi szűrőt üríti, pl. dom.speakerFilter.value = '')
add hozzá:
```javascript
  if (dom.yearFilter) dom.yearFilter.value = '';
```

### e) (Ha van okos/függő szűrő - refreshFilterOptions/rebuildSelect)
Ha a kódban van refreshFilterOptions ami a szűrőket egymáshoz igazítja (dependent filters),
akkor az év-szűrőt is érdemes bevonni: a kiválasztott előadó/kategória alapján csak azok az
évek maradjanak, amikben van felvétel. Ez OPCIONÁLIS finomítás - ha bonyolult, első körben
elég ha az év-szűrő az ÖSSZES évet mutatja (a fenti d) pont szerint), és csak szűr.

═══════════════════════════════════════════════════════════════════
## 2) INDEX.HTML – év-szűrő a hamburger-menübe
═══════════════════════════════════════════════════════════════════

A filters-panel-body-ban, az Előadó szűrő UTÁN (és az Igehely ELÉ) szúrd be az év-szűrőt,
a meglévő filter-field mintájára:

Keresd meg:
```html
        <label class="filter-field">
          <span class="filter-field-label">Előadó</span>
          <select id="speakerFilter" aria-label="Előadó szűrő"><option value="">Minden előadó</option></select>
        </label>
```
és UTÁNA szúrd be:
```html
        <label class="filter-field">
          <span class="filter-field-label">Év</span>
          <select id="yearFilter" aria-label="Év szűrő"><option value="">Minden év</option></select>
        </label>
```

Emellett a keresőmező placeholder-ét érdemes frissíteni, hogy jelezze az időpont-keresést.
Keresd meg a searchInput placeholderét (pl. "Keresés cím, előadó, igehely szerint...") és
egészítsd ki:
```
placeholder="Keresés cím, előadó, igehely, év szerint… (pl. Takaró Károly 2006)"
```

═══════════════════════════════════════════════════════════════════
## TESZTELÉS
═══════════════════════════════════════════════════════════════════
python -m http.server 8080, majd:

OKOS KERESŐ (a keresőmezőbe írva):
- "Takaró Károly 2006" -> csak a 2006-os Takaró Károly felvételek (kb. 55).
- "Pocsaji Miklós 2006 június" -> a 2006 júniusi Pocsaji istentiszteletek (3 db).
- "2008 december" -> minden 2008 decemberi felvétel.
- "Cseri Kálmán" (dátum nélkül) -> a megszokott keresés, változatlanul.

ÉV-SZŰRŐ (hamburger-menü):
- Nyisd meg a szűrőket, válaszd ki pl. a 2006-ot -> csak 2006-os felvételek.
- Kombináld az előadó-szűrővel (pl. Takaró Károly + 2006) -> a metszet.
- A "Minden év" visszaállítja.
- A resetFilters (ha van "alaphelyzet" gomb vagy a home-logó) az évet is nullázza.

Mindkettő működjön együtt a meglévő szűrőkkel (kategória, előadó, igehely, rendezés, kedvencek).
