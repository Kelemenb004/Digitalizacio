# -*- coding: utf-8 -*-
"""Igehirdeto-oldalak generatora - kelenref100.hu
Futtasd a PROJEKT GYOKEREBOL: python igehirdeto_generator.py
Idempotens (ujrafuttathato). Letrehozza: igehirdeto/<slug>.html, igehirdetok.html,
igehirdeto.js, frissiti a sitemap.xml-t es a style.css-t, javitja a 0998-as datumot."""
import os
LECTURES_PATH = "lectures.json"

# -*- coding: utf-8 -*-
import json, re, os, unicodedata, html
from collections import Counter, defaultdict
from urllib.parse import quote

R2_BASE_URL = "https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev"
SITE = "https://kelenref100.hu"
HONAPOK = ["január","február","március","április","május","június",
           "július","augusztus","szeptember","október","november","december"]

def slugify(s):
    s = s.strip().lower().translate(str.maketrans("áéíóöőúüű","aeiooouuu"))
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"-+","-",re.sub(r"[^a-z0-9]+","-",s)).strip("-")

def esc(s): return html.escape(str(s or ""), quote=True)

def format_date(iso):
    if not iso: return ""
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso)
    if not m: return iso
    y,mo,d = int(m.group(1)),int(m.group(2)),int(m.group(3))
    if not (1<=mo<=12): return iso
    return f"{y}. {HONAPOK[mo-1]} {d}."

def format_time(secs):
    if not secs: return "0:00"
    secs=int(secs); h,m,s=secs//3600,(secs%3600)//60,secs%60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

def kategoria_cls(kat):
    k=unicodedata.normalize("NFD",(kat or "").lower())
    k="".join(c for c in k if unicodedata.category(c)!="Mn")
    if "istentisztelet" in k: return "kat-istentisztelet"
    if "evangelizac" in k: return "kat-evangelizacio"
    if "kulonleges" in k: return "kat-kulonleges"
    if "konfirmac" in k: return "kat-konfirmacio"
    if "bibliakor" in k: return "kat-bibliakor"
    if "imahet" in k or "ima het" in k: return "kat-imaheti"
    return "kat-alap"

def audio_url(path):
    return R2_BASE_URL+"/"+"/".join(quote(seg,safe="") for seg in path.split("/"))

BIBLIAI_KONYVEK = {
 '1mozes':'1Móz','2mozes':'2Móz','3mozes':'3Móz','4mozes':'4Móz','5mozes':'5Móz',
 '1moz':'1Móz','2moz':'2Móz','3moz':'3Móz','4moz':'4Móz','5moz':'5Móz',
 'jozsue':'Józs','jozs':'Józs','birak':'Bír','bir':'Bír','ruth':'Ruth','rut':'Ruth',
 '1samuel':'1Sám','2samuel':'2Sám','1sam':'1Sám','2sam':'2Sám','sam':'1Sám','samson':'Bír',
 '1kiralyok':'1Kir','2kiralyok':'2Kir','1kir':'1Kir','2kir':'2Kir','kir':'1Kir',
 '1kronikak':'1Krón','2kronikak':'2Krón','1kron':'1Krón','2kron':'2Krón','kro':'1Krón',
 'ezsdras':'Ezsd','nehemias':'Neh','neh':'Neh','eszter':'Eszt','job':'Jób',
 'zsoltarok':'Zsolt','zsoltar':'Zsolt','zsolt':'Zsolt','zsol':'Zsolt','zsoltrarok':'Zsolt',
 'peldabeszedek':'Péld','peld':'Péld','predikator':'Préd','enekek':'Énekek',
 'ezsaias':'Ézs','ezs':'Ézs','ezsias':'Ézs','ezsiias':'Ézs','izaias':'Ézs',
 'jeremias':'Jer','jer':'Jer',
 'ezekiel':'Ez','ez':'Ez','daniel':'Dán','dan':'Dán',
 'hoseas':'Hós','hoseias':'Hós','hosias':'Hós','hos':'Hós',
 'joel':'Jóel','amos':'Ám','abdias':'Abd','jonas':'Jón','jon':'Jón',
 'mikeas':'Mik','mik':'Mik','nahum':'Náh','habakuk':'Hab','sofonias':'Zof',
 'aggeus':'Hag','agg':'Hag','hag':'Hag','zakarias':'Zak','zak':'Zak','malakias':'Mal',
 'mate':'Mt','mt':'Mt','mark':'Mk','mk':'Mk','lukacs':'Lk','luk':'Lk','lk':'Lk',
 'janos':'Jn','jano':'Jn','jn':'Jn',
 'apostolokcselekedetei':'ApCsel','apostolok':'ApCsel','apcsel':'ApCsel','ap':'ApCsel','apcse':'ApCsel',
 'roma':'Róm','romaiak':'Róm','rom':'Róm','rm':'Róm',
 '1korintus':'1Kor','2korintus':'2Kor','1korinthus':'1Kor','2korinthus':'2Kor',
 '1kor':'1Kor','2kor':'2Kor','kor':'1Kor',
 'galata':'Gal','galatak':'Gal','gal':'Gal',
 'efezus':'Ef','efezusiak':'Ef','ef':'Ef',
 'filippi':'Fil','fil':'Fil','fk':'Fil','kolosse':'Kol','kol':'Kol',
 '1thesszalonika':'1Thessz','2thesszalonika':'2Thessz','1thess':'1Thessz','2thess':'2Thessz','thess':'1Thessz','thessalonika':'1Thessz',
 '1timoteus':'1Tim','2timoteus':'2Tim','1tim':'1Tim','2tim':'2Tim','tim':'1Tim',
 'titus':'Tit','titusz':'Tit','tit':'Tit','filemon':'Filem',
 'zsidok':'Zsid','zsido':'Zsid','zsid':'Zsid','zsd':'Zsid',
 'jakab':'Jak','jak':'Jak','jk':'Jak',
 '1peter':'1Pt','2peter':'2Pt','peter':'1Pt','pt':'1Pt',
 '1janos':'1Jn','2janos':'2Jn','3janos':'3Jn',
 'judas':'Júd','jud':'Júd','jelenesek':'Jel','jel':'Jel',
}

def konyv_rovidites(konyv):
    norm=unicodedata.normalize("NFD",konyv.lower()); norm="".join(c for c in norm if unicodedata.category(c)!="Mn")
    rom={'v':'5','iv':'4','iii':'3','ii':'2','i':'1'}
    rm=re.match(r'^(iv|iii|ii|i|v)[.,:]?\s*([a-z])',norm)
    if rm: norm=rom[rm.group(1)]+re.sub(r'^[.,:\s]+','',norm[rm.end(1):])
    return BIBLIAI_KONYVEK.get(re.sub(r'[.\s:,]','',norm))

def igehely_szakaszok(raw):
    """Szakaszokra bontja az igehelyet (; és , mentén) és mindegyikhez linket ad.
    Visszaad: [(megjelenitett_szoveg, url_vagy_None), ...]"""
    if not raw: return []
    s=str(raw).strip()
    s=re.sub(r'^(lecti[oó]|textus|lextus)\s*:?\s*','',s,flags=re.I).strip()
    s=re.split(r'\s+(?:lecti[oó]|te[xz3]+tus)\s*[:.]?\s*',s,flags=re.I)[0].strip()
    s=re.sub(r'\bev\.?\s*','',s,flags=re.I)
    s=re.sub(r'[:\s]*\bv\.?\s*v\.?\b\.?','',s,flags=re.I).strip()  # "v.v." (valogatott versek) torlese a link URL-hez
    z=re.match(r'^(\d+)\.\s*(zsolt[a-záéó]*)\s*(.*)$',s,flags=re.I)
    if z:
        fej=z.group(1); mar=re.sub(r'[-–,;.\s]+$','',re.sub(r'\s+','',z.group(3).strip())).replace(':',',')
        url='https://szentiras.eu/RUF/'+quote(f"Zsolt{fej},{mar}" if mar else f"Zsolt{fej}",safe='')
        return [(raw, url)]
    tokens=re.split(r'(\s*[;,]\s*)', s)
    parsed=[]; ukonyv=ufej=None; volt_vers=False
    for tok in tokens:
        r=tok.strip()
        if not r or re.match(r'^[;,\s]*$', r): continue
        km=re.match(r'^((?:[IVXivx]+\.?\s*)?(?:\d\.?\s*)?[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű.\s]*?)\s*([:\d].*)?$', r)
        if km and km.group(1).strip() and re.search(r'[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]', km.group(1)):
            ukonyv=km.group(1).strip(); mar=(km.group(2) or '').strip().lstrip(':').strip()
        else:
            mar=r
        if not mar:
            parsed.append((r, ukonyv, None, None)); volt_vers=False
        elif ':' in mar:
            fej,vers=mar.split(':',1); ufej=fej.strip()
            parsed.append((r, ukonyv, ufej, vers.strip())); volt_vers=True
        else:
            if volt_vers and ufej: parsed.append((r, ukonyv, ufej, mar))
            else: ufej=mar; parsed.append((r, ukonyv, mar, None)); volt_vers=False
    ki=[]
    for szoveg, konyv, fej, vers in parsed:
        rov=konyv_rovidites(konyv) if konyv else None
        if not rov: ki.append((szoveg, None)); continue
        if fej is None:
            url='https://szentiras.eu/RUF/'+quote(rov,safe='')
        else:
            hiv=fej+(':'+vers if vers else '')
            hiv=re.sub(r'[-–;,.\s]+$','',re.sub(r'\s+','',hiv)).replace(':',',')
            url='https://szentiras.eu/RUF/'+quote(rov+hiv if hiv else rov,safe='')
        ki.append((szoveg, url))
    return ki

def valogatott_versek(text):
    # "v.v." es valtozatai -> " (válogatott versek)" a megjelenitett szovegben
    return re.sub(r'\s+',' ',re.sub(r'[:\s.]*\bv\.?\s*v\.?\b\.?',' (válogatott versek)',text,flags=re.I)).strip()

def render_igehely(raw):
    """A megjelenitendo HTML: egy szakasznal egesz szoveg egy link, tobbnel kulon linkek."""
    if not raw: return ''
    segs=igehely_szakaszok(raw)
    if not any(u for _,u in segs): return esc(raw)
    if len(segs)==1:
        return f'<a class="igehely-link" href="{esc(segs[0][1])}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(valogatott_versek(raw))}</a>'
    parts=[]
    for szoveg,url in segs:
        if url: parts.append(f'<a class="igehely-link" href="{esc(url)}" target="_blank" rel="noopener" title="Megnyitás a szentiras.eu-n">{esc(valogatott_versek(szoveg))}</a>')
        else: parts.append(esc(valogatott_versek(szoveg)))
    return ', '.join(parts)

# -*- coding: utf-8 -*-

PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true"><polygon points="5,2 21,12 5,22"/></svg>'
SHARE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'

def render_card(l):
    """A főoldali createCard-dal egyező statikus kártya (SEO-barát, adat-attribútumokkal)."""
    duration = format_time(l.get("hossz_sec"))
    dparts=[]
    if l.get("datum"): dparts.append(format_date(l["datum"]))
    if l.get("ido"): dparts.append(l["ido"])
    date_str=" ".join(dparts)
    lectio_html=""
    if l.get("lectio"):
        lectio_html=f'<p class="card-igehely"><span class="igehely-label">Lectió:</span> {render_igehely(l["lectio"])}</p>'
    textus_html=""
    if l.get("textus"):
        textus_html=f'<p class="card-igehely"><span class="igehely-label">Textus:</span> {render_igehely(l["textus"])}</p>'
    megj_html=f'<p class="card-megjegyzes">📌 {esc(l["megjegyzes"])}</p>' if l.get("megjegyzes") else ""
    date_html=f'<span class="card-date">{esc(date_str)}</span>' if date_str else ""
    return f'''      <article class="lecture-card" data-path="{esc(l["path"])}" data-title="{esc(l.get("cim") or l.get("eloado") or "")}" data-speaker="{esc(l.get("eloado") or "")}" data-lectio="{esc(l.get("lectio") or "")}" data-textus="{esc(l.get("textus") or "")}" data-datum="{esc(l.get("datum") or "")}" role="listitem">
        <div class="card-header">
          <span class="card-category {kategoria_cls(l.get("kategoria"))}">{esc(l.get("kategoria") or "—")}</span>
          <span class="card-duration">{esc(duration)}</span>
        </div>
        <h2 class="card-title">{esc(l.get("cim") or l.get("eloado") or "—")}</h2>
        <p class="card-speaker">{esc(l.get("eloado") or "Ismeretlen előadó")}</p>
        {lectio_html}{textus_html}{megj_html}
        <div class="card-footer">
          <div class="card-meta">{date_html}</div>
          <div class="card-actions">
            <button class="card-star-btn" aria-label="Kedvencekhez adás" title="Kedvencekhez adás">☆</button>
            <button class="card-play-btn" aria-label="Lejátszás: {esc(l.get("cim") or "")}">
              <span class="play-icon">{PLAY_ICON}</span><span>Lejátszás</span>
            </button>
            <a class="card-download-btn" href="{esc(audio_url(l["path"]))}" download title="Letöltés" aria-label="Letöltés">⬇ Letöltés</a>
            <button class="card-share-btn" title="Megosztás" aria-label="Megosztás">{SHARE_SVG} Megosztás</button>
          </div>
        </div>
      </article>'''


# -*- coding: utf-8 -*-

MOON='<svg class="theme-icon icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
SUN='<svg class="theme-icon icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'

def theme_script():
    return '''  <script>
    (function () {
      const saved = localStorage.getItem('hangarchivum_theme');
      const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (dark) document.documentElement.dataset.theme = 'dark';
    })();
  </script>'''

def head(title, desc, canonical, prefix="/", extra_ld=""):
    return f'''<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self' https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev; connect-src 'self' https://pub-07c808b19cf0458187fdb14c1d5d0129.r2.dev; object-src 'none'; base-uri 'self'; form-action 'none';">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="description" content="{esc(desc)}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#1B2E5C">
  <link rel="canonical" href="{esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{esc(canonical)}">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:image" content="https://kelenref100.hu/og-kep.jpg">
  <meta property="og:locale" content="hu_HU">
  <meta property="og:site_name" content="Kelenföldi Református Hangarchívum">
  <title>{esc(title)}</title>
  <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">{extra_ld}
{theme_script()}
</head>'''

def header(prefix="/"):
    return f'''  <header class="site-header" role="banner">
    <div class="header-inner">
      <div class="header-brand">
        <a href="/" style="display:flex;align-items:center;gap:0.6rem;text-decoration:none;">
          <img class="header-logo" src="/images/logo.png" alt="Kelenföldi Református Egyházközség – Főoldal" title="Vissza a főoldalra">
          <div class="header-titles">
            <h1>Digitális Hangarchívum</h1>
            <p class="header-subtitle">Kelenföldi Református Egyházközség</p>
          </div>
        </a>
      </div>
      <nav class="subpage-nav" aria-label="Fő navigáció">
        <a href="/" class="subpage-nav-link">Archívum</a>
        <a href="/igehirdetok/" class="subpage-nav-link">Igehirdetők</a>
      </nav>
      <button class="theme-toggle" id="themeToggle" aria-label="Sötét mód" title="Témaváltás">
        {MOON}{SUN}
      </button>
    </div>
  </header>'''

def footer(prefix="/"):
    return f'''  <footer class="site-footer" role="contentinfo">
    <div class="footer-inner">
      <div class="footer-main">
        <p class="footer-brand">Digitális Hangarchívum</p>
        <p class="footer-copyright">A hanganyagok a Budapest-Kelenföldi Református Egyházközség tulajdonát képezik.</p>
        <p class="footer-copyright">© 2026 Kelemen Botond – Minden jog fenntartva.</p>
      </div>
      <div class="footer-meta">
        <p class="footer-impressum">
          <span class="footer-impressum-label">Fejlesztés és üzemeltetés:</span> Kelemen Botond
          &nbsp;·&nbsp; <a href="/impresszum/" class="footer-email">Impresszum</a>
        </p>
        <p class="footer-contact">
          <a href="mailto:kelemen.botond04@gmail.com?subject=Hangarch%C3%ADvum%20visszajelz%C3%A9s" class="footer-email">Írj nekem!</a>
        </p>
      </div>
    </div>
  </footer>'''

def player(prefix="/"):
    return f'''  <div class="audio-player hidden" id="audioPlayer" role="region" aria-label="Lejátszó">
    <div class="player-inner">
      <div class="player-info">
        <div class="player-title" id="playerTitle">—</div>
        <div class="player-speaker" id="playerSpeaker">—</div>
      </div>
      <div class="player-controls" role="group" aria-label="Lejátszóvezérlők">
        <button class="ctrl-btn" id="skipBack" aria-label="10 másodpercet visszaugorni">−10s</button>
        <button class="ctrl-btn play-btn" id="playBtn" aria-label="Lejátszás">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><polygon points="5,2 21,12 5,22"/></svg>
        </button>
        <button class="ctrl-btn" id="skipFwd" aria-label="10 másodpercet előreugorni">+10s</button>
      </div>
      <div class="player-timeline" role="group" aria-label="Lejátszási idő">
        <span class="time-current" id="timeCurrent">0:00</span>
        <input type="range" id="progressBar" class="progress-bar" min="0" max="100" step="0.1" value="0" aria-label="Lejátszási pozíció">
        <span class="time-total" id="timeTotal">0:00</span>
      </div>
      <label for="speedSelect" class="sr-only">Sebesség</label>
      <select id="speedSelect" class="speed-select" aria-label="Lejátszási sebesség">
        <option value="0.75">0.75×</option><option value="1" selected>1×</option>
        <option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option>
      </select>
      <button class="ctrl-btn close-btn" id="playerClose" aria-label="Lejátszó bezárása">✕</button>
    </div>
    <p class="player-error hidden" id="playerError" role="alert"></p>
    <audio id="audioElement" preload="none"></audio>
  </div>
  <style>.sr-only{{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}}</style>
  <script src="/config.js"></script>
  <script src="/igehirdeto.js"></script>'''


# Sablon-építő függvények (a fő generátor használja)

def LD_SPEAKER(title, desc, canonical, name):
    return '''
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"CollectionPage","name":%s,"description":%s,"url":%s,"about":{"@type":"Person","name":%s},"isPartOf":{"@type":"WebSite","name":"Kelenföldi Református Digitális Hangarchívum","url":"https://kelenref100.hu/"}}
  </script>''' % (json.dumps(title,ensure_ascii=False), json.dumps(desc,ensure_ascii=False),
                 json.dumps(canonical,ensure_ascii=False), json.dumps(name,ensure_ascii=False))

def build_speaker_page(title, desc, canonical, ld, sp, cards, chips):
    return '''%s
<body>
%s

  <section class="ig-hero" aria-label="Igehirdető bemutatása">
    <div class="ig-hero-inner">
      <a href="/igehirdetok/" class="ig-back">← Összes igehirdető</a>
      <h1 class="ig-name">%s</h1>
      <p class="ig-summary">%s</p>
      <div class="ig-stats">
        %s
      </div>
    </div>
  </section>

  <main class="main-content" role="main">
    <div class="lecture-grid" role="list" aria-label="%s felvételei">
%s
    </div>
  </main>

%s
%s
</body>
</html>''' % (head(title,desc,canonical,"/",ld), header("/"),
              esc(sp["name"]), esc(desc), chips, esc(sp["name"]), cards,
              footer("/"), player("/"))

def index_row(sp):
    ev = ""
    if sp["ev_min"] and sp["ev_max"]:
        ev = sp["ev_min"] if sp["ev_min"]==sp["ev_max"] else "%s–%s" % (sp["ev_min"], sp["ev_max"])
    ev_html = '<span class="ig-list-years">%s</span>' % ev if ev else ''
    return '''      <a class="ig-list-item" href="/igehirdeto/%s/">
        <span class="ig-list-name">%s</span>
        <span class="ig-list-meta"><span class="ig-list-count">%d felvétel</span>%s</span>
      </a>''' % (sp["slug"], esc(sp["name"]), sp["db"], ev_html)

def build_index_page(nspeak, nrec, nora, rows):
    title = "Igehirdetők – Kelenföldi Református Digitális Hangarchívum"
    desc = "A Kelenföldi Református Hangarchívum %d igehirdetője. Böngéssz igehirdető szerint – több mint %d felvétel, közel %d óra hanganyag." % (nspeak, nrec, nora)
    canonical = "%s/igehirdetok/" % SITE
    ld = '''
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"CollectionPage","name":%s,"description":%s,"url":%s}
  </script>''' % (json.dumps(title,ensure_ascii=False), json.dumps(desc,ensure_ascii=False), json.dumps(canonical,ensure_ascii=False))
    return '''%s
<body>
%s

  <section class="ig-hero" aria-label="Igehirdetők">
    <div class="ig-hero-inner">
      <a href="/" class="ig-back">← Vissza az archívumhoz</a>
      <h1 class="ig-name">Igehirdetők</h1>
      <p class="ig-summary">A Kelenföldi Református Digitális Hangarchívum %d igehirdetője. Válassz egy nevet, és böngészd az adott igehirdető összes elérhető felvételét.</p>
    </div>
  </section>

  <main class="main-content" role="main">
    <div class="ig-list" role="list" aria-label="Igehirdetők listája">
%s
    </div>
  </main>

%s
  <script>
    (function () {
      var t = document.getElementById('themeToggle');
      if (!t) return;
      t.addEventListener('click', function () {
        var dark = document.documentElement.dataset.theme === 'dark';
        if (dark) { delete document.documentElement.dataset.theme; localStorage.setItem('hangarchivum_theme','light'); }
        else { document.documentElement.dataset.theme = 'dark'; localStorage.setItem('hangarchivum_theme','dark'); }
      });
    })();
  </script>
</body>
</html>''' % (head(title,desc,canonical,"/",ld), header("/"), nspeak, rows, footer("/"))

IGEHIRDETO_JS = r"""
/* Igehirdető-oldalak lejátszója – a főoldal app.js kompatibilis kivonata */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const FAV_KEY = 'hangarchivum_favorites';
  const THEME_KEY = 'hangarchivum_theme';
  const VOL_KEY = 'hangarchivum_volume';
  const SKIP = (window.CONFIG && CONFIG.SKIP_SECONDS) || 10;

  const dom = {
    audio: $('audioElement'), player: $('audioPlayer'),
    title: $('playerTitle'), speaker: $('playerSpeaker'),
    playBtn: $('playBtn'), skipBack: $('skipBack'), skipFwd: $('skipFwd'),
    progress: $('progressBar'), tCur: $('timeCurrent'), tTot: $('timeTotal'),
    speed: $('speedSelect'), close: $('playerClose'), err: $('playerError'),
  };

  let current = null, isPlaying = false;
  let volume = parseFloat(localStorage.getItem(VOL_KEY));
  if (isNaN(volume)) volume = (window.CONFIG && CONFIG.DEFAULT_VOLUME) || 0.85;

  function loadFavs() {
    try { const a = JSON.parse(localStorage.getItem(FAV_KEY)); return new Set(Array.isArray(a) ? a : []); }
    catch { return new Set(); }
  }
  let favorites = loadFavs();
  function saveFavs() { try { localStorage.setItem(FAV_KEY, JSON.stringify([...favorites])); } catch {} }

  function audioUrl(path) {
    return CONFIG.R2_BASE_URL + '/' + path.split('/').map(encodeURIComponent).join('/');
  }
  function fmt(secs) {
    if (!secs || isNaN(secs)) return '0:00';
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60), s = Math.floor(secs%60);
    const mm = String(m).padStart(h?2:1,'0'), ss = String(s).padStart(2,'0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  }
  function showErr(m){ if(dom.err){dom.err.textContent=m;dom.err.classList.remove('hidden');} }
  function clearErr(){ if(dom.err) dom.err.classList.add('hidden'); }
  function progStyle(pct){
    if(dom.progress) dom.progress.style.background =
      `linear-gradient(to right, var(--gold) 0%, var(--gold) ${pct}%, var(--border-light) ${pct}%, var(--border-light) 100%)`;
  }

  function playCard(card) {
    const path = card.dataset.path;
    if (current === path) { togglePlay(); return; }
    current = path;
    clearErr();
    dom.audio.src = audioUrl(path);
    dom.audio.volume = volume;
    if (dom.speed) dom.audio.playbackRate = parseFloat(dom.speed.value);
    const title = card.dataset.title || '—';
    const ige = [card.dataset.lectio, card.dataset.textus].filter(Boolean).join(' · ');
    const spk = [card.dataset.speaker, ige].filter(Boolean).join(' – ');
    dom.title.textContent = title;
    dom.speaker.textContent = spk || '—';
    dom.player.classList.remove('hidden');
    dom.audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      showErr('A felvétel most nem indítható el. Próbáld meg újra.');
    });
    updateCards();
  }
  function togglePlay() {
    if (!current) return;
    if (isPlaying) dom.audio.pause();
    else dom.audio.play().catch(()=>{});
  }
  function updateCards() {
    document.querySelectorAll('.lecture-card').forEach(card => {
      const active = card.dataset.path === current;
      card.classList.toggle('is-active', active);
      const btn = card.querySelector('.card-play-btn');
      if (btn) {
        const playing = active && isPlaying;
        btn.classList.toggle('playing', playing);
        btn.querySelector('span:last-child').textContent = playing ? 'Szünet' : 'Lejátszás';
      }
    });
  }

  // Kártya-események
  document.querySelectorAll('.lecture-card').forEach(card => {
    card.querySelector('.card-play-btn')?.addEventListener('click', () => playCard(card));
    const star = card.querySelector('.card-star-btn');
    if (star) {
      const path = card.dataset.path;
      const sync = () => {
        const fav = favorites.has(path);
        star.textContent = fav ? '★' : '☆';
        star.classList.toggle('is-favorite', fav);
        star.setAttribute('aria-label', fav ? 'Kedvencből eltávolítás' : 'Kedvencekhez adás');
      };
      sync();
      star.addEventListener('click', () => {
        if (favorites.has(path)) favorites.delete(path); else favorites.add(path);
        saveFavs(); sync();
      });
    }
    const share = card.querySelector('.card-share-btn');
    if (share) share.addEventListener('click', async () => {
      const url = 'https://kelenref100.hu/#felvetel=' + encodeURIComponent(card.dataset.path);
      const title = card.dataset.title || 'Igehirdetés';
      const text = [card.dataset.speaker, card.dataset.datum].filter(Boolean).join(' – ');
      if (navigator.share) { try { await navigator.share({title, text: text+'\n'+title, url}); } catch {} }
      else { try { await navigator.clipboard.writeText(url); share.classList.add('copied'); setTimeout(()=>share.classList.remove('copied'),1500); } catch {} }
    });
  });

  // Lejátszó-vezérlők
  dom.playBtn?.addEventListener('click', togglePlay);
  dom.skipBack?.addEventListener('click', () => { if(current) dom.audio.currentTime = Math.max(0, dom.audio.currentTime - SKIP); });
  dom.skipFwd?.addEventListener('click', () => { if(current) dom.audio.currentTime = Math.min(dom.audio.duration||0, dom.audio.currentTime + SKIP); });
  dom.close?.addEventListener('click', () => {
    dom.audio.pause(); dom.audio.src=''; current=null; isPlaying=false;
    dom.player.classList.add('hidden'); updateCards();
  });
  dom.speed?.addEventListener('change', () => { dom.audio.playbackRate = parseFloat(dom.speed.value); });
  dom.progress?.addEventListener('input', () => {
    if (dom.audio.duration) dom.audio.currentTime = (dom.progress.value/100)*dom.audio.duration;
  });

  // Audio események
  dom.audio.addEventListener('play', () => { isPlaying=true; clearErr(); updatePlayIcon(); updateCards(); });
  dom.audio.addEventListener('playing', () => { clearErr(); });
  dom.audio.addEventListener('pause', () => { isPlaying=false; updatePlayIcon(); updateCards(); });
  dom.audio.addEventListener('timeupdate', () => {
    if (!dom.audio.duration) return;
    const pct = (dom.audio.currentTime/dom.audio.duration)*100;
    dom.progress.value = pct; progStyle(pct);
    dom.tCur.textContent = fmt(dom.audio.currentTime);
    dom.tTot.textContent = fmt(dom.audio.duration);
  });
  dom.audio.addEventListener('ended', () => { isPlaying=false; updatePlayIcon(); updateCards(); });
  function updatePlayIcon() {
    if (!dom.playBtn) return;
    dom.playBtn.innerHTML = isPlaying
      ? '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true"><polygon points="5,2 21,12 5,22"/></svg>';
  }

  // Témaváltás
  const themeToggle = $('themeToggle');
  themeToggle?.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme === 'dark';
    if (dark) { delete document.documentElement.dataset.theme; localStorage.setItem(THEME_KEY,'light'); }
    else { document.documentElement.dataset.theme='dark'; localStorage.setItem(THEME_KEY,'dark'); }
  });
})();

"""

IGEHIRDETO_CSS = r"""
/* IGEHIRDETO_GENERATOR_CSS_v1 - ne torold ezt a sort (duplikacio-vedelem) */

/* ===== Igehirdető-oldalak (aloldal navigáció, hero, statisztika, lista) ===== */
.subpage-nav { display: flex; gap: 0.5rem; margin-left: auto; margin-right: 0.75rem; }
.subpage-nav-link {
  font-family: var(--font-ui); font-size: 0.9rem; font-weight: 600;
  color: rgba(255,255,255,0.85); text-decoration: none;
  padding: 0.4rem 0.75rem; border-radius: var(--radius);
  transition: background var(--transition), color var(--transition);
}
.subpage-nav-link:hover { background: rgba(255,255,255,0.12); color: var(--gold-light); }

.ig-hero {
  max-width: 1000px; margin: 0 auto; padding: 2.5rem 1.5rem 1rem;
}
.ig-hero-inner { text-align: left; }
.ig-back {
  display: inline-block; margin-bottom: 1.25rem; color: var(--gold);
  text-decoration: none; font-family: var(--font-ui); font-size: 0.9rem;
  transition: color var(--transition);
}
.ig-back:hover { color: var(--navy); }
[data-theme="dark"] .ig-back:hover { color: var(--gold-light); }
.ig-name {
  font-family: var(--font-serif); font-size: clamp(1.9rem, 4.5vw, 2.8rem);
  color: var(--navy); margin: 0 0 0.75rem; line-height: 1.15;
}
[data-theme="dark"] .ig-name { color: var(--gold-light); }
.ig-summary {
  font-family: var(--font-ui); font-size: 1rem; line-height: 1.65;
  color: var(--text-muted); max-width: 720px; margin: 0 0 1.5rem;
}
.ig-stats { display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1.25rem 0 0.5rem; border-top: 1px solid var(--border-light); }
.ig-stat { display: flex; flex-direction: column; gap: 0.15rem; }
.ig-stat-value { font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: var(--navy); line-height: 1; }
[data-theme="dark"] .ig-stat-value { color: var(--gold); }
.ig-stat-label { font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

/* Igehirdetők gyűjtőoldal – lista */
.ig-list {
  max-width: 800px; margin: 0 auto; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.6rem;
}
.ig-list-item {
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 0.9rem 1.1rem; background: var(--white); border: 1px solid var(--border-light);
  border-radius: var(--radius); text-decoration: none;
  transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
}
.ig-list-item:hover {
  border-color: var(--gold); transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(15,29,58,0.08);
}
.ig-list-name { font-family: var(--font-serif); font-size: 1.05rem; font-weight: 600; color: var(--navy); }
[data-theme="dark"] .ig-list-name { color: var(--cream); }
.ig-list-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; flex-shrink: 0; }
.ig-list-count { font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600; color: var(--gold); }
.ig-list-years { font-family: var(--font-ui); font-size: 0.75rem; color: var(--text-muted); }

@media (max-width: 768px) {
  .subpage-nav { margin-right: 0.5rem; gap: 0.25rem; }
  .subpage-nav-link { padding: 0.35rem 0.5rem; font-size: 0.8rem; }
  .ig-hero { padding: 1.5rem 1rem 0.5rem; }
  .ig-stats { gap: 1rem; }
  .ig-stat-value { font-size: 1.3rem; }
  .ig-list { grid-template-columns: 1fr; }
}

"""

# ==================== FŐ GENERÁTOR ====================
def main():
    with open(LECTURES_PATH, encoding="utf-8") as f:
        L = json.load(f)
    fixed = 0
    for l in L:
        if l.get("datum","").startswith("0998"):
            l["datum"] = "1" + l["datum"][1:]; fixed += 1
    print(f"Datum-javitas: {fixed} rekord (0998 -> 1998)")
    ige_fix = 0
    for l in L:
        if l.get("lectio","").strip() == "i:Mózes 22:1-19":
            l["lectio"] = "I.Mózes 22:1-19"; ige_fix += 1
    if ige_fix:
        print(f"Igehely-javitas: {ige_fix} rekord (i:Mozes -> I.Mozes)")

    by_speaker = defaultdict(list)
    for l in L:
        e = (l.get("eloado") or "").strip()
        if e: by_speaker[e].append(l)

    def sort_key(l): return (l.get("datum") or "9999", l.get("path") or "")
    speakers = []
    for name, recs in by_speaker.items():
        rs = sorted(recs, key=sort_key, reverse=True)
        datumok = sorted([r["datum"] for r in recs if r.get("datum")])
        speakers.append({
            "name": name, "slug": slugify(name), "recs": rs, "db": len(recs),
            "ev_min": datumok[0][:4] if datumok else None,
            "ev_max": datumok[-1][:4] if datumok else None,
            "óra": round(sum(r.get("hossz_sec",0) for r in recs)/3600),
            "kats": Counter(r.get("kategoria") for r in recs if r.get("kategoria")),
        })
    speakers.sort(key=lambda s: -s["db"])

    def stat_chips(sp):
        c = ['<div class="ig-stat"><span class="ig-stat-value">%d</span><span class="ig-stat-label">felvétel</span></div>' % sp["db"]]
        if sp["ev_min"] and sp["ev_max"]:
            ev = sp["ev_min"] if sp["ev_min"]==sp["ev_max"] else "%s-%s" % (sp["ev_min"], sp["ev_max"])
            c.append('<div class="ig-stat"><span class="ig-stat-value">%s</span><span class="ig-stat-label">időszak</span></div>' % ev)
        if sp["óra"]>=1:
            c.append('<div class="ig-stat"><span class="ig-stat-value">%d</span><span class="ig-stat-label">óra</span></div>' % sp["óra"])
        if sp["kats"]:
            c.append('<div class="ig-stat"><span class="ig-stat-value">%d</span><span class="ig-stat-label">műfaj</span></div>' % len(sp["kats"]))
        return "\n        ".join(c)

    def summary(sp):
        ev = ""
        if sp["ev_min"] and sp["ev_max"]:
            ev = " %s és %s között" % (sp["ev_min"], sp["ev_max"]) if sp["ev_min"]!=sp["ev_max"] else " %s-ben" % sp["ev_min"]
        kl = [k for k,_ in sp["kats"].most_common(3)]
        ks = ""
        if kl:
            ks = " – jellemzően %s műfajban" % kl[0].lower() if len(kl)==1 else " – %s és %s felvételekkel" % (", ".join(k.lower() for k in kl[:-1]), kl[-1].lower())
        ora = ", összesen %d óra hanganyag" % sp["óra"] if sp["óra"]>=1 else ""
        return "%s %d igehirdetése a Kelenföldi Református Digitális Hangarchívumban%s%s%s." % (sp["name"], sp["db"], ev, ora, ks)

    # A magyar ékezetes szövegeket a végleges összeállításkor cseréljük vissza (lásd FIX lent)
    os.makedirs("igehirdeto", exist_ok=True)

    for sp in speakers:
        title = "%s igehirdetései – Digitális Hangarchívum" % sp["name"]
        desc = summary(sp)
        canonical = "%s/igehirdeto/%s/" % (SITE, sp["slug"])
        ld = LD_SPEAKER(title, desc, canonical, sp["name"])
        cards = "\n".join(render_card(l) for l in sp["recs"])
        page = build_speaker_page(title, desc, canonical, ld, sp, cards, stat_chips(sp))
        outdir = "igehirdeto/%s" % sp["slug"]
        os.makedirs(outdir, exist_ok=True)
        with open("%s/index.html" % outdir, "w", encoding="utf-8") as fp:
            fp.write(page)
    print("Eloado-oldalak: %d db legeneralva." % len(speakers))

    rows = "\n".join(index_row(sp) for sp in speakers)
    total_ora = round(sum(x.get("hossz_sec",0) for x in L)/3600)
    idx = build_index_page(len(speakers), len(L), total_ora, rows)
    os.makedirs("igehirdetok", exist_ok=True)
    with open("igehirdetok/index.html","w",encoding="utf-8") as fp: fp.write(idx)
    print("Gyujtooldal: igehirdetok/index.html kesz.")

    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url><loc>%s/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>' % SITE,
          '  <url><loc>%s/igehirdetok/</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>' % SITE,
          '  <url><loc>%s/impresszum/</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>' % SITE]
    for sp in speakers:
        sm.append('  <url><loc>%s/igehirdeto/%s/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>' % (SITE, sp["slug"]))
    sm.append('</urlset>')
    with open("sitemap.xml","w",encoding="utf-8") as fp: fp.write("\n".join(sm))
    print("Sitemap: %d URL." % (len(speakers)+3))

    if fixed or ige_fix:
        with open(LECTURES_PATH,"w",encoding="utf-8") as fp:
            json.dump(L,fp,ensure_ascii=False,separators=(',',':'))
        print("Javitott lectures.json visszairva (%d datum)." % fixed)

    with open("igehirdeto.js","w",encoding="utf-8") as fp: fp.write(IGEHIRDETO_JS)
    print("igehirdeto.js kiirva.")

    marker = "IGEHIRDETO_GENERATOR_CSS_v1"
    try:
        cur = open("style.css",encoding="utf-8").read()
    except FileNotFoundError:
        cur = ""
    if marker in cur:
        print("A style.css mar tartalmazza az igehirdeto-stilusokat (kihagyva).")
    else:
        with open("style.css","a",encoding="utf-8") as fp: fp.write("\n"+IGEHIRDETO_CSS)
        print("Igehirdeto-CSS hozzafuzve a style.css-hez.")
    print("\n=== KESZ ===")

if __name__ == "__main__":
    main()
