/* Alberalto · l'Albero: la mappa del mondo. I piani ancora "da ricordare" sono disegnati a matita;
   ogni scoperta fa salire una scintilla di linfa fino al Faro della Memoria. */
"use strict";
import {$, $$, S, suono, finestra, dialogo, schermo, aspetta, lampo, coriandoli, apriModale, chiudiModale, cancelloGrandi, azzera, salva, toast, premio} from "./core.js";
import {EPISODI, SCOPERTE} from "./avventure.js";

/* posizioni in % sull'illustrazione dell'albero (688×1024) */
const PIANI = [
  {id: "radici", n: 1, nome: "Radici", sotto: "Il Borgo delle Radici", x: 46, y: 89, ic: "🏡", aperto: true},
  {id: "sottobosco", n: 2, nome: "Sottobosco", sotto: "Le Felci Alte", x: 16, y: 71, ic: "🌿", aperto: true},
  {id: "tronco", n: 3, nome: "Tronco", x: 66, y: 55, ic: "🔒"},
  {id: "chioma", n: 4, nome: "Chioma", x: 22, y: 37, ic: "🔒"},
  {id: "nuvole", n: 5, nome: "Nuvole", x: 76, y: 19, ic: "🔒"},
  {id: "cielo", n: 6, nome: "Cielo Alto", x: 22, y: 7, ic: "🔒"},
  {id: "vetta", n: 7, nome: "Vetta", sotto: "Il Faro della Memoria", x: 50, y: 11, ic: "✦"}
];
let pronto = false, azioni = {};
export function preparaAlbero(a) {
  azioni = a;
  const img = $("#albColore");
  const fai = () => { schizzo(img); pronto = true; };
  if (img.complete && img.naturalWidth) fai(); else img.onload = fai;
  // lucciole tra le radici
  $("#albLucciole").innerHTML = Array.from({length: 16}, (_, k) => `<i style="left:${8 + Math.random() * 84}%;top:${72 + Math.random() * 24}%;animation-delay:${-Math.random() * 5}s;animation-duration:${4 + Math.random() * 3}s"></i>`).join("");
  $("#albTaccuino").onclick = () => { suono.pop(); azioni.taccuino(); };
  $("#albAmici").onclick = () => { suono.pop(); apriAmici(); };
  $("#albAvventure").onclick = () => { suono.pop(); apriAvventure(); };
  $("#albGrandi").onclick = async () => { suono.pop(); if (await cancelloGrandi()) apriGrandi(); };
  // un leggero effetto di profondità muovendo il telefono
  addEventListener("deviceorientation", e => { if (document.body.dataset.schermo !== "albero" || e.gamma == null) return; $(".alb-sfondo").style.transform = `translate(${Math.max(-20, Math.min(20, e.gamma * .6))}px,${Math.max(-20, Math.min(20, (e.beta - 45) * .4))}px)`; });
}

/* ---------- l'effetto matita: schizzo a grafite ricavato dall'illustrazione ---------- */
function schizzo(img) {
  const w = img.naturalWidth, h = img.naturalHeight, c = $("#albSchizzo"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, w, h), p = d.data, n = w * h;
  const gr = new Float32Array(n), inv = new Float32Array(n);
  for (let i = 0; i < n; i++) { gr[i] = .3 * p[i * 4] + .59 * p[i * 4 + 1] + .11 * p[i * 4 + 2]; inv[i] = 255 - gr[i]; }
  const bl = sfoca(sfoca(sfoca(inv, w, h, 5), w, h, 5), w, h, 5);
  for (let i = 0; i < n; i++) {
    let v = Math.min(255, gr[i] * 255 / (256 - bl[i]));          // "color dodge": restano i contorni
    v = 255 - Math.min(255, (255 - v) * 1.7);                     // tratto più deciso
    const tono = v / 255, y = Math.floor(i / w), carta = 1 - .04 * Math.sin(y * .9) * Math.sin((i % w) * .7);
    p[i * 4] = 247 * tono * carta; p[i * 4 + 1] = 238 * tono * carta; p[i * 4 + 2] = 219 * tono * carta;
  }
  g.putImageData(d, 0, 0);
}
function sfoca(src, w, h, r) { // sfocatura a scatola, separabile
  const tmp = new Float32Array(src.length), out = new Float32Array(src.length), k = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) { let s = 0; const o = y * w; for (let x = -r; x <= r; x++) s += src[o + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { tmp[o + x] = s * k; s += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
  for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { out[y * w + x] = s * k; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; } }
  return out;
}

/* ---------- quanto è "guarito" l'albero ---------- */
const rivelaPer = n => 36 + n * 4.5;           // % dal basso a colori
const linfaPer = n => .2 + n * .066;            // quanta linfa luminosa sale lungo il tronco
const faroPer = n => .18 + Math.min(1, n / 6) * .82;
function applicaStato(n, subito) {
  const col = $("#albColore"), path = $("#linfaLuce");
  if (subito) path.style.transition = "none";
  path.style.strokeDashoffset = 1 - Math.min(1, linfaPer(n));
  if (subito) { void path.getBoundingClientRect(); path.style.transition = ""; }
  anima(col, "--rivela", parseFloat(col.style.getPropertyValue("--rivela")) || rivelaPer(n), rivelaPer(n), subito ? 0 : 2200);
  $("#albFaro").style.setProperty("--faro", n ? faroPer(n) : .15);
  for (const e of $$(".faroC b")) e.textContent = n;
}
function anima(el, prop, da, a, ms) {
  if (!ms) return el.style.setProperty(prop, a + "%");
  const t0 = performance.now(); const p = () => { const k = Math.min(1, (performance.now() - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; el.style.setProperty(prop, da + (a - da) * e + "%"); if (k < 1) requestAnimationFrame(p); }; p();
}
function punti() {
  $("#albPunti").innerHTML = PIANI.map(p => {
    const chiuso = !p.aperto && p.id !== "vetta";
    return `<button class="punto ${chiuso ? "chiuso" : ""} ${p.id === "sottobosco" ? "secondario" : ""}" data-p="${p.id}" style="left:${p.x}%;top:${p.y}%"><span class="seg">${p.ic}</span><span class="nome">${chiuso ? p.nome + "?" : p.nome}</span></button>`;
  }).join("");
  $$("#albPunti .punto").forEach(b => b.onclick = () => { suono.pop(); tocca(b.dataset.p); });
}
async function tocca(id) {
  const p = PIANI.find(x => x.id === id);
  if (id === "radici") return azioni.entra("piazza");
  if (id === "sottobosco") return azioni.entra("felci");
  if (id === "vetta") return dialogo([["bip", `Lassù c'è il Faro della Memoria. Ogni volta che capiamo il perché di qualcosa e lo raccontiamo, brilla un po' di più. Ora: ${S.scoperte.length} scoperte su 12!`, null]]);
  const f = finestra("finPiano", `${p.n} · ${p.nome}`, `<div class="pagina" style="text-align:center"><div style="font-size:46px">✏️</div>
    <h3>Da ricordare…</h3>Questo piano è ancora disegnato a matita: dopo la Lunga Tempesta, nel Borgo nessuno ricorda più com'è fatto, né come si sale fin lassù.<br><br>Ogni scoperta fa salire la linfa e brillare il Faro. Un giorno, forse, il ${p.nome} tornerà a colori!</div>
    <div class="azioni"><button class="btn verde" id="okPiano">Va bene ▸</button></div>`);
  $("#okPiano").onclick = () => f.chiudi();
}

/* ---------- mostrare l'albero ---------- */
export function mostraAlbero(scorri = "giu") {
  schermo("albero"); punti(); applicaStato(S.scoperte.length, true);
  suono.ambiente("vento", .5);
  const sc = $("#albScorri");
  requestAnimationFrame(() => { if (scorri === "giu") sc.scrollTop = sc.scrollHeight; });
  $("#albGuida").style.display = S.f.intro ? "none" : "";
  $("#albTaccuino").hidden = !S.f.taccuino;
}

/* ---------- la scintilla che sale fino al Faro ---------- */
export function celebraFaro(id) {
  return new Promise(async fine => {
    apriModale(); lampo(400); await aspetta(300);
    const n = S.scoperte.length, sc = $("#albScorri");
    schermo("albero"); punti(); applicaStato(n - 1, true);
    $("#albGuida").style.display = "none";
    sc.scrollTop = sc.scrollHeight; await aspetta(700);
    suono.ambiente("vento", .3);
    const path = $("#linfaPath"), L = path.getTotalLength(), col = $("#albColonna"), sp = $("#albScintilla");
    const dur = 4200, t0 = performance.now(); sp.style.opacity = 1;
    const maxScroll = sc.scrollHeight - sc.clientHeight;
    await new Promise(ok => {
      const passo = () => {
        const k = Math.min(1, (performance.now() - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const pt = path.getPointAtLength(L * e), x = pt.x / 100 * col.clientWidth, y = pt.y / 100 * col.clientHeight;
        sp.style.left = x + "px"; sp.style.top = y + "px"; sp.style.transform = `scale(${1 + Math.sin(k * 40) * .15})`;
        sc.scrollTop = Math.max(0, Math.min(maxScroll, y - sc.clientHeight * .55));
        if (Math.random() < .5) scia(x, y);
        if (k < 1) requestAnimationFrame(passo); else ok();
      };
      passo();
    });
    sp.style.opacity = 0; suono.campanella(); lampo(700);
    const r = col.getBoundingClientRect(); coriandoli(r.left + r.width / 2, r.top + r.height * .04, 120);
    await aspetta(800);
    // la linfa e i colori risalgono un po' l'albero: l'albero "rinasce"
    const confine = col.clientHeight * (1 - rivelaPer(n) / 100);
    sc.scrollTo({top: Math.max(0, confine - sc.clientHeight * .5), behavior: "smooth"});
    await aspetta(900);
    applicaStato(n, false); suono.tintinnio();
    await aspetta(2400);
    chiudiModale();
    if (n === 1) await dialogo([["bip", "Il Faro! Il Faro!", "f1"], ["bip", "Lassù, in cima ad Alberalto, il Faro della Memoria si è acceso per la prima volta!", "f2"], ["bip", "E guarda: la linfa è salita un po', e l'albero ha ripreso colore!", null]], {alto: true});
    else await dialogo([["bip", "Il Faro! Il Faro!", "f1"], ["bip", `Il Faro della Memoria brilla ancora di più! ${n} scoperte su 12.`, null]], {alto: true});
    await premio("✦", `Scoperta ${n} su 12`, `«${SCOPERTE[id].titolo}» è nel taccuino. Raccontala a Nonna Tessa!`, "Torna nel Borgo ▸");
    fine();
  });
}
function scia(x, y) {
  const s = document.createElement("i"); s.style.cssText = `position:absolute;left:${x + (Math.random() - .5) * 16}px;top:${y + (Math.random() - .5) * 16}px;width:7px;height:7px;border-radius:50%;background:#fff1a8;box-shadow:0 0 10px 4px rgba(255,210,90,.8);pointer-events:none;z-index:5;transition:opacity 1.2s,transform 1.2s`;
  $("#albColonna").appendChild(s); requestAnimationFrame(() => { s.style.opacity = 0; s.style.transform = `translateY(${10 + Math.random() * 20}px) scale(.3)`; }); setTimeout(() => s.remove(), 1300);
}

/* ---------- gli amici ---------- */
const AMICI = [
  ["leo", "Leo", "8 anni. Esploratore: annota tutto nel suo taccuino. A volte è un po' impaziente!", "i4"],
  ["bip", "Bip", "Una lanterna-robot con una luce calda, senza fiamma. Fa sempre un sacco di domande.", "r3"],
  ["mira", "Mira", "9 anni. Costruisce i mezzi per spostarsi tra i piani. Un po' distratta…", "m1"],
  ["tobia", "Tobia", "7 anni. Timido, conosce e ama le creature piccole. Ha sempre la sua lente.", "t1"],
  ["nonna-tessa", "Nonna Tessa", "La custode delle Radici e del libro delle storie.", "n5"],
  ["pico", "Pico", "Un corvo burlone. Ne combina di tutti i colori!", "pico"]
];
function apriAmici() {
  const f = finestra("finAmici", "👫 Gli amici di Alberalto", `<div class="amici">${AMICI.map(([id, n, t]) => `<button class="amico" data-a="${id}"><img src="img/sp-${id}.png" alt=""><b>${n}</b><small>${t}</small></button>`).join("")}</div><p style="font-size:13px;opacity:.7;margin-top:8px;text-align:center">Tocca un amico per sentirlo parlare!</p>`, {largo: true});
  $$(".amico", f).forEach(b => b.onclick = () => { const a = AMICI.find(x => x[0] === b.dataset.a); b.classList.remove("saluta"); void b.offsetWidth; b.classList.add("saluta"); suono.voce(a[3]); });
}

/* ---------- le avventure (episodi del volume 1) ---------- */
function apriAvventure() {
  const f = finestra("finAvventure", "📚 Le avventure di «La prima luce»", `<div class="avventure">${EPISODI.map(([ep, t, piano, pag, id], i) => {
    const fatta = id && S.scoperte.includes(id), aperta = id && (id === "brocca" || S.f.a2 || S.scoperte.includes("brocca"));
    return `<div class="avv ${!id ? "chiusa" : fatta ? "fatta" : ""}"><span class="n">${fatta ? "✓" : i + 1}</span><div class="tx"><b>${t}${fatta ? `<span class="faro">✦ Faro</span>` : ""}</b><small>${piano} · nel libro a pagina ${pag}${!id ? " · nel gioco presto!" : !aperta ? " · si sblocca dopo l'avventura 1" : ""}</small></div>${id ? `<button class="btn piccolo ${fatta ? "chiaro" : "verde"}" data-id="${id}" ${aperta ? "" : "disabled"}>${fatta ? "Rivedi" : "Gioca ▸"}</button>` : `<span style="font-size:22px">🔒</span>`}</div>`;
  }).join("")}</div>`, {largo: true});
  $$(".avv button", f).forEach(b => b.onclick = () => { f.chiudi(); azioni.avventura(b.dataset.id); });
}

/* ---------- per i grandi ---------- */
function apriGrandi() {
  const I = S.imp;
  const f = finestra("finGrandi", "⚙️ Per i grandi", `<div class="grandi">
    <h3>Suoni</h3>
    <div class="riga"><label>🎵 Musica</label><input type="range" min="0" max="1" step=".05" value="${I.musica}" data-k="musica"></div>
    <div class="riga"><label>🗣️ Voci</label><input type="range" min="0" max="1" step=".05" value="${I.voci}" data-k="voci"></div>
    <div class="riga"><label>🔔 Effetti</label><input type="range" min="0" max="1" step=".05" value="${I.effetti}" data-k="effetti"></div>
    <h3>Che cosa si impara</h3>
    <p>Ogni avventura nasce da un episodio del libro «La prima luce». Il bambino osserva, fa prove nel laboratorio di Bip (variabili vere: vento, umidità, distanza, materiali), risponde a una domanda e scrive la scoperta nel taccuino. Le metafore sono dichiarate con «è come se…».</p>
    ${Object.entries(SCOPERTE).map(([id, s]) => `<details><summary>${S.scoperte.includes(id) ? "✦" : "○"} ${s.titolo} (${s.ep}, pagina ${s.pagina})</summary><p style="margin-top:6px"><b>Per parlarne insieme:</b> ${s.parlarne}</p><p style="margin-top:6px"><b>Il vero perché:</b> ${s.vero}</p></details>`).join("")}
    <h3>Sicurezza e privacy</h3>
    <ul><li>Nessun dato raccolto, nessun account, nessuna pubblicità, nessuna chat, nessun acquisto.</li><li>I progressi restano solo su questo dispositivo.</li><li>Nessun personaggio compie azioni rischiose: gli esperimenti sono solo virtuali e spiegano il perché, non il come.</li></ul>
    <h3>Progressi</h3>
    <p>Scoperte: <b>${S.scoperte.length} / 12</b> · Foglie d'oro: <b>${Object.keys(S.foglie).length} / 5</b> · Curiosità: <b>${Object.keys(S.curio).length} / 7</b></p>
    <div class="azioni" style="justify-content:flex-start"><button class="btn chiaro piccolo" id="azzera">🔄 Ricomincia da capo</button></div>
    </div>`, {largo: true});
  $$("input[type=range]", f).forEach(r => r.oninput = () => { S.imp[r.dataset.k] = +r.value; suono.volumi(); salva(); });
  $("#azzera").onclick = () => { if (confirm("Cancellare tutti i progressi su questo dispositivo?")) { azzera(); f.chiudi(); mostraAlbero(); toast("Si ricomincia da capo!"); } };
}
