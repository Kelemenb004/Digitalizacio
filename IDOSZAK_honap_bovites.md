# Időszak-kereső BŐVÍTÉS: hónapnév-felismerés (prefix-alapú)

A meglévő időszak-kereső (év + év-hónap) már működik. Ez a bővítés hozzáadja:
- Önálló hónapnév keresése ("december" -> minden évből a decemberiek).
- Előadó + hónap ("Takaró Károly december" -> az ő decemberi felvételei).
- Hónapnév-rövidítés ("dec", "már", "szep").
- PREFIX-alapú felismerés: egy szó akkor hónap, ha egy hónapnév ELEJE. Így "márk"
  a Márk evangélium marad (nem március), "janos" a János (nem január), "julia" a
  Júlia (nem július) - nincs névütközés, és a rövidítések mégis működnek.

## MI VÁLTOZIK az app.js-ben

A korábbi parseDatumKereses függvényt (és a HONAP_NEVEK objektumot) CSERÉLD LE erre a
bővített, prefix-alapú változatra. A többi (applyFilters, yearFilter, stb.) VÁLTOZATLAN
marad - CSAK a parseDatumKereses + HONAP_NEVEK cserélődik, PLUSZ az applyFilters-ben a
hónap-minta illesztést kell hozzáadni (lásd lentebb).

### 1) A parseDatumKereses + HONAP_NEVEK cseréje

Keresd meg a jelenlegi `const HONAP_NEVEK = {...}` objektumot ÉS a `function parseDatumKereses(q){...}`
függvényt, és cseréld le MINDKETTŐT erre:

```javascript
// Hónapnevek -> sorszám. A felismerés PREFIX-alapú: egy min. 3 betűs szó akkor
// számít hónapnak, ha egy hónapnév ELEJE (pl. "már"/"márc" -> március, de "márk" nem,
// mert a "marcius" nem kezdődik "mark"-kal). Így nincs névütközés (János, Júlia, Márk...).
const HONAP_NEVEK = [
  ['januar','01'], ['februar','02'], ['marcius','03'], ['aprilis','04'],
  ['majus','05'], ['junius','06'], ['julius','07'], ['augusztus','08'],
  ['szeptember','09'], ['oktober','10'], ['november','11'], ['december','12']
];
function honapPrefix(szo) {
  if (szo.length < 3) return null;
  for (const [hnev, hszam] of HONAP_NEVEK) {
    if (hnev.startsWith(szo)) return hszam;
  }
  return null;
}
function parseDatumKereses(q) {
  let qn = normalizeStr(q);
  const evMintak = [];
  const honapMintak = [];
  qn = qn.replace(/\b(19\d{2}|20[01]\d)[\s.\-]+(\d{1,2})\b/g, (all, ev, ho) => {
    const h = ho.padStart(2, '0');
    if (+h >= 1 && +h <= 12) { evMintak.push(`${ev}-${h}`); return ' '; }
    return all;
  });
  qn = qn.replace(/\b(19\d{2}|20[01]\d)\s+([a-z]{3,})\b/g, (all, ev, szo) => {
    const h = honapPrefix(szo);
    if (h) { evMintak.push(`${ev}-${h}`); return ' '; }
    return all;
  });
  qn = qn.replace(/\b([a-z]{3,})\s+(19\d{2}|20[01]\d)\b/g, (all, szo, ev) => {
    const h = honapPrefix(szo);
    if (h) { evMintak.push(`${ev}-${h}`); return ' '; }
    return all;
  });
  qn = qn.replace(/\b(19\d{2}|20[01]\d)\b/g, (a, ev) => { evMintak.push(ev); return ' '; });
  qn = qn.replace(/\b[a-z]{3,}\b/g, (szo) => {
    const h = honapPrefix(szo);
    if (h) { honapMintak.push(`-${h}`); return ' '; }
    return szo;
  });
  return { szoveg: qn.replace(/\s+/g, ' ').trim(), evMintak, honapMintak };
}
```

FIGYELEM: a mező-nevek most evMintak / honapMintak / szoveg (a korábbi datumMintak helyett
evMintak). Ezért az applyFilters-ben is frissíteni kell (lásd 2. pont).

### 2) Az applyFilters frissítése

Keresd meg az applyFilters-ben ahol a parseDatumKereses eredményét használod. A korábbi:
```javascript
  const { szoveg: qSzoveg, datumMintak } = parseDatumKereses(dom.searchInput?.value || '');
```
Cseréld erre:
```javascript
  const { szoveg: qSzoveg, evMintak, honapMintak } = parseDatumKereses(dom.searchInput?.value || '');
```

Majd keresd meg a szűrő-blokkban a dátum-illesztést:
```javascript
    if (datumMintak.length) {
      const d = l.datum || '';
      if (!datumMintak.some(m => d.startsWith(m))) return false;
    }
```
Cseréld erre (év-minta ÉS hónap-minta külön):
```javascript
    // Év / év-hónap minta (a keresőmezőből): a datum kezdődjön a mintával
    if (evMintak.length) {
      const d = l.datum || '';
      if (!evMintak.some(m => d.startsWith(m))) return false;
    }
    // Önálló hónap-minta (bármely évből): a datum 5-7. karaktere a hónap
    if (honapMintak.length) {
      const d = l.datum || '';
      if (d.length < 7 || !honapMintak.some(m => d.slice(4, 7) === m)) return false;
    }
```

## TESZTELÉS
python -m http.server 8080, majd a keresőmezőbe:
- "december" -> ~127 találat (minden év decembere)
- "dec" -> ugyanaz (~127), NE legyen üres
- "Takaró Károly december" -> ~82 (az ő decemberi felvételei)
- "már" vagy "márc" -> március (~86)
- "Márk" -> a Márk evangéliumos felvételek (~74), NEM március
- "János" -> János (~311), NEM január
- "Hamar Júlia" -> 2 találat, NEM július
- "2006 december" / "2006 dec" -> a 2006 decemberiek (~11)
- "Pocsaji Miklós 2006 június" -> 3 (változatlanul jó)
- "Cseri Kálmán" -> 4 (dátum nélkül, változatlan)

A lényeg: a rövidítések (dec, jan, feb) MINDIG mutassanak találatot (ne adják fel a
keresést), de a nevek (Márk, János, Júlia) ne szűrjenek tévesen hónapra.
