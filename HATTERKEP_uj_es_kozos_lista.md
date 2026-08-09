# Új hero-háttérkép + a két lista egységesítése

## MI VÁLTOZIK
1. Új kép: hero-kazetta-biblia.jpg (a kazettás-bibliás fotó, webre optimalizálva:
   1920x864, 184 KB) → az images/ mappába.
2. A hero-lista (app.js) és a háttér-lista (config.js) EGYSÉGESÍTVE: mindkettő ugyanazt
   a képkészletet használja, és bekerül az új kép is.
3. JAVÍTÁS: a mostani app.js hivatkozik egy már TÖRÖLT képre
   (images/296bbcb1-...jpg) - ezt kivesszük, mert különben néha üres a hero.

## 1) A KÉP ELHELYEZÉSE
Tedd a letöltött hero-kazetta-biblia.jpg-t az images/ mappába.

## 2) APP.JS – a HERO_BACKGROUNDS lista cseréje

Keresd meg:
```javascript
const HERO_BACKGROUNDS = [
  'images/hero-kazetta.jpg',
  'images/296bbcb1-66d6-4a46-b1aa-0592a334b87c.jpg',
  'images/2b4a6b5b-53a9-45f3-b229-f348044ae02a.jpg',
  'images/6acb67bc-a5c1-4b85-9e49-481b9143d5e1.jpg',
  'images/hero-1.jpg',
  'images/hero-2.jpg',
  'images/hero-3.jpg',
  'images/hero-4.jpg',
  'images/a9b90fc1-820a-418e-ad18-3ea2c8ad491e.jpg',
];
```

Cseréld erre (a törölt 296bbcb1 KIVÉVE, az új kép HOZZÁADVA):
```javascript
const HERO_BACKGROUNDS = [
  'images/hero-kazetta-biblia.jpg',
  'images/hero-kazetta.jpg',
  'images/hero-1.jpg',
  'images/hero-2.jpg',
  'images/hero-3.jpg',
  'images/hero-4.jpg',
  'images/2b4a6b5b-53a9-45f3-b229-f348044ae02a.jpg',
  'images/6acb67bc-a5c1-4b85-9e49-481b9143d5e1.jpg',
  'images/a9b90fc1-820a-418e-ad18-3ea2c8ad491e.jpg',
];
```

## 3) CONFIG.JS – a BACKGROUND.images lista cseréje

Keresd meg:
```javascript
    images: ['images/hero-1.jpg', 'images/hero-2.jpg', 'images/hero-3.jpg', 'images/hero-4.jpg'],
```

Cseréld erre (ugyanaz a teljes készlet, mint a hero - így "legyen mindegyik kép mindegyikben"):
```javascript
    images: ['images/hero-kazetta-biblia.jpg', 'images/hero-kazetta.jpg', 'images/hero-1.jpg', 'images/hero-2.jpg', 'images/hero-3.jpg', 'images/hero-4.jpg', 'images/2b4a6b5b-53a9-45f3-b229-f348044ae02a.jpg', 'images/6acb67bc-a5c1-4b85-9e49-481b9143d5e1.jpg', 'images/a9b90fc1-820a-418e-ad18-3ea2c8ad491e.jpg'],
```

## MEGJEGYZÉSEK
- A hatterkep og picture.JPG-t SZÁNDÉKOSAN nem tettük a listákba - az a megosztási
  (OpenGraph) kép, külön szerepe van, nem hero.
- Mindkét lista most a 9 létező képet tartalmazza (a törölt 296bbcb1 nélkül). Így a hero
  és a mögöttes háttér is ugyanabból a készletből választ véletlenszerűen.
- Mivel a két véletlen választás FÜGGETLEN, előfordulhat hogy fent és mögötte ugyanaz a
  kép - ez ritka és nem zavaró (a mögöttes erősen elmosott + fakó). Ha mégis zavarna,
  később megoldható hogy a háttér a herótól KÜLÖNBÖZŐt válasszon.

## TESZTELÉS
- Töltsd újra az oldalt többször (Ctrl+Shift+R): változzon a hero-kép, és jelenjen meg
  köztük az új kazettás-bibliás is.
- A mögöttes (elmosott) háttér is változzon, és az új kép ott is előforduljon.
- Egyik betöltésnél se legyen üres/hiányzó hero (a törölt képre már nincs hivatkozás).
