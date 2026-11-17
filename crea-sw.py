# Rigenera sw.js con l'elenco di tutti i file dell'app (da lanciare dopo ogni modifica).
import os, hashlib, json
base = os.path.dirname(os.path.abspath(__file__))
# elenco delle battute già doppiate (audio/voci/<codice>.mp3), letto dal gioco
vd = os.path.join(base, 'audio', 'voci'); os.makedirs(vd, exist_ok=True)
json.dump(sorted(n[:-4] for n in os.listdir(vd) if n.endswith('.mp3')), open(os.path.join(vd, 'elenco.json'), 'w'))
files, h = [], hashlib.sha1()
for root, _, names in os.walk(base):
    for n in sorted(names):
        p = os.path.relpath(os.path.join(root, n), base)
        if n.startswith('.') or p.startswith('.') or p in ('sw.js', 'crea-sw.py') or p.endswith('.command') or p in ('editor.html', 'js/editor.js', 'README.md') or p.startswith('native'): continue
        files.append(p.replace(os.sep, '/'))
        h.update(open(os.path.join(root, n), 'rb').read())
files.sort(); versione = h.hexdigest()[:10]
sw = f'''/* Alberalto · service worker: l'app funziona anche senza internet. Generato da crea-sw.py */
const VERSIONE = "alberalto-{versione}";
const FILE = {json.dumps(["./"] + files)};
self.addEventListener("install", e => {{ e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSIONE).map(x => caches.delete(x)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", e => {{
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, {{ignoreSearch: true}}).then(r => r || fetch(e.request).then(res => {{
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes("fonts.g"))) {{ const copia = res.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copia)); }}
    return res;
  }}).catch(() => caches.match("./"))));
}});
'''
open(os.path.join(base, 'sw.js'), 'w').write(sw)
print(versione, len(files), 'file')
