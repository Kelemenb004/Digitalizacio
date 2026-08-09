# Megosztott link: ugyanaz a telefon-crash megelőzése (a random-fix párja)

## A PROBLÉMA
Ugyanaz a mechanizmus, mint a randomnál: ha valaki megoszt egy MÉLYEN a listában lévő
felvételt (pl. 800. elem), és a címzett TELEFONON nyitja meg, a handleUrlHash ->
revealCard a while-ciklusban több száz kártyát renderel ki egyszerre -> a telefon
megfagy / összeomlik / 404.

## A MEGOLDÁS
Ugyanaz a tiszta minta, mint a randomnál: a megosztott felvétel is a LISTA TETEJÉRE
kerül, kiemelve. Nulla tömeges renderelés, garantáltan stabil telefonon is.

═══════════════════════════════════════════════════════════════════
## APP.JS – a handleUrlHash cseréje
═══════════════════════════════════════════════════════════════════
Keresd meg:
```javascript
function handleUrlHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#felvetel=')) return;
  try {
    const path = decodeURIComponent(hash.slice('#felvetel='.length));
    const lecture = state.lectures.find(l => l.path === path);
    if (!lecture) return;
    startPlaying(lecture);
    // Megosztott linkből érkezés: gördülő figyelemfelhívással
    revealCard(lecture.path, { highlight: true });
  } catch {}
}
```
Cseréld erre:
```javascript
function handleUrlHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#felvetel=')) return;
  try {
    const path = decodeURIComponent(hash.slice('#felvetel='.length));
    const lecture = state.lectures.find(l => l.path === path);
    if (!lecture) return;

    // A megosztott felvételt a lista ÉLÉRE emeljük, hogy a tetején jelenjen meg - így NEM
    // kell több száz kártyát betölteni a mélyből (ez fagyasztaná meg a telefont, ugyanúgy
    // mint a randomnál). A szűrők/keresés alaphelyzetbe, hogy a felvétel biztosan látszódjon.
    const pool = state.filtered.length > 0 ? state.filtered : state.lectures.slice();
    state.filtered = [lecture, ...pool.filter(l => l.path !== lecture.path)];
    state.page = 0;
    renderLectures(state.filtered);

    startPlaying(lecture);

    requestAnimationFrame(() => {
      const card = findCard(lecture.path);
      if (card) {
        scrollCardIntoView(card);
        card.classList.add('just-shared');
        setTimeout(() => card.classList.remove('just-shared'), 2600);
      }
    });
  } catch {}
}
```

## MEGJEGYZÉS
- Ez a random-fix párja: mindkét helyen (Véletlen gomb + megosztott link) a felvétel a
  lista tetejére kerül a mély-betöltés helyett.
- A revealCard függvény ezután már SEHOL nem kritikus (sem a random, sem a megosztás nem
  hívja a mély-betöltő ciklusát). Meghagyhatod (nem árt), de akár a MAX_BETOLTES korlátos
  verzió is bőven biztonságos benne. A lényeg: se a random, se a megosztás nem renderel
  már tömegesen.
- A megosztott link ugyanúgy elindítja a felvételt, kiemeli, és a tetején mutatja - a
  felhasználó azonnal látja mit osztottak meg vele.

## TESZTELÉS (telefon!)
- Ossz meg egy MÉLYEN lévő felvételt (görgess le sokat, vagy válassz egy régi dátumút),
  másold ki a megosztás-linkjét, és nyisd meg TELEFONON (új lap / másik eszköz).
  -> Az oldal NE fagyjon/crasheljen/404-eljen. A felvétel a lista tetején, kiemelve,
     elindul a hang.
- Gépen is működjön.
- A "logó = főoldal reset" utána is tisztán visszaálljon.
