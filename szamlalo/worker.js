/* =====================================================================
   kelenref-szamlalo – a kelenref100.hu megtekintés-számlálója
   Cloudflare Worker + D1 adatbázis (kelenref-szamlalo, kötés neve: DB)

     POST /hit  → +1 megtekintés, válasz: {"osszes": N}   (csak a kelenref100.hu-ról)
     GET  /     → {"osszes": N}                            (bárhonnan olvasható)

   Személyes adatot NEM tárol: csak az összesített számot és a napi darabszámot
   (napi tábla: nap = UTC dátum). Nincs IP-cím, nincs süti.
   ===================================================================== */
const ENGEDELYEZETT = ['https://kelenref100.hu', 'https://www.kelenref100.hu'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ENGEDELYEZETT.includes(origin) ? origin : '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const valasz = (adat, status = 200) => new Response(JSON.stringify(adat), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);

    // Számlálás: csak a weboldalról érkező kérést fogadjuk el
    if (request.method === 'POST' && url.pathname === '/hit') {
      if (!ENGEDELYEZETT.includes(origin)) return valasz({ hiba: 'nem engedélyezett' }, 403);
      const [osszes] = await env.DB.batch([
        env.DB.prepare("UPDATE szamlalo SET ertek = ertek + 1 WHERE nev = 'osszes' RETURNING ertek"),
        env.DB.prepare("INSERT INTO napi (nap, ertek) VALUES (date('now'), 1) ON CONFLICT(nap) DO UPDATE SET ertek = ertek + 1"),
      ]);
      return valasz({ osszes: (osszes.results[0] && osszes.results[0].ertek) || 0 });
    }

    // Lekérdezés (számlálás nélkül)
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/osszes')) {
      const sor = await env.DB.prepare("SELECT ertek FROM szamlalo WHERE nev = 'osszes'").first();
      return valasz({ osszes: (sor && sor.ertek) || 0 });
    }

    return valasz({ hiba: 'ismeretlen cím' }, 404);
  },
};
