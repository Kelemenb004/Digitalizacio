# Random bugfix VÉGLEGES: a teljes 1382-ből választ, a pick a lista tetejére ugrik

## A CÉL
- A "Véletlen" a TELJES archívumból válasszon (megmarad a funkció lényege).
- A kiválasztott felvétel a LISTA TETEJÉRE ugorjon, kiemelve -> azonnal látszik mi szól.
- NULLA tömeges renderelés -> telefonon sem fagy/crashel.

## HOGYAN
A random pick-et a state.filtered ÉLÉRE tesszük, újrarendereljük az első adagot (~18
kártya), a pick lesz az első, kiemelve. Nincs több száz kártya renderelése.

═══════════════════════════════════════════════════════════════════
## APP.JS – a playRandomLecture cseréje
═══════════════════════════════════════════════════════════════════
Keresd meg a JELENLEGI playRandomLecture-t (akár a korábbi crash-fix utáni verziót is,
ez FELÜLÍRJA azt):
```javascript
function playRandomLecture() {
  const pool = state.filtered.length > 0 ? state.filtered : state.lectures;
  if (!pool.length) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];
  startPlaying(pick);

  revealCard(pick.path, { highlight: true });
}
```
Cseréld erre:
```javascript
function playRandomLecture() {
  // A random a TELJES aktuális listából választ (szűrt lista, vagy ha nincs szűrő, az összes).
  const pool = state.filtered.length > 0 ? state.filtered : state.lectures.slice();
  if (!pool.length) return;

  const pick = pool[Math.floor(Math.random() * pool.length)];

  // A pick-et a lista ÉLÉRE emeljük, hogy a tetején jelenjen meg - így NEM kell több száz
  // kártyát betölteni a mélyből (ez fagyasztotta meg a telefont). A többi elem sorrendje marad.
  state.filtered = [pick, ...pool.filter(l => l.path !== pick.path)];

  // Újrarenderelés az első adaggal (a pick lesz az első kártya).
  state.page = 0;
  renderLectures(state.filtered);

  startPlaying(pick);

  // Görgessünk a lap tetejére (a pick ott az első kártya) és emeljük ki.
  requestAnimationFrame(() => {
    const card = findCard(pick.path);
    if (card) {
      scrollCardIntoView(card);
      card.classList.add('just-shared');
      setTimeout(() => card.classList.remove('just-shared'), 2600);
    }
  });
}
```

## MEGJEGYZÉSEK
- A pool = state.lectures.slice() másolat, hogy az eredeti sorrendet ne bántsuk, amikor
  a filtered-et átrendezzük.
- Ha VAN aktív szűrő (state.filtered nem üres), akkor a szűrt listából választ, és azon
  belül teszi a tetejére - a szűrő tehát tiszteletben marad.
- A revealCard betöltő-ciklusát NEM használjuk itt már (a pick a tetején van, nincs mit
  betölteni). A korábbi crash-fix (MAX_BETOLTES korlát a revealCard-ban) maradhat mint
  biztonsági háló a MEGOSZTÁS-linkhez - az nem árt. De ha visszaállítottad a revealCard-ot
  az eredeti (korlátlan) ciklusra, a megosztásnál is érdemes a MAX_BETOLTES korlátot bent
  hagyni. (A random már nem függ tőle.)

## TESZTELÉS (telefon ÉS gép)
- Nyomd a "Véletlen"-t sokszor, telefonon is: MINDIG a lista tetején jelenik meg egy
  véletlen felvétel (a teljes archívumból!), kiemelve, elindul a hang. NINCS fagyás/404.
- Ellenőrizd hogy tényleg VÁLTOZATOS (nem csak az első 18-ból) - sok nyomásra messziről
  is hoz felvételeket (régi dátumok, kdifferent előadók).
- Ha van aktív szűrő (pl. egy előadó kiválasztva), a Véletlen azon belül válasszon.
- Gépen is működjön, autolejátszással.
- A "Tovább" gomb a random utáni átrendezett listában is működjön (több felvételt tölt).
