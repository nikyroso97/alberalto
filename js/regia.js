/* Alberalto · la REGIA: legge le storie (cartella storie/) e le fa vivere nel mondo.
   Non contiene nessuna storia: per aggiungerne una basta un file di dati (vedi COME-AGGIUNGERE-UNA-STORIA.md). */
"use strict";
import {$, S, salva, suono, dialogo, domanda, toast, premio, finestra, occupato, NOMI, AV, aspetta, schermo, lampo} from "./core.js";
import {M, punto, ridisegna, guardaVerso, aggiungi, togli, bagliore, sprite, spriteTex, goccia, aggiungiPersona, aggiornaChiamate, onda, vaiA, yawDi, angDiff, RAGGIO, PH} from "./mondo.js";
import * as MONDO from "./mondo-dati.js";
import STORIE from "../storie/indice.js";
import {preparaCopione} from "./copione.js";
import {apriLabBrocca} from "./lab-brocca.js";
import {apriLabEco} from "./lab-eco.js";
import {apriLabChiocciole} from "./lab-chiocciole.js";
import {apriTaccuino} from "./taccuino.js";
import {celebraFaro} from "./albero.js";

/* i laboratori che una storia può aprire con {lab: "nome"} */
const LAB = {brocca: apriLabBrocca, eco: apriLabEco, chiocciole: apriLabChiocciole};
export function registraLab(nome, fn) { LAB[nome] = fn; }

const F = () => S.f;
const vale = (fn, ...a) => typeof fn === "function" ? fn(S.f, S, M, ...a) : fn;
const avvolgi = o => { if (o && typeof o.se === "function" && !o.se._avvolto) { const se = o.se; o.se = () => se(S.f, S, M); o.se._avvolto = true; } return o; };

/* ======================== il mondo + le aggiunte delle storie ======================== */
const copia = o => JSON.parse(JSON.stringify(o, (k, v) => v));
export const LUOGHI = {}, PRIMO = Object.assign({}, MONDO.PRIMO), RAGGI = Object.assign({}, MONDO.RAGGI), ALATI = Object.assign({}, MONDO.ALATI), MAPPA = Object.assign({}, MONDO.MAPPA);
for (const [k, L] of Object.entries(MONDO.LUOGHI)) LUOGHI[k] = Object.assign({}, L, {uscite: [...L.uscite], persone: [...(L.persone || [])], cose: [...(L.cose || [])]});
export const SCOPERTE = {};
for (const st of STORIE) {
  for (const [k, L] of Object.entries(st.luoghi || {})) {
    LUOGHI[k] = Object.assign({persone: [], cose: [], uscite: []}, L);
    if (L.primo) PRIMO[k] = L.primo; if (L.raggi) RAGGI[k] = L.raggi; if (L.alati) ALATI[k] = L.alati; if (L.mappa) MAPPA[k] = L.mappa;
  }
  for (const [campo, dove] of [["uscite", "uscite"], ["persone", "persone"], ["cose", "cose"]]) for (const [k, lista] of Object.entries(st[campo] || {})) if (LUOGHI[k]) LUOGHI[k][dove].push(...lista);
  SCOPERTE[st.id] = Object.assign({ep: st.ep, pagina: st.pagina, indizi: () => (st.indizi || []).map(([fn, t]) => [!!vale(fn), t])}, st.scoperta);
}
// ogni battuta riceve un codice per il doppiaggio (es. ep-002-07): il file audio/voci/ep-002-07.mp3, se esiste, la fa parlare
export const COPIONE = preparaCopione(STORIE, MONDO);
for (const L of Object.values(LUOGHI)) { avvolgi(L); for (const u of L.uscite) avvolgi(u); for (const p of L.persone) avvolgi(p); for (const c of L.cose) avvolgi(c); }
// un'uscita verso un luogo non ancora disponibile resta nascosta
for (const L of Object.values(LUOGHI)) for (const u of L.uscite) { const dest = LUOGHI[u.verso]; if (dest && dest.se) { const s1 = u.se, s2 = dest.se; u.se = () => (!s1 || s1()) && s2(); } }
export const NOMIMAPPA = Object.fromEntries(Object.entries(MAPPA).map(([k, v]) => [k, v[2]]));
export const {CURIO, FOGLIE} = MONDO;
export const TESTI_CURIO = {}, DOVE_CURIO = {};
for (const [k, L] of Object.entries(LUOGHI)) for (const c of L.curio || []) { TESTI_CURIO[c[3]] = c[4]; DOVE_CURIO[c[3]] = k; }
export const EPISODI = MONDO.EPISODI.map(e => { const st = STORIE.find(s => s.ep === e[0]); return [...e, st ? st.id : undefined]; });
export {STORIE};

/* ======================== quale storia è in corso ======================== */
const finita = st => (st.passi || []).every(p => vale(p.fatto));
const sbloccata = st => (st.richiede || []).every(id => { const s = STORIE.find(x => x.id === id); return !s || finita(s); }) || (st.iniziata && vale(st.iniziata));
export function statoStoria(id) { const st = STORIE.find(s => s.id === id); return !st ? "assente" : finita(st) ? "fatta" : sbloccata(st) ? "aperta" : "chiusa"; }
export const storiaAttiva = () => STORIE.find(st => !finita(st) && sbloccata(st)) || null;
export function obiettivo() {
  const st = storiaAttiva(); if (!st) return S.f.intro ? {t: `Esplora il Borgo: foglie d'oro ${Object.keys(S.foglie).length}/5 · curiosità ${Object.keys(S.curio).length}/7`, dove: null} : null;
  const p = st.passi.find(p => !vale(p.fatto)); if (!p) return null;
  return {t: vale(p.t), dove: vale(p.dove) || null, scrivi: p.scrivi ? st.id : null, lab: p.lab || null, chiama: p.chiama, nonna: p.nonna, storia: st};
}
export function chiama(k) { const o = obiettivo(); return !!o && o.chiama === k; }

/* ======================== HUD ======================== */
export function aggiornaHud() {
  const o = obiettivo(), ob = $("#obiettivo");
  ob.innerHTML = o ? `<span class="st">★</span><span>${o.t}</span>${o.scrivi ? `<button class="btn verde piccolo" id="scrivi">📒 Scrivi</button>` : ""}${o.lab ? `<button class="btn piccolo" id="vaiLab">🔬 Prove</button>` : ""}` : "";
  ob.onclick = () => { if (!occupato()) aiutoBip(); };
  const s = $("#scrivi"); if (s) s.onclick = ev => { ev.stopPropagation(); if (!occupato()) scriviScoperta(o.scrivi); };
  const l = $("#vaiLab"); if (l) l.onclick = ev => { ev.stopPropagation(); if (!occupato()) esegui(o.lab); };
  $("#bTaccuino").hidden = !F().taccuino;
  $("#bTaccuino").classList.toggle("nota", !!o && !!o.scrivi);
  $("#bMappa").hidden = !F().intro;
  for (const e of document.querySelectorAll(".faroC b")) e.textContent = S.scoperte.length;
  const L = LUOGHI[M.qui]; $("#grida").classList.toggle("on", !!(L && L.eco && (!L.gridaSe || L.gridaSe(S.f))));
  aggiornaChiamate(); salva();
}

/* ======================== oggetti di scena delle storie ======================== */
export function extra(id) {
  for (const st of STORIE) for (const o of (st.scena || {})[id] || []) {
    if (o.se && !vale(o.se)) continue;
    if (o.tipo === "persona") aggiungiPersona(o.chi, o.x, o.y, o.h);
    else if (o.tipo === "luce") bagliore(punto(o.x, o.y, RAGGIO * .96), o.s || 1, o.op ?? .95);
    else if (o.tipo === "gocce") for (let k = 0; k < (o.n || 40); k++) { const passo = (o.a - o.da) / 5; goccia(punto(o.da + (k % 6) * passo + (Math.random() - .5) * passo * .6, o.y + Math.random() * o.h, RAGGIO * .97)); }
    else if (o.tipo === "immagine") { const piede = punto(o.x, o.y, RAGGIO * .93), testa = punto(o.x, o.y - o.h, RAGGIO * .93); spriteTex(o.img, piede, testa.y - piede.y, o.tocca ? {tipo: "tocca", fai: () => esegui("cosa:" + o.tocca)} : {}); }
    else if (o.tipo === "cerca") {
      const trovato = (F().trovati || {})[o.id], piede = punto(o.x, o.y, RAGGIO * .92), testa = punto(o.x, o.y - o.h, RAGGIO * .92);
      const s = spriteTex(o.img, piede, testa.y - piede.y, trovato ? {} : {tipo: "tocca", fai: () => trova(o, s), f: Math.random() * 6, anima: (sp, t, dt) => { sp.material.opacity = .55 + .45 * Math.pow(Math.max(0, Math.sin(t * 2.2 + sp.userData.f)), 6); }});
      if (trovato) s.material.opacity = .9;
    }
  }
}
async function trova(o, s) {
  if (occupato()) return;
  (F().trovati = F().trovati || {})[o.id] = true; suono.tintinnio(); s.userData = {}; s.material.opacity = 1;
  await esegui("trovato:" + o.img, o.id); aggiornaHud();
}

/* ======================== le regole e le sequenze ======================== */
function regoleValide(chiave, ev) {
  const attiva = storiaAttiva(), ordine = [attiva, ...STORIE.filter(s => s !== attiva && sbloccata(s))].filter(Boolean);
  for (const st of ordine) for (const r of st.regole || []) if (r.su === chiave && (!r.se || vale(r.se, ev))) return r;
  return null;
}
/* fa partire la prima regola che corrisponde; restituisce true se c'era qualcosa da fare */
export async function esegui(chiave, ev) {
  const r = regoleValide(chiave, ev);
  if (r) { await corri(r.fai, ev); aggiornaHud(); return true; }
  const [tipo, nome] = chiave.split(":");
  if (tipo === "persona") {
    const o = obiettivo();
    if (nome === "nonna" && o && o.nonna) return dire([["nonna", o.nonna[0], o.nonna[1]]]).then(() => true);
    if (MONDO.CHIACCHIERE[nome]) return dire(MONDO.CHIACCHIERE[nome]).then(() => true);
  }
  if (tipo === "cosa" && MONDO.COSE_MONDO[nome]) { await corri(MONDO.COSE_MONDO[nome], ev); aggiornaHud(); return true; }
  return false;
}
const parlaOpz = {parla: chi => M.parlante = chi};
const dire = b => dialogo(b, parlaOpz);
const ctx = {get f() { return S.f; }, get S() { return S; }, M, suono};
/* azioni che si possono mettere dentro una battuta (quinta posizione): {vola}, {eco} */
function azione(a) {
  if (!a || typeof a === "function") return a;
  if (a.vola) return () => vola(...a.vola);
  if (a.eco) return () => ecoDopo(...a.eco);
  return undefined;
}
async function corri(fai, ev) {
  const lista = fai || [];
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i];
    if (Array.isArray(p)) { // battute di fila: un solo dialogo
      const gruppo = []; let j = i;
      while (j < lista.length && Array.isArray(lista[j])) { const b = lista[j]; gruppo.push([b[0], vale(b[1]), b[2] || b.codice && "#" + b.codice, b[3], azione(b[4])]); j++; }
      await dire(gruppo); i = j - 1; continue;
    }
    if (p.set !== undefined) { if (typeof p.set === "string") F()[p.set] = p.valore ?? true; else Object.assign(F(), p.set); salva(); aggiornaHud(); }
    else if (p.conta) { F()[p.conta] = (F()[p.conta] || 0) + 1; salva(); }
    else if (p.se) { await corri(vale(p.se, ev) ? p.fai : p.altrimenti, ev); }
    else if (p.regola) { const r = regoleValide(p.regola, ev); if (r) await corri(r.fai, ev); }
    else if (p.toast) toast(vale(p.toast));
    else if (p.premio) await premio(...p.premio);
    else if (p.ridisegna) ridisegna();
    else if (p.guarda) guardaVerso(p.guarda);
    else if (p.suono) suono[p.suono] && suono[p.suono]();
    else if (p.attendi) await aspetta(p.attendi);
    else if (p.mano) mano();
    else if (p.vai) vaiA(p.vai);
    else if (p.fumetto) fumetto(...p.fumetto);
    else if (p.eco) await ecoDopo(...p.eco);
    else if (p.vola) vola(...p.vola);
    else if (p.lab) { const ok = await (LAB[p.lab] ? LAB[p.lab]() : Promise.resolve(true)); aggiornaHud(); if (!ok) return false; }
    else if (p.domanda) await chiedi(p.domanda);
    else if (p.scrivi) { if (!(await scriviScoperta(p.scrivi))) return false; }
    else if (p.parlarne) await perParlarne(p.parlarne);
    else if (p.fn) await p.fn(ctx, ev);
  }
  return true;
}
async function chiedi(d) {
  const opz = [[d.giusta, "giusta"], ...(d.sbagliate || []).map((s, k) => [s[0], k])];
  for (;;) {
    const r = await domanda(d.chi || "bip", d.testo, d.voce || (d.codice && "#" + d.codice), mescolaOpz(opz));
    if (r === "giusta") return;
    suono.sbaglio(); await corri(d.sbagliate[r][1]);
  }
}
const mescolaOpz = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ======================== personaggi e cose (chiamati dal mondo) ======================== */
export const parla = chi => esegui("persona:" + chi);
export const usa = id => esegui("cosa:" + id);
export function arrivato(id) {
  const r = regoleValide("arrivo:" + id);
  if (!r) return false;
  corri(r.fai).then(aggiornaHud); return true;
}
export const ingresso = () => esegui("ingresso");

/* ======================== scrivere nel taccuino e accendere il Faro ======================== */
export async function scriviScoperta(id) {
  if (!id || S.scoperte.includes(id)) { apriTaccuino(); return true; }
  const letto = await apriTaccuino({scrivi: id});
  if (!letto) { aggiornaHud(); return false; }
  S.scoperte.push(id); salva();
  await celebraFaro(id);
  lampo(400); schermo("borgo"); ridisegna(); aggiornaHud();
  return true;
}
async function perParlarne(id) {
  const s = SCOPERTE[id];
  await new Promise(fine => {
    const ultima = STORIE[STORIE.length - 1].id === id;
    const fin = finestra("finPiano", "💬 Per parlarne insieme", `<div style="font-size:20px;font-weight:700;line-height:1.35">${s.parlarne}</div>
      <details><summary>Il vero perché (per i grandi)</summary><p style="margin-top:6px;line-height:1.45">${s.vero}</p></details>
      ${ultima ? `<p style="font-size:14px;opacity:.75;margin-top:10px">Per ora le avventure finiscono qui. Le prossime arriveranno con il libro!</p>` : ""}
      <div class="azioni"><button class="btn verde" id="contEspl">Continua a esplorare ▸</button></div>`, {chiusa: fine});
    $("#contEspl").onclick = () => fin.chiudi();
  });
}

/* ======================== foglie d'oro e curiosità ======================== */
export async function foglia(o) {
  S.foglie[M.qui] = true; suono.tintinnio(); const {alone, stella, anello} = o.userData; for (const x of [o, alone, stella, anello]) if (x) togli(x); salva();
  const n = Object.keys(S.foglie).length; aggiornaHud();
  await dire([n === 5 ? ["bip", "Tutte e cinque le foglie d'oro! Sei un vero esploratore!", "o3"] : n === 1 ? ["bip", "Una foglia d'oro! Chissà quante ce ne sono nel Borgo…", "o1"] : ["bip", `Un'altra foglia d'oro! (${n} su 5)`, null]]);
  if (n === 5) premio("🍂", "Tutte le foglie d'oro!", "Hai esplorato ogni angolo del Borgo delle Radici.");
}
export async function curio(u) {
  if (!S.curio[u.chiave]) { S.curio[u.chiave] = true; suono.tintinnio(); salva(); }
  await dire([[u.chi, u.testo, u.v]]);
  toast(`🔍 Curiosità ${Object.keys(S.curio).length} su 7 · nel taccuino`);
}

/* ======================== Bip, aiuto! ======================== */
export async function aiutoBip() {
  if (occupato()) return;
  const o = obiettivo();
  if (!o) return dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", "Esploriamo!", null]]);
  if (o.scrivi) { await dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", "Hai capito il perché! Scriviamolo nel taccuino.", null]]); return scriviScoperta(o.scrivi); }
  if (o.lab) return esegui(o.lab);
  if (!o.dove || o.dove === M.qui) return dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", o.t + ". Guardati intorno: è qui vicino!", null]]);
  const r = await domanda("bip", `${o.t}. Ti accompagno io?`, "h0", [["Sì, andiamo insieme! 🏃", "si"], ["No, la trovo da solo 🔍", "no"]]);
  if (r === "si") vaiA(o.dove);
}

/* ======================== la mappa del Borgo ======================== */
export function apriMappa() {
  const pos = Object.fromEntries(Object.entries(MAPPA).filter(([k]) => LUOGHI[k] && (!LUOGHI[k].se || LUOGHI[k].se())));
  const archi = []; for (const [k, L] of Object.entries(LUOGHI)) if (pos[k]) for (const u of L.uscite) if ((!u.se || u.se()) && pos[u.verso] && k < u.verso) archi.push([pos[k], pos[u.verso]]);
  const o = obiettivo();
  const f = finestra("finMappa", "🗺️ Il Borgo delle Radici", `<div style="font-size:14px;margin-bottom:6px">Tocca un luogo per andarci.</div>
    <div class="mappa"><svg viewBox="0 0 100 57" preserveAspectRatio="none">${archi.map(([[px, py], [x, y]]) => `<path d="M${px} ${py * .57} Q${(px + x) / 2 + 5} ${(py + y) / 2 * .57 - 5} ${x} ${y * .57}" stroke="#c9a36b" stroke-width="1.1" stroke-dasharray="2 1.5" fill="none"/>`).join("")}</svg>
    ${Object.entries(pos).map(([k, [x, y, n]]) => `<button class="nodo ${k === M.qui ? "qui" : ""} ${S.visti[k] ? "" : "ignoto"}" data-k="${k}" style="left:${x}%;top:${y}%"><span class="im" style="background-image:url(img/mini-${k}.webp)"></span><span class="t">${n}${o && o.dove === k ? " ★" : ""}</span></button>`).join("")}</div>`, {largo: true});
  f.querySelectorAll(".nodo").forEach(b => b.onclick = () => { const k = b.dataset.k; f.chiudi(); if (k !== M.qui) setTimeout(() => vaiA(k), 150); });
}

/* ======================== l'eco (meccanica del mondo: luoghi con «eco» e «parete») ======================== */
const RITARDI = {lontano: [[.62, .5], [1.24, .18]], vicino: [[.06, .45], [.12, .22]]};
async function ecoDopo(n, tipo, voceAncheOra) {
  if (voceAncheOra) suono.voce(n);
  const b = await suono.carica(n), d = b ? b.duration : .6, L = LUOGHI[M.qui];
  suono.eco(n, RITARDI[tipo].map(([dl, g]) => [d + dl - (tipo === "vicino" ? d * .85 : 0), g]));
  if (L && L.parete) onda(tipo, d, undefined, L.parete[0]);
}
let gridando = false;
export async function grida() {
  if (occupato() || gridando || M.inCammino) return; gridando = true; setTimeout(() => gridando = false, 2400);
  const L = LUOGHI[M.qui], dP = Math.abs(angDiff(M.yaw, yawDi(L.parete[0]))), dM = L.muschio ? Math.abs(angDiff(M.yaw, yawDi(L.muschio[0]))) : 9;
  let tipo = "spalle";
  if (L.muschio && dM < L.muschio[1]) tipo = "muschio"; else if (dP < L.parete[1]) tipo = L.eco;
  suono.voce("e5"); const b = await suono.carica("e5"); const d = b ? b.duration : .5;
  if (tipo === "lontano" || tipo === "vicino") ecoDopo("e5", tipo); else onda(tipo, d * .5, tipo === "muschio" ? L.muschio[0] : undefined, L.parete[0]);
  await aspetta((d + (tipo === "lontano" ? 1.5 : .9)) * 1000);
  await esegui("evento:grida", tipo);
}
export function fumetto(chi, testo, v) {
  const f = $("#fumetto"); f.querySelector(".av").style.backgroundImage = `url(img/av-${AV[chi]}.webp)`; f.querySelector(".t").textContent = testo; f.classList.add("on");
  M.parlante = chi; suono.dici(chi, testo, v);
  clearTimeout(fumetto.h); fumetto.h = setTimeout(() => f.classList.remove("on"), 4600);
}

/* ======================== piccole animazioni ======================== */
function vola(chi, x0, y0, x1, y1) {
  const s = sprite(chi, .9); aggiungi(s); let k = 0;
  const da = punto(x0, y0, RAGGIO * .75), a = punto(x1, y1, RAGGIO * .75);
  const passo = () => { k += .009; s.position.lerpVectors(da, a, Math.min(1, k)); s.position.y += Math.sin(k * Math.PI) * .35; s.material.rotation = Math.sin(k * 30) * .15; s.material.opacity = 1 - Math.max(0, k - .8) * 5; if (k < 1) requestAnimationFrame(passo); else togli(s); };
  passo();
}
function mano() {
  const m = $("#mano"); m.classList.add("on"); const via = () => m.classList.remove("on");
  setTimeout(via, 7000); addEventListener("pointerdown", via, {once: true});
}

export const storia = {LUOGHI, PRIMO, RAGGI, ALATI, NOMI, parla, usa, arrivato, chiama, extra, aggiornaHud, foglia, curio};
