/* Alberalto · il motore dei luoghi dipinti a 360° (three.js) con giroscopio */
"use strict";
import {$, S, salva, suono, occupato} from "./core.js";
const THREE = window.THREE;

export const PW = 3384, PH = 1536;
const R = 10, HC = 2 * Math.PI * R * PH / PW, DEG = Math.PI / 180;
export const M = {qui: null, yaw: 0, pitch: 0, attivo: false, storia: null, parlante: null, inCammino: false, giro: false};
const TEX = {}, SP = {};
let renderer, scene, camera, matPano, bip = null, FOV0 = 90, zoomArrivo = 0, prossimiUccelli = 99, viaggio = null;
const oggetti = []; let etichette = [];

export const theta = x => 2 * Math.PI * (1 - x / PW);
export function punto(x, y, r = R * .985) { const t = theta(x); return new THREE.Vector3(r * Math.sin(t), (.5 - y / PH) * HC * (r / R), r * Math.cos(t)); }
export const yawDi = x => theta(x) + Math.PI;
export const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
export const RAGGIO = R;

/* ---------- texture disegnate al volo ---------- */
function disegna(w, h, f) { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function radiale(stops) { return (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); stops.forEach(([o, c]) => r.addColorStop(o, c)); g.fillStyle = r; g.fillRect(0, 0, w, h); }; }
function textureBase() {
  TEX.bagliore = disegna(64, 64, radiale([[0, "rgba(255,255,235,1)"], [.3, "rgba(255,220,130,.75)"], [1, "rgba(255,200,80,0)"]]));
  TEX.fuoco = disegna(64, 64, radiale([[0, "rgba(255,240,200,1)"], [.35, "rgba(255,150,60,.7)"], [1, "rgba(255,90,30,0)"]]));
  TEX.goccia = disegna(64, 64, radiale([[0, "rgba(255,255,255,1)"], [.5, "rgba(190,225,245,.95)"], [1, "rgba(150,200,235,0)"]]));
  TEX.ombra = disegna(64, 32, g => { const r = g.createRadialGradient(32, 16, 1, 32, 16, 30); r.addColorStop(0, "rgba(40,25,10,.55)"); r.addColorStop(1, "rgba(40,25,10,0)"); g.setTransform(1, 0, 0, .5, 0, 8); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  TEX.foglia = disegna(64, 64, g => { g.translate(32, 32); g.rotate(-.6); g.fillStyle = "#8fb345"; g.beginPath(); g.ellipse(0, 0, 26, 12, 0, 0, 7); g.fill(); g.strokeStyle = "#5d7a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(-24, 0); g.lineTo(24, 0); g.stroke(); });
  TEX.fogliaOro = disegna(128, 128, g => { g.translate(64, 64); g.rotate(-.7); const l = g.createLinearGradient(-50, 0, 50, 0); l.addColorStop(0, "#b8700a"); l.addColorStop(.45, "#ffd23f"); l.addColorStop(1, "#d88a0c"); g.shadowColor = "rgba(255,200,60,.95)"; g.shadowBlur = 14; g.fillStyle = l; g.beginPath(); g.moveTo(-50, 0); g.quadraticCurveTo(-4, -40, 50, 0); g.quadraticCurveTo(-4, 40, -50, 0); g.fill(); g.shadowBlur = 0; g.strokeStyle = "#7a4a08"; g.lineWidth = 4; g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(-58, 4); g.lineTo(44, 0); g.stroke(); g.lineWidth = 2; for (const k of [-24, 0, 22]) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 12, -14); g.moveTo(k, 0); g.lineTo(k + 12, 14); g.stroke(); } g.fillStyle = "rgba(255,250,215,.8)"; g.beginPath(); g.ellipse(-10, -12, 10, 3, -.2, 0, 7); g.fill(); });
  TEX.stella = disegna(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(.25, "rgba(255,240,170,.8)"); r.addColorStop(1, "rgba(255,220,120,0)"); g.fillStyle = r; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = i % 2 ? 9 : 32; g.lineTo(32 + Math.cos(a) * q, 32 + Math.sin(a) * q); } g.fill(); });
  TEX.raggio = disegna(64, 256, g => { const l = g.createLinearGradient(0, 0, 64, 0); l.addColorStop(0, "rgba(255,230,160,0)"); l.addColorStop(.5, "rgba(255,236,180,.9)"); l.addColorStop(1, "rgba(255,230,160,0)"); g.fillStyle = l; g.fillRect(0, 0, 64, 256); const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(.25, "rgba(0,0,0,1)"); v.addColorStop(1, "rgba(0,0,0,0)"); g.globalCompositeOperation = "destination-in"; g.fillStyle = v; g.fillRect(0, 0, 64, 256); });
  TEX.anello = disegna(128, 128, g => { g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.strokeStyle = "rgba(255,220,140,.7)"; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 38, 0, 7); g.stroke(); });
  TEX.uccello = disegna(64, 32, g => { g.strokeStyle = "#3a2b20"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath(); g.moveTo(4, 10); g.quadraticCurveTo(18, 2, 32, 18); g.quadraticCurveTo(46, 2, 60, 10); g.stroke(); });
  TEX.scia = disegna(256, 64, g => { // la strada d'argento lasciata da una chiocciola
    g.lineCap = "round"; g.lineJoin = "round"; const tr = () => { g.beginPath(); g.moveTo(10, 40); g.bezierCurveTo(60, 10, 90, 58, 140, 34); g.bezierCurveTo(180, 16, 210, 50, 246, 26); };
    g.strokeStyle = "rgba(170,190,205,.55)"; g.lineWidth = 14; tr(); g.stroke(); g.strokeStyle = "rgba(235,245,252,.95)"; g.lineWidth = 6; tr(); g.stroke();
    g.strokeStyle = "rgba(255,255,255,1)"; g.lineWidth = 2; g.setLineDash([6, 14]); tr(); g.stroke(); });
  TEX.farfalla = [["#f6b54a", "#e07a3a"], ["#f4f0e0", "#d9c9a0"], ["#9ec7f0", "#5d8fc9"]].map(([a, b]) => disegna(64, 48, g => { g.fillStyle = a; g.strokeStyle = b; g.lineWidth = 3; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(32 + sx * 14, 18, 13, 11, sx * .5, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(32 + sx * 10, 34, 9, 7, sx * -.4, 0, 7); g.fill(); g.stroke(); } g.fillStyle = "#3a2b20"; g.fillRect(30, 12, 4, 28); }));
}

/* ---------- avvio del motore ---------- */
export async function preparaMondo(storia, avanza = () => {}) {
  M.storia = storia;
  renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: "high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  $("#tela").appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, 1, .05, 100); camera.rotation.order = "YXZ";
  matPano = new THREE.MeshBasicMaterial({side: THREE.BackSide});
  scene.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, HC, 160, 1, true), matPano));
  addEventListener("resize", adatta); adatta();
  textureBase();
  const loader = new THREE.TextureLoader();
  const carica = url => new Promise(ok => loader.load(url, t => { t.encoding = THREE.sRGBEncoding; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); avanza(); ok(t); }, undefined, () => { avanza(); ok(null); }));
  const nomi = Object.keys(storia.LUOGHI);
  const pan = await Promise.all(nomi.map(n => carica(`img/pano-${n}.webp`)));
  nomi.forEach((n, i) => { const t = pan[i]; if (t) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; } TEX[n] = t; });
  await Promise.all(["felce", "ramo", "fiori"].map(async n => TEX["fg-" + n] = await carica(`img/fg-${n}.webp`)));
  await Promise.all(["bip", "mira", "tobia", "nonna-tessa", "pico"].map(async n => SP[n] = await carica(`img/sp-${n}.png`)));
  TEX.broccaMira = await carica("img/brocca-mira.png");
  bip = sprite("bip", .55); bip.center.set(.5, .5); bip.renderOrder = 6; scene.add(bip);
  ascolta();
}
export const nPassiCaricamento = storia => Object.keys(storia.LUOGHI).length + 3 + 5 + 1;
function adatta() {
  if (!renderer) return;
  renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight;
  FOV0 = camera.aspect < .8 ? 100 : camera.aspect < 1.4 ? 92 : 84; camera.fov = FOV0; camera.updateProjectionMatrix();
}

/* ---------- oggetti nella scena ---------- */
export function sprite(nome, alt) {
  const t = SP[nome] || TEX[nome]; const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, alphaTest: .05, depthTest: false}));
  s.scale.set(alt * t.image.width / t.image.height, alt, 1); s.center.set(.5, 0); s.renderOrder = 3; return s;
}
export function aggiungi(o) { scene.add(o); oggetti.push(o); return o; }
export function togli(o) { scene.remove(o); const i = oggetti.indexOf(o); if (i >= 0) oggetti.splice(i, 1); }
export function bagliore(pos, sc, op = .8, tipo = "luce") {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tipo === "fuoco" ? TEX.fuoco : TEX.bagliore, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: op}));
  s.position.copy(pos); s.scale.set(sc, sc, 1); s.renderOrder = 1; s.userData = {tipo, op, f: Math.random() * 10}; return aggiungi(s);
}
export function spriteTex(nomeTex, pos, alt, ud = {}) {
  const t = TEX[nomeTex]; const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false}));
  s.scale.set(alt * t.image.width / t.image.height, alt, 1); s.center.set(.5, 0); s.position.copy(pos); s.renderOrder = 2; s.userData = ud; return aggiungi(s);
}
export function goccia(pos, ud) { const g = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.goccia, transparent: true, depthTest: false})); g.position.copy(pos); g.scale.set(.26, .33, 1); g.renderOrder = 1; g.userData = Object.assign({tipo: "goccia", f: Math.random() * 6}, ud); return aggiungi(g); }

/* ---------- costruire un luogo ---------- */
export function mostraLuogo(id, guardaX, mantieni) {
  const S_ = M.storia, L = S_.LUOGHI[id], cambia = id !== M.qui; M.qui = id; S.visti[id] = true; S.luogo = id;
  matPano.map = TEX[id]; matPano.needsUpdate = true;
  if (!mantieni) { M.yaw = yawDi(guardaX ?? L.guarda); M.pitch = 0; }
  for (const o of oggetti) scene.remove(o); oggetti.length = 0;
  $("#etichette").innerHTML = ""; etichette = [];
  for (const [x, y, s, op, tipo] of L.luci || []) bagliore(punto(x, y, R * .97), s * 1.6, op ?? .75, tipo === "fuoco" ? "fuoco" : "luce");
  for (const p of L.persone || []) { if (p.se && !p.se()) continue; persona(p.chi, p.x, p.y, p.h, p.r ?? .9, p.ombra !== false); }
  S_.extra && S_.extra(id);
  if (L.foglia && !S.foglie[id]) { // la foglia d'oro: grande, con un alone che pulsa e un luccichio ogni tanto
    const pos = punto(L.foglia[0], L.foglia[1], R * .9), fase = Math.random() * 5;
    const alone = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.bagliore, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd060})); alone.position.copy(pos); alone.renderOrder = 3; alone.userData = {tipo: "fogliaAlone", f: fase}; aggiungi(alone);
    const f = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.fogliaOro, transparent: true, depthTest: false})); f.position.copy(pos); f.scale.set(2.6, 2.6, 1); f.renderOrder = 4; f.userData = {tipo: "foglia", f: fase, alone}; aggiungi(f);
    const st = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.stella, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0})); st.position.copy(pos).add(new THREE.Vector3(.35, .6, 0)); st.renderOrder = 5; st.userData = {tipo: "fogliaStella", f: fase}; aggiungi(st); f.userData.stella = st;
    const an = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.anello, transparent: true, depthTest: false, depthWrite: false, opacity: 0, color: 0xffe08a})); an.position.copy(pos); an.renderOrder = 3; an.userData = {tipo: "fogliaAnello", f: fase}; aggiungi(an); f.userData.anello = an;
  }
  for (const [x, y, chi, v, testo, ic] of L.curio || []) { const c = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.bagliore, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0})); c.position.copy(punto(x, y, R * .9)); c.scale.set(.6, .6, 1); c.renderOrder = 4; c.userData = {tipo: "curio", chi, v, testo, chiave: v, f: Math.random() * 20}; aggiungi(c); }
  for (const u of L.uscite) if (!u.se || u.se()) etichetta({tipo: "uscita", testo: u.testo, pos: punto(u.x, u.y), fai: () => cammina(u), chiave: "u-" + u.verso, x: u.x});
  for (const c of L.cose || []) { if (c.se && !c.se()) continue; etichetta({tipo: "cosa", testo: c.testo, pos: punto(c.x, c.y), fai: () => { guardaVerso(c.x); S_.usa(c.id); }, chiave: c.id, x: c.x}); }
  if (bip) bip.visible = !L.senzaBip || S.f.bipLampada === "fuori";
  effetto(L.effetto);
  for (const x of S_.RAGGI[id] || []) { const r = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.raggio, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .18})); r.position.copy(punto(x, 330, R * .85)); r.scale.set(2.4, 10, 1); r.material.rotation = -.38; r.renderOrder = 1; r.userData = {tipo: "raggio", f: Math.random() * 6}; aggiungi(r); }
  for (const [x, y] of (S_.ALATI[id] || {}).farfalle || []) { const f = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.farfalla[Math.floor(Math.random() * 3)], transparent: true, depthTest: false})); f.scale.set(.2, .15, 1); f.renderOrder = 5; f.userData = {tipo: "farfalla", c: punto(x, y, R * .5), f: Math.random() * 10}; aggiungi(f); }
  if ((S_.ALATI[id] || {}).uccelli) prossimiUccelli = 2 + Math.random() * 3;
  for (const [n, x, quota, d, h] of S_.PRIMO[id] || []) {
    const t = TEX["fg-" + n]; if (!t) continue; const dir = punto(x, PH / 2, 1).setY(0).normalize();
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, transparent: true, depthTest: false})); s.scale.set(h * t.image.width / t.image.height, h, 1);
    if (quota === "basso") { s.center.set(.5, 0); s.position.set(dir.x * d, -d * 1.12, dir.z * d); } else { s.center.set(.5, 1); s.position.set(dir.x * d, d * 1.12, dir.z * d); }
    s.renderOrder = 8; s.userData = {tipo: "primo", f: Math.random() * 6, alto: quota === "alto"}; aggiungi(s);
  }
  $("#luogoNome").textContent = L.nome;
  if (cambia) { const l = $("#luogo"); l.classList.remove("cambia"); void l.offsetWidth; l.classList.add("cambia"); }
  suono.ambiente(L.amb, L.ambVol ?? 1);
  S_.aggiornaHud(); salva();
}
export function ridisegna() { const y = M.yaw, p = M.pitch; mostraLuogo(M.qui, undefined, true); M.yaw = y; M.pitch = p; }
function persona(chi, x, y, h, r, ombra) {
  const piede = punto(x, y, R * r), testa = punto(x, y - h, R * r), hh = testa.y - piede.y;
  if (ombra) { const om = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.ombra, transparent: true, depthTest: false})); om.position.copy(piede).add(new THREE.Vector3(0, .02, 0)); om.scale.set(hh * .55, hh * .14, 1); om.renderOrder = 2; aggiungi(om); }
  const s = sprite(chi === "nonna" ? "nonna-tessa" : chi, hh); s.position.copy(piede);
  s.userData = {tipo: "persona", chi, h0: s.scale.y, w0: s.scale.x, y0: piede.y}; aggiungi(s);
  etichetta({tipo: "persona", testo: M.storia.NOMI[chi], pos: testa.clone().add(new THREE.Vector3(0, .1, 0)), fai: () => parlaCon(chi, x), chiave: chi, x});
  return s;
}
export function aggiungiPersona(chi, x, y, h, r = .95) { return persona(chi, x, y, h, r, false); }
function parlaCon(chi, x) { guardaVerso(x); M.storia.parla(chi); }
function effetto(tipo) {
  const n = {foglie: 22, lucciole: 34, pulviscolo: 30, polline: 26}[tipo] || 0;
  for (let k = 0; k < n; k++) {
    const isF = tipo === "foglie";
    const p = new THREE.Sprite(new THREE.SpriteMaterial({map: isF ? TEX.foglia : TEX.bagliore, transparent: true, depthTest: false, depthWrite: false, blending: isF ? THREE.NormalBlending : THREE.AdditiveBlending}));
    const sc = isF ? .16 + Math.random() * .16 : tipo === "lucciole" ? .12 + Math.random() * .1 : .05 + Math.random() * .07;
    p.scale.set(sc, sc, 1); p.renderOrder = 5;
    p.userData = {tipo: "fx", fx: tipo, a: Math.random() * Math.PI * 2, d: 2.5 + Math.random() * 5.5, y0: (Math.random() - .45) * 3.2, v: .3 + Math.random() * .7, f: Math.random() * 10};
    if (tipo === "lucciole") p.material.color.setHex(0xfff2a0);
    aggiungi(p);
  }
}
function etichetta(e) {
  const d = document.createElement("div"); d.className = "et " + e.tipo;
  d.innerHTML = `<span class="cart">${e.testo}</span><span class="anello">${e.tipo === "uscita" ? "➜" : ""}</span>`;
  d.onclick = ev => { ev.stopPropagation(); if (!occupato() && !M.inCammino && !trascinato) { suono.pop(); e.fai(); } };
  $("#etichette").appendChild(d); e.el = d; etichette.push(e);
}
export function aggiornaChiamate() { for (const e of etichette) e.el.classList.toggle("chiama", e.tipo === "persona" && !!M.storia.chiama(e.chiave)); }

/* ---------- guardarsi intorno: dito, mouse, frecce, giroscopio ---------- */
let giu = null, trascinato = false, inerzia = 0, ultimoX = 0, ultimoT = 0;
function ascolta() {
  const tela = renderer.domElement;
  tela.addEventListener("pointerdown", e => { giu = {x: e.clientX, y: e.clientY, yaw: M.yaw, pitch: M.pitch}; trascinato = false; inerzia = 0; ultimoX = e.clientX; ultimoT = performance.now(); M.giaTrascinato = true; });
  addEventListener("pointermove", e => {
    if (!giu || !M.attivo) return; const dx = e.clientX - giu.x, dy = e.clientY - giu.y; if (Math.hypot(dx, dy) > 8) trascinato = true;
    const k = (camera.fov * DEG) / innerHeight, lim = limitePitch();
    M.yaw = giu.yaw + dx * k; M.pitch = Math.max(-lim, Math.min(lim, giu.pitch + dy * k));
    const t = performance.now(); if (t > ultimoT) { inerzia = (e.clientX - ultimoX) * k / ((t - ultimoT) / 1000); ultimoX = e.clientX; ultimoT = t; }
  });
  addEventListener("pointerup", e => { if (giu && !trascinato && e.target === tela) clicca(e.clientX, e.clientY); if (performance.now() - ultimoT > 80) inerzia = 0; giu = null; setTimeout(() => trascinato = false, 0); });
  addEventListener("keydown", e => { if (!M.attivo) return; if (e.code === "ArrowLeft") M.yaw += .09; if (e.code === "ArrowRight") M.yaw -= .09; });
}
const limitePitch = () => Math.max(.02, (106 - camera.fov) / 2 * DEG);
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
function clicca(x, y) {
  if (occupato() || M.inCammino) return;
  mouse.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(oggetti.filter(o => ["persona", "foglia", "curio", "tocca"].includes(o.userData.tipo)));
  if (!hit.length) return;
  const o = hit[0].object, u = o.userData;
  if (u.tipo === "foglia") return M.storia.foglia(o);
  if (u.tipo === "curio") return M.storia.curio(u);
  if (u.tipo === "tocca") return u.fai();
  guardaVerso(xDi(u.chi)); M.storia.parla(u.chi);
}
function xDi(chi) { const e = etichette.find(e => e.chiave === chi); return e ? e.x : null; }

/* giroscopio: come DeviceOrientationControls di three.js, ma sommato al dito */
const giro = {dati: null, prev: null};
const zee = new THREE.Vector3(0, 0, 1), eul = new THREE.Euler(), q = new THREE.Quaternion(), q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5)), e2 = new THREE.Euler();
const suOrient = e => { if (e.alpha != null) giro.dati = e; };
export const giroDisponibile = () => "DeviceOrientationEvent" in window && matchMedia("(pointer: coarse)").matches;
export const giroChiedePermesso = () => typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
export async function attivaGiro() {
  if (!giroDisponibile()) return false;
  if (giroChiedePermesso()) { try { if (await DeviceOrientationEvent.requestPermission() !== "granted") return false; } catch (e) { return false; } }
  addEventListener("deviceorientation", suOrient); giro.prev = null; M.giro = true; return true;
}
export function spegniGiro() { removeEventListener("deviceorientation", suOrient); giro.dati = null; giro.prev = null; M.giro = false; }
function leggiGiro() {
  if (!M.giro || !giro.dati) return;
  const {alpha, beta, gamma} = giro.dati, or = ((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * DEG;
  eul.set(beta * DEG, alpha * DEG, -gamma * DEG, "YXZ"); q.setFromEuler(eul); q.multiply(q1); q.multiply(q0.setFromAxisAngle(zee, -or));
  e2.setFromQuaternion(q, "YXZ");
  if (giro.prev && !giu && !M.inCammino) {
    const dy = angDiff(giro.prev.y, e2.y), dx = e2.x - giro.prev.x;
    if (Math.abs(dy) < .4) M.yaw += dy;
    if (Math.abs(dx) < .4) { const lim = limitePitch(); M.pitch = Math.max(-lim, Math.min(lim, M.pitch + dx)); }
  }
  giro.prev = {y: e2.y, x: e2.x};
}

/* ---------- muoversi ---------- */
export function guardaVerso(x) {
  if (x == null) return; const y0 = M.yaw, d = angDiff(y0, yawDi(x)); if (Math.abs(d) < .3) return; let k = 0;
  const g = () => { k = Math.min(1, k + .05); M.yaw = y0 + d * (1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(g); }; g();
}
export function cammina(u) {
  M.inCammino = true; const y0 = M.yaw, d = angDiff(y0, yawDi(u.x)); let t = 0; const tela = renderer.domElement;
  suono.passi(); $("#etichette").style.opacity = 0;
  const step = () => {
    t += 1 / 48; const k = Math.min(1, t);
    M.yaw = y0 + d * Math.min(1, k * 2.2); M.pitch = Math.sin(k * Math.PI * 4) * .015;
    camera.fov = FOV0 - 38 * k * k; camera.updateProjectionMatrix();
    if (k > .4) tela.classList.add("cammina");
    if (k > .6) $("#lampo").classList.add("on");
    if (k < 1) return requestAnimationFrame(step);
    setTimeout(() => {
      mostraLuogo(u.verso); camera.fov = FOV0 - 22; camera.updateProjectionMatrix(); zoomArrivo = 1;
      $("#lampo").classList.remove("on"); tela.classList.remove("cammina"); $("#etichette").style.opacity = 1; M.inCammino = false;
      const fermo = M.storia.arrivato(u.verso);
      if (viaggio && viaggio.length && !fermo) { const dest = viaggio.shift(); const u2 = M.storia.LUOGHI[M.qui].uscite.find(x => x.verso === dest); if (u2) setTimeout(() => cammina(u2), 300); else viaggio = null; } else viaggio = null;
    }, 140);
  };
  step();
}
export function percorso(da, a) {
  const L = M.storia.LUOGHI, prec = {[da]: null}, coda = [da];
  while (coda.length) { const l = coda.shift(); if (l === a) break; for (const u of L[l].uscite) if ((!u.se || u.se()) && !(u.verso in prec)) { prec[u.verso] = l; coda.push(u.verso); } }
  if (!(a in prec)) return null; const p = []; for (let l = a; l !== da; l = prec[l]) p.unshift(l); return p;
}
export function vaiA(dest) {
  if (dest === M.qui) return; const via = percorso(M.qui, dest); if (!via) return;
  viaggio = via.slice(1); cammina(M.storia.LUOGHI[M.qui].uscite.find(u => u.verso === via[0]));
}

/* ---------- l'onda della voce (per l'eco) ---------- */
export function onda(tipo, attesa, versoX, pareteX) {
  const arrivo = punto(versoX ?? pareteX, PH * .55, R * .85), dur = tipo === "lontano" ? .62 : tipo === "vicino" ? .25 : .5;
  const o = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.anello, transparent: true, depthTest: false, opacity: .9})); o.renderOrder = 6; scene.add(o);
  const da = camera.position.clone().add(new THREE.Vector3(-Math.sin(M.yaw), -.15, -Math.cos(M.yaw)).multiplyScalar(1.5)); let t0 = null;
  const muore = tipo === "muschio" || tipo === "spalle";
  const p = ts => {
    if (t0 === null) t0 = ts + attesa * 1000; const k = Math.max(0, (ts - t0) / 1000 / dur);
    if (muore) { o.position.lerpVectors(da, arrivo, Math.min(1, k)); o.material.opacity = .9 * (1 - k); o.scale.setScalar(.3 + k * .6); }
    else { const qq = k < 1 ? k : 2 - k; o.position.lerpVectors(da, arrivo, Math.max(0, qq)); o.material.opacity = k < 1 ? .9 : .9 * (1 - (k - 1)); o.scale.setScalar(.3 + qq * .9); }
    if (muore ? k < 1 : k < 2) requestAnimationFrame(p); else scene.remove(o);
  };
  requestAnimationFrame(p);
}

/* ---------- entrare e uscire ---------- */
let rafId = 0;
export function entra(luogo, guardaX) { M.attivo = true; adatta(); mostraLuogo(luogo || S.luogo || "piazza", guardaX); if (bip) bip.visible = !M.storia.LUOGHI[M.qui].senzaBip || S.f.bipLampada === "fuori"; cancelAnimationFrame(rafId); orologio.getDelta(); ciclo(); }
export function esci() { M.attivo = false; cancelAnimationFrame(rafId); }
export function zoomIngresso() { camera.fov = FOV0 - 22; camera.updateProjectionMatrix(); zoomArrivo = 1; }

/* ---------- il ciclo ---------- */
const tmp = new THREE.Vector3(), orologio = new THREE.Clock(); let t = 0;
function ciclo() {
  if (!M.attivo) return;
  const dt = Math.min(.05, orologio.getDelta()); t += dt;
  leggiGiro();
  if (!giu && Math.abs(inerzia) > .01) { M.yaw += inerzia * dt; inerzia *= Math.pow(.04, dt); }
  if (zoomArrivo > 0) { zoomArrivo = Math.max(0, zoomArrivo - dt * 1.8); camera.fov = FOV0 - 22 * zoomArrivo * zoomArrivo; camera.updateProjectionMatrix(); }
  camera.rotation.set(M.pitch, M.yaw, 0);
  camera.position.set(-Math.sin(M.yaw) * .45, 0, -Math.cos(M.yaw) * .45);
  const parla = suono.parlando();
  if (bip && bip.visible) {
    const a = M.yaw - .5 * Math.min(1.5, camera.aspect), pb = M.parlante === "bip" && parla;
    bip.position.set(camera.position.x - Math.sin(a) * 2.2, -.6 + Math.sin(t * 2.2) * .045 + M.pitch * 1.8 + (pb ? Math.abs(Math.sin(t * 9)) * .04 : 0), camera.position.z - Math.cos(a) * 2.2);
    bip.material.rotation = Math.sin(t * 1.3) * .05;
  }
  for (const o of oggetti) {
    const u = o.userData;
    if (u.tipo === "persona") {
      const p = M.parlante === u.chi && parla;
      o.scale.y = u.h0 * (1 + Math.sin(t * 2.2 + o.position.x) * .012 + (p ? Math.abs(Math.sin(t * 8.5)) * .025 : 0));
      o.scale.x = u.w0 * (1 - (p ? Math.abs(Math.sin(t * 8.5)) * .012 : 0));
      o.material.rotation = p ? Math.sin(t * 4) * .02 : 0;
      const ph = t % 2.6, chiama = !occupato() && M.storia.chiama(u.chi) && !p; o.position.y = u.y0 + (chiama && ph < .45 ? Math.sin(ph / .45 * Math.PI) * .18 : 0);
    } else if (u.tipo === "luce") o.material.opacity = u.op * (.82 + Math.sin(t * 3 + u.f) * .1 + Math.sin(t * 7.3 + u.f) * .06);
    else if (u.tipo === "fuoco") o.material.opacity = u.op * (.7 + Math.sin(t * 9 + u.f) * .15 + Math.sin(t * 13.7) * .12);
    else if (u.tipo === "primo") o.material.rotation = Math.sin(t * .8 + u.f) * (u.alto ? .025 : .045) + Math.sin(t * 2.1 + u.f) * .01;
    else if (u.tipo === "curio") o.material.opacity = Math.pow(Math.max(0, Math.sin(t * .9 + u.f)), 14) * .9 * (S.curio[u.chiave] ? 0 : 1);
    else if (u.tipo === "raggio") o.material.opacity = .12 + Math.sin(t * .5 + u.f) * .07;
    else if (u.tipo === "farfalla") { o.position.set(u.c.x + Math.sin(t * .7 + u.f) * .9, u.c.y + Math.sin(t * 1.3 + u.f) * .25, u.c.z + Math.cos(t * .5 + u.f) * .9); o.scale.x = .2 * (.25 + .75 * Math.abs(Math.sin(t * 14 + u.f))); }
    else if (u.tipo === "uccello") { u.k += dt / u.dur; o.position.lerpVectors(u.da, u.a, Math.max(0, u.k)); o.position.y += Math.sin(Math.max(0, u.k) * Math.PI) * .4; o.scale.y = u.s * (.35 + .65 * Math.abs(Math.sin(t * 10 + u.f))); if (u.k >= 1) { scene.remove(o); u.morto = true; } }
    else if (u.tipo === "goccia") o.material.opacity = .75 + Math.sin(t * 2 + u.f) * .25;
    else if (u.tipo === "foglia") { o.material.rotation = Math.sin(t * 1.5 + u.f) * .3; o.scale.setScalar(2.6 + Math.sin(t * 3 + u.f) * .18); o.position.y = (u.y0 ??= o.position.y) + Math.abs(Math.sin(t * 1.6 + u.f)) * .15; }
    else if (u.tipo === "fogliaAlone") { o.scale.setScalar(5 + Math.sin(t * 2.4 + u.f) * .9); o.material.opacity = .75 + Math.sin(t * 2.4 + u.f) * .25; }
    else if (u.tipo === "fogliaAnello") { const k = (t / 2.8 + u.f) % 1; o.scale.setScalar(1.5 + k * 5.5); o.material.opacity = (1 - k) * .85; }
    else if (u.tipo === "fogliaStella") { const k = (t * .45 + u.f) % 1; o.material.opacity = k < .18 ? Math.sin(k / .18 * Math.PI) : 0; o.scale.setScalar(.6 + (k < .18 ? Math.sin(k / .18 * Math.PI) * 1.4 : 0)); o.material.rotation = t * 2; }
    else if (u.tipo === "fx") {
      if (u.fx === "foglie") { u.a -= dt * .12 * u.v; o.position.set(Math.sin(u.a) * u.d, u.y0 + Math.sin(t * u.v * 2 + u.f) * .25, Math.cos(u.a) * u.d); o.material.rotation = t * u.v * 3 + u.f; }
      else if (u.fx === "lucciole") { u.a += dt * .03 * Math.sin(u.f + t * .2); o.position.set(Math.sin(u.a) * u.d, u.y0 - .5 + Math.sin(t * u.v + u.f) * .35, Math.cos(u.a) * u.d); o.material.opacity = Math.max(0, Math.sin(t * u.v * 2 + u.f)) * .9; }
      else { u.a += dt * .01 * u.v; o.position.set(Math.sin(u.a) * u.d, u.y0 + Math.sin(t * u.v * .7 + u.f) * .4, Math.cos(u.a) * u.d); o.material.opacity = .18 + Math.sin(t * u.v * 1.5 + u.f) * .14; }
    }
    if (u.anima) u.anima(o, t, dt);
  }
  if ((M.storia.ALATI[M.qui] || {}).uccelli && (prossimiUccelli -= dt) <= 0) {
    prossimiUccelli = 9 + Math.random() * 8; const x0 = Math.random() * PW, dz = Math.random() < .5 ? -1 : 1;
    for (let k = 0; k < 3; k++) { const b = new THREE.Sprite(new THREE.SpriteMaterial({map: TEX.uccello, transparent: true, depthTest: false})); const s = .22 - k * .03; b.scale.set(s * 2, s, 1); b.renderOrder = 4; const y = 180 + Math.random() * 120 + k * 30;
      b.userData = {tipo: "uccello", da: punto(x0 + k * 40 * dz, y, R * .8), a: punto(x0 + dz * 1100 + k * 40 * dz, y - 60, R * .8), k: -k * .03, dur: 7 + Math.random() * 2, s, f: k}; aggiungi(b); }
  }
  for (let i = oggetti.length - 1; i >= 0; i--) if (oggetti[i].userData.morto) oggetti.splice(i, 1);
  for (const e of etichette) {
    tmp.copy(e.pos).project(camera);
    const x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight;
    if (tmp.z > 1 || x < -120 || x > innerWidth + 120) { e.el.style.display = "none"; continue; }
    e.el.style.display = ""; e.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
  }
  M.storia.ogniFotogramma && M.storia.ogniFotogramma(dt);
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(ciclo);
}
