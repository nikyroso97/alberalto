/* Alberalto · Officina delle storie: coordinate sui panorami e copione per il doppiaggio */
"use strict";
import * as MONDO from "./mondo-dati.js";
import STORIE from "../storie/indice.js";
import {preparaCopione} from "./copione.js";

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const PW = 3384, PH = 1536;
const NOMI = {leo: "Leo", nonna: "Nonna Tessa", mira: "Mira", tobia: "Tobia", bip: "Bip", pico: "Pico"};

/* ---------- schede ---------- */
$$(".schede button").forEach(b => b.onclick = () => {
  $$(".schede button").forEach(x => x.classList.toggle("on", x === b));
  for (const s of ["scena", "copione", "storie"]) $("#s" + s[0].toUpperCase() + s.slice(1)).hidden = b.dataset.s !== s;
});

/* ---------- i luoghi: quelli del mondo più quelli delle storie ---------- */
const LUOGHI = {};
for (const [k, L] of Object.entries(MONDO.LUOGHI)) LUOGHI[k] = {nome: L.nome, base: L, da: "mondo"};
for (const st of STORIE) for (const [k, L] of Object.entries(st.luoghi || {})) LUOGHI[k] = {nome: L.nome, base: L, da: st.ep};
function segni(k) { // tutto quello che c'è già in un luogo
  const L = LUOGHI[k].base, out = [];
  for (const u of L.uscite || []) out.push(["uscita", u.x, u.y, "➜ " + u.testo]);
  for (const p of L.persone || []) out.push(["persona", p.x, p.y, NOMI[p.chi]]);
  for (const c of L.cose || []) out.push(["cosa", c.x, c.y, c.testo]);
  for (const c of L.curio || []) out.push(["cosa", c[0], c[1], "🔍 " + c[3]]);
  for (const l of L.luci || []) out.push(["luce", l[0], l[1], "💡"]);
  if (L.foglia) out.push(["cosa", L.foglia[0], L.foglia[1], "🍂 foglia"]);
  for (const st of STORIE) {
    for (const u of (st.uscite || {})[k] || []) out.push(["uscita", u.x, u.y, `➜ ${u.testo} (${st.ep})`]);
    for (const p of (st.persone || {})[k] || []) out.push(["persona", p.x, p.y, `${NOMI[p.chi]} (${st.ep})`]);
    for (const c of (st.cose || {})[k] || []) out.push(["cosa", c.x, c.y, `${c.testo} (${st.ep})`]);
    for (const o of (st.scena || {})[k] || []) out.push(["cosa", o.x ?? o.da, o.y, `${o.tipo}${o.id ? " " + o.id : ""} (${st.ep})`]);
  }
  return out;
}
$("#luogo").innerHTML = Object.entries(LUOGHI).map(([k, L]) => `<option value="${k}">${L.nome} · ${k}${L.da !== "mondo" ? ` (${L.da})` : ""}</option>`).join("");
let modo = "uscita", nuovi = [], piedi = null;
$$("#modo button").forEach(b => b.onclick = () => { modo = b.dataset.m; piedi = null; $$("#modo button").forEach(x => x.classList.toggle("on", x === b)); });
function mostra() {
  const k = $("#luogo").value; $("#img").src = `img/pano-${k}.webp`;
  $$(".seg,.linea").forEach(e => e.remove());
  for (const [t, x, y, n] of segni(k)) metti(t, x, y, n);
  for (const n of nuovi.filter(n => n.luogo === k)) metti("nuovo", n.x, n.y, n.et);
}
function metti(tipo, x, y, testo) { const d = document.createElement("div"); d.className = "seg " + tipo; d.style.left = (x / PW * 100) + "%"; d.style.top = (y / PH * 100) + "%"; d.textContent = testo; $("#pano").appendChild(d); }
$("#luogo").onchange = () => { piedi = null; mostra(); };
$("#img").onclick = e => {
  const r = e.target.getBoundingClientRect(), x = Math.round((e.clientX - r.left) / r.width * PW), y = Math.round((e.clientY - r.top) / r.height * PH), k = $("#luogo").value;
  let codice, et;
  if (modo === "persona") {
    if (!piedi) { piedi = [x, y]; metti("nuovo", x, y, "piedi… ora clicca la testa"); return; }
    const [px, py] = piedi, h = Math.max(40, py - y); piedi = null;
    nuovi.push({luogo: k, x: px, y: py, et: `🧑 h ${h}`, codice: `{chi: "tobia", x: ${px}, y: ${py}, h: ${h}},   // in persone: {${k}: [ ... ]}`}); return aggiorna();
  }
  if (modo === "uscita") { codice = `{verso: "NOME-LUOGO", x: ${x}, y: ${y}, testo: "Verso…"},   // in uscite: {${k}: [ ... ]}`; et = "➜ uscita"; }
  if (modo === "cosa") { codice = `{id: "nome-cosa", x: ${x}, y: ${y}, testo: "Nome da mostrare"},   // in cose: {${k}: [ ... ]}`; et = "✋ cosa"; }
  if (modo === "cerca") { codice = `{tipo: "cerca", id: "c1", img: "scia", x: ${x}, y: ${y}, h: 60},   // in scena: {${k}: [ ... ]}`; et = "✨ da cercare"; }
  if (modo === "luce") { codice = `[${x}, ${y}, .8],   // in luci del luogo ${k}`; et = "💡"; }
  if (modo === "curio") { codice = `[${x}, ${y}, "bip", "k9", "Che cosa dice Bip…"],   // in curio del luogo ${k}`; et = "🔍"; }
  nuovi.push({luogo: k, x, y, et, codice}); aggiorna();
};
function aggiorna() { $("#codice").textContent = nuovi.map(n => n.codice).join("\n"); mostra(); }
$("#copia").onclick = () => navigator.clipboard.writeText($("#codice").textContent).then(() => { $("#copia").textContent = "✔ Copiato"; setTimeout(() => $("#copia").textContent = "📋 Copia", 1500); });
$("#svuota").onclick = () => { nuovi = []; piedi = null; aggiorna(); };
mostra();

/* ---------- il copione ---------- */
const COPIONE = preparaCopione(STORIE, MONDO);
let doppiate = new Set();
fetch("audio/voci/elenco.json").then(r => r.ok ? r.json() : []).then(l => { doppiate = new Set(l); copione(); }).catch(copione);
const statoVoce = b => b.voce ? ["cast", "🎭 cast"] : doppiate.has(b.codice) ? ["dopp", "✔ doppiata"] : ["da", "da doppiare"];
$("#filtroChi").innerHTML += Object.entries(NOMI).map(([k, n]) => `<option value="${k}">${n}</option>`).join("");
$("#filtroSt").innerHTML += ["mondo", ...STORIE.map(s => s.ep)].map(e => `<option>${e}</option>`).join("");
const filtrate = () => COPIONE.filter(b => (!$("#filtroChi").value || b.chi === $("#filtroChi").value) && (!$("#filtroSt").value || b.storia === $("#filtroSt").value) && (!$("#soloDa").checked || statoVoce(b)[0] === "da"));
function copione() {
  const l = filtrate();
  $("#righe").innerHTML = l.map(b => { const [c, t] = statoVoce(b); return `<tr><td><code>${b.codice}</code></td><td>${NOMI[b.chi] || b.chi}</td><td>${b.testo}</td><td>${b.nota}</td><td><span class="stato ${c}">${t}</span></td></tr>`; }).join("");
  const da = COPIONE.filter(b => statoVoce(b)[0] === "da").length;
  $("#conta").textContent = `${l.length} battute mostrate · ${da} da doppiare su ${COPIONE.length}`;
}
for (const id of ["#filtroChi", "#filtroSt", "#soloDa"]) $(id).onchange = copione;
$("#scarica").onclick = () => {
  const q = v => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "codice;personaggio;battuta;nota;voce\n" + filtrate().map(b => [b.codice, NOMI[b.chi] || b.chi, b.testo, b.nota, statoVoce(b)[1]].map(q).join(";")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], {type: "text/csv"})); a.download = "copione-alberalto.csv"; a.click();
};

/* ---------- le storie ---------- */
$("#elencoStorie").innerHTML = STORIE.map(st => `<details open style="margin-bottom:8px"><summary><b>${st.ep} · ${st.titolo}</b> (${st.piano}, pagina ${st.pagina}) — file della storia «${st.id}»</summary>
  <p class="aiuto">Richiede: ${(st.richiede || []).join(", ") || "niente"} · ${st.passi.length} obiettivi · ${st.regole.length} sequenze · battute: ${COPIONE.filter(b => b.storia === st.ep).length}${st.luoghi ? " · luoghi nuovi: " + Object.keys(st.luoghi).join(", ") : ""}</p>
  <ol style="margin-left:20px;font-size:14px">${st.passi.map(p => `<li>${typeof p.t === "function" ? "(obiettivo che cambia)" : p.t}${p.dove ? ` — <i>${typeof p.dove === "function" ? "luogo variabile" : p.dove}</i>` : ""}</li>`).join("")}</ol></details>`).join("");
