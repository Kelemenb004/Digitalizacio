const CONFIG = {
  // Cloudflare R2 public bucket URL – cseréld ki a saját bucket URL-edre
  R2_BASE_URL: 'https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev',

  SITE_NAME: 'Digitális Hangarchívum',
  SITE_SUBTITLE: 'Digitalizált Igehirdetések gyűjteménye',

  // Hány másodpercet ugorjon a lejátszó a skip gomboknál
  SKIP_SECONDS: 10,

  // Alapértelmezett hangerő (0–1)
  DEFAULT_VOLUME: 0.85,

  // Hány kártyát jelenítsen meg ELSŐRE (első betöltéskor)
  INITIAL_PAGE_SIZE: 18,

  // Hány további kártyát töltsön be a "Tovább" gomb minden kattintásra
  PAGE_SIZE: 50,

  // Háttérkép beállítások
  BACKGROUND: {
    enabled: true,
    mode: 'random',        // 'static' (mindig [0]) vagy 'random' (véletlenszerű)
    images: ['images/hero-kazetta-biblia.jpg', 'images/hero-kazetta.jpg', 'images/hero-1.jpg', 'images/hero-2.jpg', 'images/hero-3.jpg', 'images/hero-4.jpg', 'images/2b4a6b5b-53a9-45f3-b229-f348044ae02a.jpg', 'images/6acb67bc-a5c1-4b85-9e49-481b9143d5e1.jpg', 'images/a9b90fc1-820a-418e-ad18-3ea2c8ad491e.jpg'],
    overlayColor: 'rgba(245,240,232,0.88)',
    blur: '3px',
  },
};
