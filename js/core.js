/* Alberalto · nucleo dell'app: salvataggio, suoni, dialoghi, piccoli aiuti */
"use strict";
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const aspetta = ms => new Promise(r => setTimeout(r, ms));
export const mescola = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
export const NOMI = {leo: "Leo", nonna: "Nonna Tessa", mira: "Mira", tobia: "Tobia", bip: "Bip", pico: "Pico"};
export const AV = {leo: "leo", nonna: "nonna-tessa", mira: "mira", tobia: "tobia", bip: "bip", pico: "pico"};
export const TOUCH = matchMedia("(pointer: coarse)").matches;

/* ======================== salvataggio (solo sul dispositivo) ======================== */
const CHIAVE = "alberalto-app-v1";
const BASE = () => ({f: {}, foglie: {}, curio: {}, visti: {}, scoperte: [], luogo: "piazza",
  imp: {musica: .8, voci: 1, effetti: .9, giro: null}});
export let S = BASE();
export function caricaPartita() {
  try { const d = JSON.parse(localStorage.getItem(CHIAVE) || "null"); if (d && d.f) { const b = BASE(); S = Object.assign(b, d, {imp: Object.assign(b.imp, d.imp || {})}); } } catch (e) {}
  return S;
}
export function salva() { try { localStorage.setItem(CHIAVE, JSON.stringify(S)); } catch (e) {} }
export function azzera() { const imp = S.imp; S = BASE(); S.imp = imp; salva(); }
export const faroN = () => S.scoperte.length;

/* ======================== suoni (Web Audio: funziona anche su iPhone) ======================== */
export const suono = (() => {
  let ctx = null, master, gMus, gAmb, gVoce, gFx, musEl = null;
  const amb = {}, buf = {}, attesa = {};
  let voceSrc = null, voceTok = 0, parlaFino = 0, ambTarget = {}, ducking = false;
  const T = () => ctx ? ctx.currentTime : 0;
  function init() {
    if (ctx) { if (ctx.state !== "running") ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    gMus = ctx.createGain(); gMus.gain.value = 0; gMus.connect(master);
    gAmb = ctx.createGain(); gAmb.connect(master);
    gVoce = ctx.createGain(); gVoce.connect(master);
    gFx = ctx.createGain(); gFx.connect(master);
    musEl = elemento("audio/musica.mp3", gMus);
    for (const n of ["borgo", "vento", "casa"]) { const g = ctx.createGain(); g.gain.value = 0; g.connect(gAmb); amb[n] = {el: elemento(`audio/amb-${n}.mp3`, g), g}; }
    // sblocca l'audio su iOS con un suono muto
    const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
    volumi();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { ctx.suspend(); musEl.pause(); for (const a of Object.values(amb)) a.el.pause(); }
      else { ctx.resume(); musEl.play().catch(() => {}); for (const a of Object.values(amb)) a.el.play().catch(() => {}); }
    });
  }
  function elemento(src, g) {
    const a = new Audio(src); a.loop = true; a.preload = "auto";
    try { ctx.createMediaElementSource(a).connect(g); } catch (e) {}
    a.play().catch(() => {}); return a;
  }
  function volumi() {
    if (!ctx) return; const t = T();
    gMus.gain.setTargetAtTime(S.imp.musica * .32 * (ducking ? .4 : 1), t, .25);
    gAmb.gain.setTargetAtTime(S.imp.effetti, t, .2);
    gVoce.gain.setTargetAtTime(Math.min(1.4, S.imp.voci * 1.15), t, .05);
    gFx.gain.setTargetAtTime(S.imp.effetti, t, .05);
  }
  function ambiente(nome, v = 1) {
    if (!ctx) { ambTarget = {nome, v}; return; }
    for (const [k, a] of Object.entries(amb)) a.g.gain.setTargetAtTime(k === nome ? .6 * v : 0, T(), .8);
  }
  function carica(id) {
    if (buf[id] !== undefined) return Promise.resolve(buf[id]);
    if (!ctx) return Promise.resolve(null);
    if (attesa[id]) return attesa[id];
    return attesa[id] = fetch(`audio/${id}.mp3`).then(r => r.arrayBuffer())
      .then(ab => new Promise((ok, ko) => ctx.decodeAudioData(ab, ok, ko)))
      .then(b => buf[id] = b).catch(() => buf[id] = null);
  }
  function fermaVoce() { voceTok++; if (voceSrc) { try { voceSrc.onended = null; voceSrc.stop(); } catch (e) {} voceSrc = null; } parlaFino = 0; ducking = false; volumi(); }
  /* fa parlare un personaggio; risolve con la durata (0 se non c'è voce) e chiama fine() alla fine */
  async function voce(id, fine) {
    fermaVoce(); const tok = voceTok;
    if (!id || !ctx || S.imp.voci <= 0) { fine && setTimeout(fine, 10); return 0; }
    const b = await carica(id);
    if (tok !== voceTok) return 0;
    if (!b) { fine && setTimeout(fine, 10); return 0; }
    const s = ctx.createBufferSource(); s.buffer = b; s.connect(gVoce); s.start();
    voceSrc = s; parlaFino = T() + b.duration; ducking = true; volumi();
    s.onended = () => { if (voceSrc === s) { voceSrc = null; ducking = false; volumi(); } fine && fine(); };
    return b.duration;
  }
  const parlando = () => !!ctx && T() < parlaFino;
  /* la stessa voce che torna indietro, più piano e ovattata (l'eco) */
  async function eco(id, ritardi) {
    if (!ctx) return; const b = await carica(id); if (!b) return;
    for (const [dl, g] of ritardi) {
      const s = ctx.createBufferSource(); s.buffer = b;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2000;
      const gn = ctx.createGain(); gn.gain.value = g; s.connect(f).connect(gn).connect(gVoce); s.start(T() + Math.max(0, dl));
    }
  }
  function nota(fr, dl, dur, v, tipo = "sine") {
    if (!ctx) return; const t0 = T() + dl, o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo; o.frequency.value = fr;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + .015); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g).connect(gFx); o.start(t0); o.stop(t0 + dur + .05);
  }
  function rumore(dur, freq, v, dl = 0, tipo = "lowpass", q = 1) {
    if (!ctx) return; const t0 = T() + dl, n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = v; s.connect(f).connect(g).connect(gFx); s.start(t0);
  }
  return {
    init, ambiente, voce, fermaVoce, parlando, eco, carica, volumi,
    get pronto() { return !!ctx; },
    durata: id => buf[id] ? buf[id].duration : 0,
    passo: (dl = 0) => rumore(.12, 700 + Math.random() * 300, .5, dl),
    passi: () => [0, .3, .6, .9].forEach(k => rumore(.12, 700 + Math.random() * 300, .5, k)),
    pop: () => { nota(660, 0, .12, .18, "triangle"); nota(990, .05, .14, .12, "triangle"); },
    tic: () => nota(1400, 0, .05, .08, "square"),
    tintinnio: () => [[1568, 0], [2093, .09], [2637, .18]].forEach(([f, d]) => nota(f, d, .55, .13)),
    campanella: () => [[880, .18, 0], [1320, .12, .12], [1760, .09, .24], [2640, .05, .36]].forEach(([f, v, d]) => nota(f, d, 2.6, v)),
    fanfara: () => [[523, 0], [659, .12], [784, .24], [1047, .4], [1319, .55]].forEach(([f, d]) => { nota(f, d, .9, .12, "triangle"); nota(f * 2, d, .5, .04); }),
    soffio: (v = .25) => rumore(.6, 900, v, 0, "bandpass", .7),
    sbaglio: () => { nota(330, 0, .18, .12, "triangle"); nota(262, .12, .25, .12, "triangle"); }
  };
})();

/* ======================== finestre, dialoghi, premi ======================== */
let modali = 0;
export const occupato = () => modali > 0;
export function apriModale() { modali++; document.body.classList.add("modale"); }
export function chiudiModale() { modali = Math.max(0, modali - 1); if (!modali) document.body.classList.remove("modale"); }

/* battute: [chi, testo, voce, didascalia, azione] — tocca per avanzare */
export function dialogo(battute, opz = {}) {
  return new Promise(fine => {
    apriModale(); const d = $("#dialogo"); let i = 0;
    d.classList.toggle("alto", !!opz.alto);
    const mostra = async () => {
      const [chi, testo, v, didasc, azione] = battute[i];
      d.innerHTML = `<div class="box"><div class="parla"><div class="avatar" style="background-image:url(img/av-${AV[chi]}.webp)"></div><div style="flex:1;min-width:0"><div class="nome">${NOMI[chi]}</div><div class="testo"></div>${didasc ? `<div class="didascalia">${didasc}</div>` : ""}</div></div><div class="avanti">▸</div></div>`;
      d.classList.add("on");
      const av = $(".avatar", d), tx = $(".testo", d), fr = $(".avanti", d);
      if (azione) azione();
      opz.parla && opz.parla(chi);
      let scritto = 0, finito = false, tok = {};
      mostra.tok = tok;
      const completa = () => { finito = true; tx.textContent = testo; fr.classList.add("on"); };
      const durata = v ? await Promise.race([suono.voce(v, () => { av.classList.remove("parlando"); opz.parla && opz.parla(null); }), aspetta(900).then(() => 0)]) : (suono.fermaVoce(), 0);
      if (mostra.tok !== tok) return;
      if (v && suono.parlando()) av.classList.add("parlando");
      const ms = Math.max(18, Math.min(45, ((durata || suono.durata(v) || testo.length * .045) * 1000 * .85) / testo.length));
      const scrivi = () => { if (finito || mostra.tok !== tok) return; scritto++; tx.textContent = testo.slice(0, scritto); if (scritto >= testo.length) completa(); else setTimeout(scrivi, ms); };
      scrivi();
      $(".box", d).onclick = () => {
        if (!finito) return completa();
        mostra.tok = null; i++;
        if (i < battute.length) mostra();
        else { suono.fermaVoce(); d.classList.remove("on"); opz.parla && opz.parla(null); chiudiModale(); fine(); }
      };
    };
    mostra();
  });
}
/* domanda a scelta: risolve con il valore scelto */
export function domanda(chi, testo, v, opzioni) {
  return new Promise(fine => {
    apriModale(); const d = $("#dialogo"); d.classList.remove("alto");
    d.innerHTML = `<div class="box"><div class="parla"><div class="avatar parlando" style="background-image:url(img/av-${AV[chi]}.webp)"></div><div><div class="nome">${NOMI[chi]}</div><div class="testo">${testo}</div></div></div>${opzioni.map((o, k) => `<button class="scelta" data-k="${k}">${o[0]}</button>`).join("")}</div>`;
    d.classList.add("on");
    suono.voce(v, () => $(".avatar", d)?.classList.remove("parlando"));
    $$(".scelta", d).forEach(b => b.onclick = () => {
      const val = opzioni[+b.dataset.k][1];
      b.classList.add(val === "giusta" ? "giusta" : "sbagliata");
      setTimeout(() => { suono.fermaVoce(); d.classList.remove("on"); chiudiModale(); fine(val); }, val === "giusta" ? 450 : 350);
    });
  });
}
export function toast(t, ms = 2400) { const e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove("on"), ms); }
export function premio(ic, titolo, testo, bottone = "Evviva! ▸") {
  return new Promise(fine => {
    apriModale(); const p = $("#premio");
    p.innerHTML = `<div class="box"><span class="ic">${ic}</span><h2>${titolo}</h2><p>${testo}</p><div class="azioni" style="justify-content:center"><button class="btn verde">${bottone}</button></div></div>`;
    p.classList.add("on"); suono.fanfara(); coriandoli();
    $(".btn", p).onclick = () => { suono.pop(); p.classList.remove("on"); chiudiModale(); fine(); };
  });
}
export function lampo(ms = 500) { const l = $("#lampo"); l.classList.add("on"); setTimeout(() => l.classList.remove("on"), ms); }

/* coriandoli dorati e foglioline */
export function coriandoli(x = innerWidth / 2, y = innerHeight * .45, n = 90) {
  const c = $("#coriandoli"), g = c.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const col = ["#f2b33d", "#ffe08a", "#b8652f", "#8fb345", "#5d7a3a", "#7fb6dc", "#fff"];
  const P = Array.from({length: n}, () => { const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9; return {x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, s: 5 + Math.random() * 7, c: col[Math.floor(Math.random() * col.length)], f: Math.random() < .35}; });
  let t = 0; cancelAnimationFrame(coriandoli.h);
  const passo = () => {
    g.clearRect(0, 0, innerWidth, innerHeight); t++;
    for (const p of P) {
      p.vy += .25; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - t / 140); g.fillStyle = p.c;
      if (p.f) { g.beginPath(); g.ellipse(0, 0, p.s, p.s * .45, 0, 0, 7); g.fill(); } else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      g.restore();
    }
    if (t < 140) coriandoli.h = requestAnimationFrame(passo); else g.clearRect(0, 0, innerWidth, innerHeight);
  };
  passo();
}

/* finestra con intestazione: restituisce l'elemento .corpo */
export function finestra(id, titolo, html, opz = {}) {
  const f = $("#" + id); apriModale();
  f.innerHTML = `<div class="foglio" style="${opz.largo ? "width:min(97vw,900px)" : ""}"><header><span>${titolo}</span>${opz.schede || ""}<button class="chiudi" aria-label="Chiudi">✕</button></header><div class="corpo">${html}</div></div>`;
  f.classList.add("on");
  const chiudi = () => { if (!f.classList.contains("on")) return; f.classList.remove("on"); chiudiModale(); suono.pop(); opz.chiusa && opz.chiusa(); };
  $(".chiudi", f).onclick = chiudi;
  f.onclick = e => { if (e.target === f) chiudi(); };
  f.chiudi = chiudi;
  return f;
}

/* cancello per i grandi: tenere premuto 3 secondi */
export function cancelloGrandi() {
  return new Promise(fine => {
    const f = finestra("finGrandi", "Per i grandi", `<div class="cancello"><div style="font-size:17px">Questa parte è per mamma, papà e insegnanti.<br><b>Tieni premuto</b> il cerchio per 3 secondi.</div><button class="tieni" id="tieni"><span>🔒</span></button></div>`, {chiusa: () => fine(false)});
    const b = $("#tieni"); let t0 = 0, h = 0;
    const giu = e => { e.preventDefault(); t0 = performance.now(); const passo = () => { const p = Math.min(1, (performance.now() - t0) / 3000); b.style.setProperty("--p", p * 100 + "%"); if (p >= 1) { suono.tintinnio(); f.classList.remove("on"); chiudiModale(); fine(true); return; } h = requestAnimationFrame(passo); }; passo(); };
    const su = () => { cancelAnimationFrame(h); b.style.setProperty("--p", "0%"); };
    b.addEventListener("pointerdown", giu); b.addEventListener("pointerup", su); b.addEventListener("pointerleave", su); b.addEventListener("pointercancel", su);
  });
}

/* cambio di schermo */
export function schermo(id) {
  for (const s of $$(".schermo")) s.classList.toggle("on", s.id === id);
  document.body.dataset.schermo = id;
  document.body.classList.toggle("serve-orizz", id === "borgo" || document.body.classList.contains("in-lab"));
}
