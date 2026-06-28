const CONFIG = {
  // Cloudflare R2 public bucket URL – cseréld ki a saját bucket URL-edre
  R2_BASE_URL: 'https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev',

  SITE_NAME: 'Digitális Hangarchívum',
  SITE_SUBTITLE: 'Digitalizált Igehirdetések gyűjteménye',

  // Hány másodpercet ugorjon a lejátszó a skip gomboknál
  SKIP_SECONDS: 10,

  // Alapértelmezett hangerő (0–1)
  DEFAULT_VOLUME: 0.85,

  // Hány kártyát jelenítsen meg egyszerre ("Tovább" gombig)
  PAGE_SIZE: 50,

  // Háttérkép beállítások
  BACKGROUND: {
    enabled: true,
    mode: 'random',        // 'static' (mindig [0]) vagy 'random' (véletlenszerű)
    images: ['images/bg1.JPG', 'images/bg2.JPG', 'images/bg3.JPG'],
    overlayColor: 'rgba(245,240,232,0.88)',
    blur: '3px',
  },
};
