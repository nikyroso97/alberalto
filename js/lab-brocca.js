/* Alberalto · il laboratorio di Bip: perché la brocca di terracotta resta fresca.
   Una piccola simulazione: l'acqua trasuda dai pori, evapora (più con vento e aria secca)
   e porta via calore all'acqua dentro. La brocca smaltata non trasuda e resta tiepida. */
"use strict";
import {$, $$, suono, apriModale, chiudiModale, coriandoli} from "./core.js";

const TAMB = 30;               // °C dell'aria (giornata calda)
const A = .35, B = 4.8;         // dT/dt = A·(TAMB − T) − B·evaporazione
const caricaImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

export function apriLabBrocca() {
  return new Promise(async fine => {
    const lab = $("#lab"); apriModale(); document.body.classList.add("in-lab", "serve-orizz");
    lab.innerHTML = `<canvas></canvas>
      <div class="lab-alto"><div class="bipdice"><div class="avatar" style="background-image:url(img/av-bip.webp)"></div><div class="t" id="bipT"></div></div>
        <div class="compiti" style="margin-right:52px"><div class="compito" data-c="vento">Porta le brocche al vento</div><div class="compito" data-c="smalto">Guarda la brocca di Mira</div><div class="compito" data-c="umida">Prova con l'aria appiccicosa</div></div></div>
      <button class="tondo piccolo esci" id="labEsci" aria-label="Esci">✕</button>
      <div class="lab-basso"><div class="gruppoC">
        <div class="interr" id="iPosto"><button data-v="arco">🌬️ All'Arco</button><button data-v="casa" class="on">🏠 In casa</button></div>
        <div class="interr blu" id="iAria"><button data-v="secca" class="on">☀️ Aria secca</button><button data-v="umida">💧 Appiccicosa</button></div></div>
        <button class="btn verde" id="labCapito" disabled>Ho capito! ▸</button></div>`;
    lab.classList.add("on");
    const cv = $("canvas", lab), g = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1;
    const adatta = () => { dpr = Math.min(2, devicePixelRatio || 1); W = lab.clientWidth; H = lab.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); disponi(); };
    const st = {posto: "casa", aria: "secca", raffica: 0, t: 0, cambio: 0, fatti: {}, detti: {}, vuoto: 0};
    const brocche = [{tipo: "terracotta", T: TAMB, Tp: TAMB, bagno: 0, gocce: [], acqua: [], tocco: 0, nome: "Terracotta"}, {tipo: "smaltata", T: TAMB, Tp: TAMB, bagno: 0, gocce: [], acqua: [], tocco: 0, nome: "La brocca di Mira"}];
    const vapori = [], strisce = [], foglie = [], aria = [];
    let s = 1, trave = 0;
    function disponi() {
      const h = Math.min(H * .4, W * .22 * 166 / 132); s = h / 166; trave = H * .19;
      brocche[0].x = W * .32; brocche[1].x = W * .64;
      for (const b of brocche) {
        b.y = H * .3; // bocca della brocca
        b.gocce = []; b.acqua = [];
        if (b.tipo === "terracotta") for (let k = 0; k < 34; k++) { const p = puntoSuperficie(); b.gocce.push({x: p[0], y: p[1], r: 0, max: 2.2 + Math.random() * 2.4, f: Math.random() * 6}); }
        for (let k = 0; k < 26; k++) b.acqua.push({x: (Math.random() - .5) * 60, y: 75 + Math.random() * 70, a: Math.random() * 7, v: 1});
      }
    }
    // un punto a caso sul corpo della brocca (coordinate locali, bocca in 0,0)
    function puntoSuperficie() { for (;;) { const y = 30 + Math.random() * 128, w = larghezza(y); const x = (Math.random() * 2 - 1) * w * .92; if (Math.abs(x) > w * .35 || y < 55 || y > 150) return [x, y]; } }
    function larghezza(y) { if (y < 18) return 30; if (y < 110) return 26 + (66 - 26) * Math.sin((y - 18) / 92 * Math.PI / 2); return 66 * Math.cos((y - 110) / 56 * Math.PI / 2) + 2; }
    function corpo(b) {
      g.beginPath(); g.moveTo(-32, 0); g.quadraticCurveTo(-38, 10, -26, 18); g.quadraticCurveTo(-74, 48, -66, 110); g.quadraticCurveTo(-58, 162, 0, 166);
      g.quadraticCurveTo(58, 162, 66, 110); g.quadraticCurveTo(74, 48, 26, 18); g.quadraticCurveTo(38, 10, 32, 0); g.closePath();
    }
    const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
    const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
    const coloreT = T => { const k = Math.max(0, Math.min(1, (TAMB - T) / 12)); return mix([240, 138, 60], [74, 155, 224], k); };

    /* ---------- disegno ---------- */
    function sfondo() {
      const arco = st.posto === "arco", umida = st.aria === "umida";
      if (arco) {
        let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, umida ? "#c9d3d6" : "#9fd0f0"); gr.addColorStop(.62, umida ? "#e5e4da" : "#f7ead0"); gr.addColorStop(.63, "#a9c46b"); gr.addColorStop(1, "#6f9440"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = umida ? "rgba(140,160,150,.55)" : "rgba(110,150,110,.6)"; g.beginPath(); g.moveTo(0, H * .63); for (let x = 0; x <= W; x += 20) g.lineTo(x, H * .55 + Math.sin(x / 90) * 18 + Math.sin(x / 37) * 6); g.lineTo(W, H * .63); g.fill();
        if (!umida) { const sx = W * .9, sy = H * .14; const sg = g.createRadialGradient(sx, sy, 4, sx, sy, 90); sg.addColorStop(0, "rgba(255,250,210,1)"); sg.addColorStop(.3, "rgba(255,226,130,.7)"); sg.addColorStop(1, "rgba(255,220,120,0)"); g.fillStyle = sg; g.fillRect(sx - 90, sy - 90, 180, 180); }
        // l'arco di legno
        g.fillStyle = "#7a4f2b"; g.fillRect(W * .12, trave - 12, W * .76, 20); g.fillStyle = "#5c3a1f"; g.fillRect(W * .12, trave + 6, W * .76, 4);
        g.fillRect(W * .12, trave - 12, 18, H); g.fillRect(W * .88 - 18, trave - 12, 18, H);
        g.fillStyle = "#6d9a3c"; for (let x = W * .14; x < W * .86; x += 26) { g.beginPath(); g.ellipse(x, trave - 12 + Math.sin(x) * 3, 12, 7, Math.sin(x * 3) * .6, 0, 7); g.fill(); }
      } else {
        g.fillStyle = "#efd6aa"; g.fillRect(0, 0, W, H);
        g.strokeStyle = "rgba(160,110,60,.18)"; g.lineWidth = 2; for (let y = 30; y < H * .7; y += 36) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        g.fillStyle = "#b07a45"; g.fillRect(0, H * .72, W, H * .28); g.fillStyle = "rgba(0,0,0,.08)"; for (let x = 0; x < W; x += 70) g.fillRect(x, H * .72, 3, H * .28);
        const fx = W * .86, fy = H * .14, fw = W * .1, fh = H * .3;
        g.fillStyle = umida ? "#c9d3d6" : "#bfe3f7"; g.fillRect(fx - fw / 2, fy, fw, fh); g.strokeStyle = "#7a4f2b"; g.lineWidth = 6; g.strokeRect(fx - fw / 2, fy, fw, fh); g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy + fh); g.moveTo(fx - fw / 2, fy + fh / 2); g.lineTo(fx + fw / 2, fy + fh / 2); g.stroke();
        g.fillStyle = "#c95a3c"; g.beginPath(); g.moveTo(fx - fw / 2 - 10, fy - 6); g.quadraticCurveTo(fx - fw / 2 + 6, fy + fh / 2, fx - fw / 2 - 4, fy + fh + 8); g.lineTo(fx - fw / 2 - 18, fy + fh + 8); g.lineTo(fx - fw / 2 - 18, fy - 6); g.fill();
        g.fillStyle = "#7a4f2b"; g.fillRect(W * .12, trave - 8, W * .7, 14);
      }
      if (umida) { g.fillStyle = "rgba(235,240,240,.32)"; g.fillRect(0, 0, W, H); }
    }
    function disegnaBrocca(b) {
      g.save(); g.translate(b.x, b.y); g.scale(s, s);
      g.strokeStyle = "#5c3a1f"; g.lineWidth = 2.5 / s * 1.4; g.beginPath(); g.moveTo(-26, 4); g.lineTo(-12, (trave - b.y) / s + 4); g.moveTo(26, 4); g.lineTo(12, (trave - b.y) / s + 4); g.stroke();
      g.save(); g.translate(8, 6); g.scale(1, 1); g.globalAlpha = .18; g.fillStyle = "#000"; corpo(b); g.fill(); g.restore();
      corpo(b);
      if (b.tipo === "terracotta") {
        const gr = g.createLinearGradient(-70, 0, 70, 0); gr.addColorStop(0, "#9a4f22"); gr.addColorStop(.35, "#d07a3f"); gr.addColorStop(1, "#8a4520"); g.fillStyle = gr; g.fill();
        g.lineWidth = 3; g.strokeStyle = "#6e3514"; g.stroke();
        g.save(); corpo(b); g.clip(); g.fillStyle = "rgba(80,35,10,.35)"; for (let k = 0; k < 120; k++) { const px = ((k * 37) % 140) - 70, py = 20 + ((k * 53) % 146); g.fillRect(px, py, 1.6, 1.6); } // i buchini
        g.fillStyle = `rgba(60,30,10,${.25 * b.bagno})`; g.fillRect(-80, 0, 160, 170); g.restore();
      } else {
        const gr = g.createLinearGradient(-70, 0, 70, 0); gr.addColorStop(0, "#d9c79c"); gr.addColorStop(.4, "#fbf0d2"); gr.addColorStop(1, "#cdb98c"); g.fillStyle = gr; g.fill();
        g.lineWidth = 4.5; g.strokeStyle = "#2f7f8f"; g.stroke();
        g.save(); corpo(b); g.clip(); g.strokeStyle = "#d0453a"; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, 70); g.quadraticCurveTo(0, 44, 50, 70); g.moveTo(-58, 125); g.quadraticCurveTo(0, 150, 58, 125); g.stroke();
        g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.ellipse(-36, 70, 7, 30, -.25, 0, 7); g.fill(); g.restore();
      }
      // finestrella per guardare l'acqua dentro
      g.save(); g.beginPath(); g.ellipse(0, 110, 38, 38, 0, 0, 7); g.fillStyle = rgb(mix(coloreT(b.T), [200, 225, 240], .45)); g.fill(); g.clip();
      for (const p of b.acqua) { g.fillStyle = rgb(coloreT(b.T)); g.beginPath(); g.arc(p.x, p.y, 3.2, 0, 7); g.fill(); }
      g.restore();
      g.beginPath(); g.ellipse(0, 110, 38, 38, 0, 0, 7); g.lineWidth = 3.5; g.strokeStyle = "rgba(255,255,255,.85)"; g.setLineDash([6, 5]); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#4a2c16"; g.globalAlpha = .55; g.beginPath(); g.ellipse(0, 2, 30, 7, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      // goccioline sulla terracotta
      for (const d of b.gocce) { if (d.r < .4) continue; if (Math.hypot(d.x, d.y - 110) < 40) continue; g.fillStyle = "rgba(205,234,250,.95)"; g.strokeStyle = "rgba(70,130,175,.9)"; g.lineWidth = .9; g.beginPath(); g.ellipse(d.x, d.y, d.r * .8, d.r, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(d.x - d.r * .3, d.y - d.r * .35, d.r * .25, 0, 7); g.fill(); }
      if (b.evidenzia > 0) { g.globalAlpha = Math.min(1, b.evidenzia) * (.5 + .5 * Math.sin(st.t * 6)); g.lineWidth = 6; g.strokeStyle = "#f2b33d"; corpo(b); g.stroke(); g.globalAlpha = 1; }
      g.restore();
      // termometro
      const tx = b.x + 86 * s, ty = b.y + 30 * s, th = 120 * s, k = Math.max(0, Math.min(1, (b.T - 14) / 18));
      g.fillStyle = "rgba(255,255,255,.92)"; arrot(tx - 13, ty - 8, 26, th + 30, 13); g.fill(); g.strokeStyle = "#7a6a55"; g.lineWidth = 2; g.stroke();
      g.fillStyle = rgb(coloreT(b.T)); arrot(tx - 5, ty + th * (1 - k), 10, th * k + 4, 5); g.fill(); g.beginPath(); g.arc(tx, ty + th + 10, 10, 0, 7); g.fill();
      g.font = `700 ${Math.round(15 * Math.max(.85, s))}px Fredoka, sans-serif`; g.textAlign = "center"; g.fillStyle = "#3a2b20";
      g.fillText(`${b.T.toFixed(0)}°`, tx, ty - 14);
      g.font = `${Math.round(24 * Math.max(.8, s))}px sans-serif`; g.fillText(faccia(b.T), tx + 34 * Math.max(.85, s), ty + 6);
      // nome
      g.font = `600 ${Math.round(16 * Math.max(.85, s))}px Fredoka, sans-serif`; g.fillStyle = "rgba(251,244,227,.92)"; const tw = g.measureText(b.nome).width + 20; arrot(b.x - tw / 2, b.y + 172 * s, tw, 26, 13); g.fill(); g.fillStyle = "#3a2b20"; g.fillText(b.nome, b.x, b.y + 172 * s + 18);
      // la mano che tocca
      if (b.tocco > 0) { g.globalAlpha = Math.min(1, b.tocco); g.font = "40px sans-serif"; g.fillText("👋", b.x, b.y + 110 * s + 14); g.font = `700 ${Math.round(18 * Math.max(.85, s))}px Fredoka, sans-serif`; const txt = parola(b.T); const w2 = g.measureText(txt).width + 24; g.fillStyle = "#fff3cf"; arrot(b.x - w2 / 2, b.y + 46 * s - (1 - b.tocco) * 30, w2, 30, 15); g.fill(); g.fillStyle = "#3a2b20"; g.fillText(txt, b.x, b.y + 46 * s + 21 - (1 - b.tocco) * 30); g.globalAlpha = 1; }
    }
    const faccia = T => T < 21 ? "🥶" : T < 25 ? "😊" : T < 28 ? "🙂" : "😐";
    const parola = T => T < 21 ? "Brrr, freschissima!" : T < 25 ? "Fresca!" : T < 28 ? "Un po' fresca" : "Tiepida…";
    function arrot(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

    /* ---------- simulazione ---------- */
    const vento = () => (st.posto === "arco" ? .8 + .2 * Math.sin(st.t * .9) : 0) + st.raffica;
    const umidita = () => st.aria === "secca" ? .2 : .8;
    function aggiorna(dt) {
      st.t += dt; st.raffica = Math.max(0, st.raffica - dt * .8);
      const v = Math.min(1.3, vento()), u = umidita();
      for (const b of brocche) {
        b.Tp = b.T;
        let E = 0;
        if (b.tipo === "terracotta") { b.bagno = Math.min(1, b.bagno + dt * .6); E = b.bagno * (.3 + .7 * Math.min(1, v)) * (1 - u); }
        b.T += (A * (TAMB - b.T) - B * E) * dt;
        b.dT = (b.T - b.Tp) / dt;
        const vel = 10 + Math.max(0, b.T - 12) * 5;
        for (const p of b.acqua) { p.a += (Math.random() - .5) * 3 * dt; p.x += Math.cos(p.a) * vel * dt; p.y += Math.sin(p.a) * vel * dt; if (Math.hypot(p.x, p.y - 110) > 34) { p.a += Math.PI; p.x *= .95; p.y = 110 + (p.y - 110) * .95; } }
        for (const d of b.gocce) {
          if (d.r < d.max) d.r += dt * 1.4 * b.bagno;
          if (d.r > 1.5 && Math.random() < E * dt * .9) { // la gocciolina vola via e porta con sé un pezzetto di caldo
            vapori.push({x: b.x + d.x * s, y: b.y + d.y * s, vx: (30 + 150 * v) * (st.posto === "arco" ? 1 : .2), vy: -20 - Math.random() * 25, t: 0, vita: 2.2 + Math.random(), f: Math.random() * 6});
            d.r = 0;
          }
        }
        b.tocco = Math.max(0, b.tocco - dt * .55); b.evidenzia = Math.max(0, (b.evidenzia || 0) - dt * .25);
      }
      for (let i = vapori.length - 1; i >= 0; i--) { const p = vapori[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(p.t * 4 + p.f) * .4; if (p.t > p.vita) vapori.splice(i, 1); }
      if (v > .05 && Math.random() < v * dt * 9) strisce.push({x: -60, y: H * (.12 + Math.random() * .6), l: 40 + Math.random() * 80, vx: 260 + 340 * v, t: 0});
      for (let i = strisce.length - 1; i >= 0; i--) { const q = strisce[i]; q.t += dt; q.x += q.vx * dt; if (q.x > W + 100) strisce.splice(i, 1); }
      if (st.posto === "arco" && Math.random() < v * dt * 1.2) foglie.push({x: -20, y: H * (.2 + Math.random() * .5), vx: 120 + 200 * v, r: Math.random() * 6, t: 0});
      for (let i = foglie.length - 1; i >= 0; i--) { const q = foglie[i]; q.t += dt; q.x += q.vx * dt; q.y += Math.sin(q.t * 3) * 1.2; q.r += dt * 4; if (q.x > W + 40) foglie.splice(i, 1); }
      while (aria.length < 40) aria.push({x: Math.random() * W, y: Math.random() * H, f: Math.random() * 6});
      for (const p of aria) { p.x += (5 + v * 120) * dt; if (p.x > W) p.x = 0; }
      controlla();
    }
    function disegnaTutto() {
      g.clearRect(0, 0, W, H); sfondo();
      if (st.aria === "umida") { g.fillStyle = "rgba(170,200,220,.55)"; for (const p of aria) { g.beginPath(); g.arc(p.x, p.y + Math.sin(st.t + p.f) * 6, 2.2, 0, 7); g.fill(); } }
      g.strokeStyle = "rgba(255,255,255,.75)"; g.lineCap = "round"; g.lineWidth = 3;
      for (const q of strisce) { g.globalAlpha = Math.min(.8, vento()); g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo(q.x + q.l / 2, q.y - 8, q.x + q.l, q.y); g.stroke(); }
      g.globalAlpha = 1;
      for (const b of brocche) disegnaBrocca(b);
      for (const p of vapori) {
        const k = p.t / p.vita, a = 1 - k;
        g.globalAlpha = .55 * a; g.fillStyle = "#e8f4fb"; g.beginPath(); g.arc(p.x, p.y, 5 + k * 14, 0, 7); g.fill();
        g.globalAlpha = .9 * a; const r = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7); r.addColorStop(0, "rgba(255,200,90,1)"); r.addColorStop(1, "rgba(255,140,40,0)"); g.fillStyle = r; g.beginPath(); g.arc(p.x, p.y, 7, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      for (const q of foglie) { g.save(); g.translate(q.x, q.y); g.rotate(q.r); g.fillStyle = "#8fb345"; g.beginPath(); g.ellipse(0, 0, 9, 4, 0, 0, 7); g.fill(); g.restore(); }
      if (st.raffica > .05) { g.globalAlpha = Math.min(.9, st.raffica); g.font = "34px sans-serif"; g.fillText("💨", st.rx, st.ry); g.globalAlpha = 1; }
    }

    /* ---------- Bip e i compiti ---------- */
    let bipTok = 0;
    function bip(testo, v) { if (!vivo) return; $("#bipT").textContent = testo; const av = $(".bipdice .avatar", lab); bipTok++; const t = bipTok; if (v) { av.classList.add("parlando"); suono.voce(v, () => { if (t === bipTok) av.classList.remove("parlando"); }); } else { av.classList.add("parlando"); setTimeout(() => t === bipTok && av.classList.remove("parlando"), 900); } }
    function fatto(c) { if (!vivo || st.fatti[c]) return; st.fatti[c] = true; $(`.compito[data-c="${c}"]`, lab).classList.add("ok"); suono.tintinnio(); if (st.fatti.vento && st.fatti.smalto && st.fatti.umida) finito(); }
    function finito() { const b = $("#labCapito"); b.disabled = false; b.classList.add("pulsa"); coriandoli(innerWidth * .8, innerHeight * .85, 50); setTimeout(() => bip("Hai scoperto cosa conta davvero! Quando sei pronto, tocca «Ho capito!»"), 4200); }
    function controlla() {
      const t = brocche[0], k = st.posto + "|" + st.aria, fermo = Math.abs(t.dT) < .07 && st.t - st.cambio > 3;
      if (!st.fatti.vento && st.posto === "arco" && st.aria === "secca" && t.T < 21.5) { fatto("vento"); bip("Goccioline fuori… e volano via col vento! Freschissima!", "l3"); setTimeout(() => { if (!st.fatti.smalto) { brocche[1].evidenzia = 3; bip("E la brocca di Mira? Niente goccioline: è liscia e asciutta. L'acqua è tiepida.", "l2"); fatto("smalto"); } }, 5200); return; }
      if (!st.fatti.umida && st.fatti.vento && st.aria === "umida" && st.posto === "arco" && t.T > 25) { fatto("umida"); return bip("Con l'aria appiccicosa, le goccioline volano via a fatica.", "l4"); }
      if (fermo && !st.detti[k]) {
        st.detti[k] = true;
        if (st.posto === "casa" && st.aria === "secca") bip("In casa l'aria è ferma: le goccioline se ne vanno piano piano.", "l5");
        else if (st.posto === "casa" && st.aria === "umida") bip("Aria ferma e appiccicosa: quasi niente fresco.", "l6");
        else if (st.posto === "arco" && st.aria === "umida" && !st.fatti.vento) bip("Con l'aria appiccicosa, le goccioline volano via a fatica.", "l4");
      }
      st.vuoto += 1 / 60;
      if (st.vuoto > 14 && !st.fatti.vento && !st.detti.aiuto) { st.detti.aiuto = true; bip("Prova a portare le brocche all'Arco del Vento! E tocca la terracotta: senti com'è?"); }
    }

    /* ---------- tocchi ---------- */
    let giu = null;
    cv.addEventListener("pointerdown", e => { giu = {x: e.clientX, y: e.clientY, t: performance.now()}; });
    cv.addEventListener("pointermove", e => {
      if (!giu) return; const dx = e.clientX - giu.x;
      if (Math.abs(dx) > 30 && st.posto === "arco") { st.raffica = Math.min(1, st.raffica + Math.abs(dx) / 400); st.rx = e.clientX; st.ry = e.clientY; giu.x = e.clientX; if (Math.random() < .3) suono.soffio(.15); st.vuoto = 0; }
    });
    cv.addEventListener("pointerup", e => {
      if (giu && Math.hypot(e.clientX - giu.x, e.clientY - giu.y) < 12) for (const b of brocche) if (Math.abs(e.clientX - b.x) < 75 * s && e.clientY > b.y && e.clientY < b.y + 170 * s) { b.tocco = 1.6; suono.pop(); st.vuoto = 0; }
      giu = null;
    });
    const scegli = (id, chiave) => $$(`#${id} button`, lab).forEach(bt => bt.onclick = () => { st[chiave] = bt.dataset.v; st.cambio = st.t; st.vuoto = 0; $$(`#${id} button`, lab).forEach(x => x.classList.toggle("on", x === bt)); suono.pop(); if (chiave === "posto" && bt.dataset.v === "arco") suono.soffio(.3); });
    scegli("iPosto", "posto"); scegli("iAria", "aria");

    /* ---------- ciclo ---------- */
    let vivo = true, prec = performance.now();
    const ciclo = ora => { if (!vivo) return; const dt = Math.min(.05, (ora - prec) / 1000); prec = ora; aggiorna(dt); disegnaTutto(); requestAnimationFrame(ciclo); };
    addEventListener("resize", adatta); adatta(); requestAnimationFrame(ciclo);
    suono.ambiente("casa", .7);
    bip("Due brocche piene d'acqua tiepida: una di terracotta, una smaltata. Scegli dove metterle e com'è l'aria… e guarda cosa succede!");
    const chiudi = ok => { vivo = false; removeEventListener("resize", adatta); suono.fermaVoce(); lab.classList.remove("on"); lab.innerHTML = ""; document.body.classList.remove("in-lab"); document.body.classList.toggle("serve-orizz", document.body.dataset.schermo === "borgo"); chiudiModale(); fine(ok); };
    $("#labCapito").onclick = () => { suono.pop(); chiudi(true); };
    $("#labEsci").onclick = () => { suono.pop(); chiudi(false); };
    // l'ambiente sonoro segue il posto
    $$("#iPosto button", lab).forEach(bt => bt.addEventListener("click", () => suono.ambiente(bt.dataset.v === "arco" ? "vento" : "casa", .8)));
  });
}
