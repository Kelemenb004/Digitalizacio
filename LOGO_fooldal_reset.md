# A logóra kattintás: valódi főoldal-visszatérés (teljes újratöltés)

## A PROBLÉMA
A bal felső logóra kattintva a goHome() jelenleg csak a szűrőket törli és felgörget,
DE a lejátszó tovább szól, és a `#felvetel=...` a linkben marad. Ha innen valaki
megosztja a linket vagy újratölt, a régi felvételt kapja.

## A MEGOLDÁS
A logó töltse be tisztán a főoldalt (mint egy linkkattintás) - ez mindent alaphelyzetbe
tesz: lejátszó leáll, link tisztul, szűrők/keresés törlődik, a lap a tetejére kerül.
Egyszerű és megbízható.

## APP.JS

Keresd meg a goHome függvényt (a homeLogo kezelésnél):

```javascript
  const homeLogo = document.getElementById('homeLogo');
  function goHome() {
    resetFilters();                                   // minden szűrő + keresés törlése (a fav-nézetet is)
    window.scrollTo({ top: 0, behavior: 'smooth' });  // görgetés a lap tetejére
  }
  if (homeLogo) {
    homeLogo.addEventListener('click', goHome);
    homeLogo.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
    });
  }
```

Cseréld le a goHome törzsét erre (teljes újratöltés a tiszta főoldal-URL-re):

```javascript
  const homeLogo = document.getElementById('homeLogo');
  function goHome() {
    // Valódi főoldal-visszatérés: tiszta újratöltés a hash (#felvetel=...) NÉLKÜL.
    // Ez mindent alaphelyzetbe tesz - lejátszó leáll, link tisztul, szűrők/keresés törlődik.
    // Ha már a tiszta főoldalon vagyunk (nincs hash), csak felgörgetünk, nem töltünk újra feleslegesen.
    if (window.location.hash || window.location.search) {
      window.location.href = window.location.pathname;   // pl. "/" -> teljes újratöltés
    } else {
      resetFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  if (homeLogo) {
    homeLogo.addEventListener('click', goHome);
    homeLogo.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
    });
  }
```

## MIÉRT ÍGY?
- Ha van hash (#felvetel=...) VAGY keresési paraméter -> teljes újratöltés a tiszta
  útvonalra: a böngésző újratölti a főoldalt, minden alaphelyzetbe kerül. Ez pontosan
  az amit a felhasználó vár ("mintha most jönnék az oldalra").
- Ha MÁR tiszta a főoldal (nincs hash/search) -> nincs értelme újratölteni, csak
  felgörgetünk és biztos ami biztos törljük a szűrőket. Így ha valaki csak lentről
  akar a tetejére ugrani, nem "villan" az újratöltés.

## TESZTELÉS (python -m http.server 8080)
1. Indíts el egy felvételt (a link legyen #felvetel=...), majd kattints a logóra:
   - Az oldal újratölt, a lejátszó ELTŰNIK (nem szól tovább), a link tiszta (#-nélkül),
     a lap a tetején van, a szűrők/keresés üres.
2. Görgess le a tiszta főoldalon (ne legyen lejátszás/keresés), kattints a logóra:
   - Csak felgörget, NEM tölt újra (nincs villanás).
3. Írj be egy keresést, majd logó -> a keresés törlődik (a search paraméter miatt újratölt,
   vagy ha nincs search-paraméter, a resetFilters törli - mindenképp tiszta lesz).
4. Billentyűzet: a logón Enter/Space ugyanígy működjön.
