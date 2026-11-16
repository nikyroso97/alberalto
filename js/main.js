/* Alberalto · avvio dell'app */
"use strict";
import {$, S, caricaPartita, salva, suono, schermo, toast, occupato, aspetta} from "./core.js";
import {preparaMondo, nPassiCaricamento, entra, esci, M, attivaGiro, spegniGiro, giroDisponibile, giroChiedePermesso} from "./mondo.js";
import {storia, intro, aiutoBip, apriMappa, grida, aggiornaHud} from "./avventure.js";
import {preparaAlbero, mostraAlbero} from "./albero.js";
import {apriTaccuino} from "./taccuino.js";

caricaPartita();

/* ---------- orientamento: il Borgo e i laboratori vogliono il telefono in orizzontale ---------- */
const orienta = () => document.body.classList.toggle("verticale", innerHeight > innerWidth && Math.min(innerWidth, innerHeight) < 600);
addEventListener("resize", orienta); orienta();

/* ---------- caricamento ---------- */
const totale = nPassiCaricamento(storia) + 1; let fatti = 0;
const avanza = () => { fatti++; $(".carBar i").style.width = Math.min(100, fatti / totale * 100) + "%"; };
preparaAlbero({entra: vaiNelBorgo, taccuino: () => apriTaccuino(), avventura: iniziaAvventura});
const img = new Image(); img.onload = img.onerror = avanza; img.src = "img/albero.webp";
preparaMondo(storia, avanza).then(() => {
  $("#caricaT").textContent = S.f.intro ? "Bentornato ad Alberalto!" : "Pronto!";
  const b = $("#gioca"); b.disabled = false; b.textContent = S.f.intro ? "Continua ▸" : "Gioca ▸"; b.classList.add("pulsa");
}).catch(e => { $("#caricaT").textContent = "Ops, qualcosa non va: " + e.message; console.error(e); });

$("#gioca").onclick = async () => {
  suono.init(); suono.pop();
  if (matchMedia("(pointer: coarse)").matches && !matchMedia("(display-mode: standalone)").matches) {
    try { await document.documentElement.requestFullscreen?.({navigationUI: "hide"}); } catch (e) {}
  }
  try { await screen.orientation?.lock?.("landscape"); } catch (e) {}
  mostraAlbero();
};

/* ---------- entrare nel Borgo ---------- */
async function vaiNelBorgo(luogo) {
  schermo("borgo"); orienta();
  entra(luogo);
  $("#bGiro").hidden = !giroDisponibile();
  if (!S.f.intro) { await aspetta(500); await intro(); mano(); await aspetta(1500); }
  invitoGiro();
}
function iniziaAvventura(id) {
  if (id === "brocca" && S.scoperte.includes("brocca")) return apriTaccuino();
  if (id === "eco" && S.scoperte.includes("eco")) return apriTaccuino();
  if (id === "eco" && !S.f.a2) { S.f.a2 = S.f.finale = S.f.libro = true; salva(); toast("🗺️ Nuovo luogo: il prato della Radice Cava"); return vaiNelBorgo("piazza"); }
  if (id === "eco") return vaiNelBorgo(S.f.a2arr ? S.luogo : "piazza");
  vaiNelBorgo(S.luogo || "piazza");
}
function mano() {
  const m = $("#mano"); m.classList.add("on"); const via = () => m.classList.remove("on");
  setTimeout(via, 7000); addEventListener("pointerdown", via, {once: true});
}

/* ---------- il giroscopio ---------- */
async function invitoGiro() {
  if (!giroDisponibile()) return;
  if (S.imp.giro === false) return aggiornaGiro();
  if (S.imp.giro === true && !giroChiedePermesso()) { await attivaGiro(); return aggiornaGiro(); }
  if (S.imp.giro === true && M.giro) return aggiornaGiro();
  if (!giroChiedePermesso()) { if (await attivaGiro()) { S.imp.giro = true; salva(); toast("📱 Muovi il telefono per guardarti intorno!", 3500); } return aggiornaGiro(); }
  $("#giroInvito").classList.add("on"); // su iPhone serve un tocco per chiedere il permesso
}
$("#giroSi").onclick = async () => { $("#giroInvito").classList.remove("on"); S.imp.giro = await attivaGiro(); salva(); aggiornaGiro(); if (S.imp.giro) toast("📱 Muovi il telefono per guardarti intorno!", 3500); };
$("#giroNo").onclick = () => { $("#giroInvito").classList.remove("on"); S.imp.giro = false; salva(); aggiornaGiro(); };
$("#bGiro").onclick = async () => {
  suono.pop();
  if (M.giro) { spegniGiro(); S.imp.giro = false; toast("📱 Giroscopio spento"); }
  else { S.imp.giro = await attivaGiro(); if (S.imp.giro) toast("📱 Muovi il telefono per guardarti intorno!"); }
  salva(); aggiornaGiro();
};
function aggiornaGiro() { $("#bGiro").classList.toggle("off", !M.giro); }

/* ---------- i pulsanti del Borgo ---------- */
$("#bAlbero").onclick = () => { if (occupato() || M.inCammino) return; suono.pop(); esci(); mostraAlbero(); };
$("#bTaccuino").onclick = () => { if (occupato()) return; suono.pop(); const o = document.querySelector("#scrivi"); if (o) o.click(); else apriTaccuino(); };
$("#bMappa").onclick = () => { if (occupato() || M.inCammino) return; suono.pop(); apriMappa(); };
$("#bBip").onclick = () => { if (occupato() || M.inCammino) return; suono.pop(); aiutoBip(); };
$("#grida").onclick = () => grida();

/* ---------- app installabile e utilizzabile senza internet ---------- */
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !location.search.includes("prova")) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

/* ---------- solo per le prove (?prova nell'indirizzo) ---------- */
if (location.search.includes("prova")) Promise.all([import("./core.js"), import("./mondo.js"), import("./avventure.js"), import("./albero.js"), import("./lab-brocca.js"), import("./lab-eco.js")]).then(m => window.__A = Object.assign({}, ...m, {get S() { return m[0].S; }}));
