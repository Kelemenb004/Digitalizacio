/* =====================================================================
   szamlalo.js – megtekintés-számláló a ☰ menü alján (szem ikon + szám)
   Az élő oldalon (kelenref100.hu) minden főoldal-megnyitás +1; máshol
   (pl. localhost) csak kiolvassa a számot. A számláló címe: CONFIG.SZAMLALO_URL.
   Az oldal semmit nem tárol a látogató gépén ehhez.
   ===================================================================== */
(function () {
  'use strict';
  const alap = (typeof CONFIG !== 'undefined' && CONFIG.SZAMLALO_URL) || '';
  const doboz = document.getElementById('megtekintesSzamlalo');
  const szam = document.getElementById('megtekintesSzam');
  if (!alap || !doboz || !szam) return;

  const eles = /^(www\.)?kelenref100\.hu$/.test(location.hostname);
  fetch(alap.replace(/\/+$/, '') + (eles ? '/hit' : '/'), { method: eles ? 'POST' : 'GET', cache: 'no-store' })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(adat => {
      const n = Number(adat && adat.osszes);
      if (!Number.isFinite(n) || n < 0) return;
      const szoveg = n.toLocaleString('hu-HU');
      szam.textContent = szoveg;
      doboz.title = `Az oldalt eddig ${szoveg} alkalommal tekintették meg`;
      doboz.hidden = false;
    })
    .catch(() => { /* ha a számláló nem érhető el, egyszerűen nem jelenik meg */ });
})();
