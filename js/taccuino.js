/* Alberalto · il taccuino di Leo: scoperte, indizi, tesori */
"use strict";
import {$, $$, S, suono, finestra, chiudiModale} from "./core.js";
import {SCOPERTE, CURIO, TESTI_CURIO, FOGLIE, NOMIMAPPA} from "./avventure.js";

export function apriTaccuino(opz = {}) {
  return new Promise(fine => {
    if (opz.scrivi) return scrivi(opz.scrivi, fine);
    const schede = `<div class="schede"><button data-s="scoperte" class="on">✦ Scoperte</button><button data-s="indizi">🔍 Indizi</button><button data-s="tesori">🍂 Tesori</button></div>`;
    const f = finestra("finTaccuino", "📒 Il taccuino di Leo", "", {schede, largo: true, chiusa: () => fine(false)});
    const corpo = $(".corpo", f);
    const mostra = s => {
      $$(".schede button", f).forEach(b => b.classList.toggle("on", b.dataset.s === s));
      if (s === "scoperte") corpo.innerHTML = S.scoperte.length ? `<div class="scoperte">${S.scoperte.map(id => pagina(id)).join("")}</div>` + `<p style="text-align:center;margin-top:10px;font-size:14px;opacity:.7">✦ ${S.scoperte.length} scoperte su 12 · ogni scoperta fa brillare il Faro della Memoria</p>`
        : `<div class="pagina vuota">Le pagine sono ancora bianche…<br>Quando capirai il <b>perché</b> di qualcosa, lo scriverai qui!</div>`;
      if (s === "indizi") corpo.innerHTML = `<ul class="indizi">${Object.entries(SCOPERTE).filter(([id]) => id === "brocca" || S.f.a2arr).map(([id, sc]) => `<h4>${sc.titolo}</h4>` + sc.indizi().map(([ok, t]) => `<li class="${ok ? "ok" : "no"}">${ok ? t : "…ancora da scoprire"}</li>`).join("")).join("")}</ul>`;
      if (s === "tesori") corpo.innerHTML = `<h4 style="font-family:Fredoka;color:var(--terra);margin-bottom:6px">🍂 Foglie d'oro · ${Object.keys(S.foglie).length} su 5</h4>
        <div class="tesori">${FOGLIE.map(k => `<div class="tesoro ${S.foglie[k] ? "" : "no"}"><span class="ic">${S.foglie[k] ? "🍂" : "❔"}</span><b>${S.foglie[k] ? NOMIMAPPA[k] : "Nascosta…"}</b></div>`).join("")}</div>
        <h4 style="font-family:Fredoka;color:var(--terra);margin:12px 0 6px">🔍 Curiosità · ${Object.keys(S.curio).length} su 7</h4>
        <div class="tesori">${Object.entries(CURIO).map(([k, c]) => `<div class="tesoro ${S.curio[k] ? "" : "no"}"><span class="ic">${S.curio[k] ? c.ic : "✨"}</span><b>${S.curio[k] ? c.t : "Un luccichio…"}</b>${S.curio[k] ? `<small>${TESTI_CURIO[k]}</small>` : `<small>Cerca ciò che luccica: ${NOMIMAPPA[c.dove]}</small>`}</div>`).join("")}</div>`;
      suono.pop();
    };
    $$(".schede button", f).forEach(b => b.onclick = () => mostra(b.dataset.s));
    mostra(opz.scheda || "scoperte");
  });
}
const pagina = id => { const s = SCOPERTE[id]; return `<div class="pagina">${s.disegno}<h3>${s.titolo}</h3>${s.testo}<div style="clear:both;font-size:15px;color:#7a6a55;margin-top:4px">Lo trovi anche nel libro, a pagina ${s.pagina}</div></div>`; };

function scrivi(id, fine) {
  const s = SCOPERTE[id];
  const f = finestra("finTaccuino", "📒 Il taccuino di Leo", `<div class="pagina" id="pagScrivi" style="min-height:180px">${s.disegno.replace('class="dis"', 'class="dis" style="opacity:0;transition:opacity 1.2s"')}<h3>${s.titolo}</h3><span id="scritta"></span><span class="cursore">✏️</span></div>
    <div class="azioni"><button class="btn verde" id="leggi" disabled>📣 Leggilo a tutto il Borgo ▸</button></div>`, {chiusa: () => fine(false)});
  const sc = $("#scritta"), pag = $("#pagScrivi"); let i = 0, finito = false;
  const completa = () => { finito = true; clearInterval(h); sc.textContent = s.testo; $(".cursore", f)?.remove(); $(".dis", pag).style.opacity = 1; const b = $("#leggi"); b.disabled = false; b.classList.add("pulsa"); };
  const h = setInterval(() => { sc.textContent = s.testo.slice(0, ++i); if (i % 4 === 0) suono.tic(); if (i === 30) $(".dis", pag).style.opacity = 1; if (i >= s.testo.length) completa(); }, 32);
  pag.onclick = () => { if (!finito) completa(); };
  $("#leggi").onclick = () => { f.onclick = null; f.classList.remove("on"); chiudiModale(); suono.pop(); fine(true); };
}
