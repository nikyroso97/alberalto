/* Alberalto · il muretto di Tobia: perché le chiocciole escono con l'umido (ep-002).
   Si cambia il tempo (sole, nuvole, pioggia, notte): con il secco le chiocciole chiudono il guscio
   con una porticina sottile; con l'umido escono, allungano le corna e lasciano la scia d'argento.
   Si osserva senza toccare: la lente guarda da vicino. */
"use strict";
import {$, $$, S, salva, suono, apriModale, chiudiModale, coriandoli, AV} from "./core.js";
const picoImg = new Image(); picoImg.src = "img/sp-pico.png";

const TEMPI = {sole: {u: .12, cielo: ["#8fc7ef", "#f7e7bf"], t: "☀️ Sole"}, nuvole: {u: .7, cielo: ["#aab6bf", "#d9dcd8"], t: "☁️ Nuvole"}, pioggia: {u: 1, cielo: ["#8996a0", "#bfc6c6"], t: "🌧️ Pioggia"}, notte: {u: .75, cielo: ["#1d2b4a", "#3a4a6a"], t: "🌙 Notte"}};

export function apriLabChiocciole() {
  return new Promise(fine => {
    const lab = $("#lab"); apriModale(); document.body.classList.add("in-lab", "serve-orizz");
    lab.innerHTML = `<canvas></canvas>
      <div class="lab-alto"><div class="bipdice"><div class="avatar" id="labAv" style="background-image:url(img/av-tobia.webp)"></div><div class="t" id="bipT"></div></div>
        <div class="compiti" style="margin-right:52px"><div class="compito" data-c="chiusa">Guarda una chiocciola col sole</div><div class="compito" data-c="aperte">Fai arrivare l'umido</div><div class="compito" data-c="scia">Guarda la scia d'argento</div></div></div>
      <button class="tondo piccolo esci" id="labEsci" aria-label="Esci">✕</button>
      <div class="lab-basso"><div class="gruppoC"><div class="interr blu" id="iTempo">${Object.entries(TEMPI).map(([k, v]) => `<button data-v="${k}" class="${k === "sole" ? "on" : ""}">${v.t}</button>`).join("")}</div></div>
        <div id="scelta" style="display:none;gap:8px"><button class="btn" data-s="si">🔓 Apriamola</button><button class="btn verde" data-s="no">✋ Lasciamola stare</button></div>
        <button class="btn verde" id="labCapito" disabled>Ho capito! ▸</button></div>`;
    lab.classList.add("on");
    const cv = $("canvas", lab), g = cv.getContext("2d");
    let W = 0, H = 0, y0 = 0, y1 = 0;
    const st = {tempo: "sole", u: .12, t: 0, fatti: {}, lente: null, picoFatto: false, pico: 0, gocce: [], stelle: []};
    const ch = [];
    const adatta = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = lab.clientWidth; H = lab.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); y0 = H * .44; y1 = H * .8;
      if (!ch.length) for (let k = 0; k < 5; k++) ch.push({x: W * (.14 + k * .17 + (Math.random() - .5) * .05), y: y0 + (y1 - y0) * (.2 + Math.random() * .6), dir: Math.random() < .5 ? -1 : 1, ap: 0, rit: Math.random() * 2.5, scia: [], v: .6 + Math.random() * .5, col: ["#c98a4a", "#b7793d", "#d39b5a", "#a86d3a", "#c48446"][k]});
      st.stelle = Array.from({length: 40}, () => [Math.random() * W, Math.random() * y0 * .9, Math.random() * 6]); };
    const s = () => H * .055;

    /* ---------- disegno ---------- */
    function cielo() {
      const T = TEMPI[st.tempo]; let gr = g.createLinearGradient(0, 0, 0, y0); gr.addColorStop(0, T.cielo[0]); gr.addColorStop(1, T.cielo[1]); g.fillStyle = gr; g.fillRect(0, 0, W, y0 + 2);
      if (st.tempo === "sole") { const sx = W * .82, sy = H * .16, r = g.createRadialGradient(sx, sy, 5, sx, sy, 110); r.addColorStop(0, "rgba(255,250,210,1)"); r.addColorStop(.3, "rgba(255,226,130,.7)"); r.addColorStop(1, "rgba(255,220,120,0)"); g.fillStyle = r; g.fillRect(sx - 110, sy - 110, 220, 220); }
      if (st.tempo === "notte") { for (const [x, y, f] of st.stelle) { g.globalAlpha = .4 + .6 * Math.abs(Math.sin(st.t + f)); g.fillStyle = "#fff"; g.fillRect(x, y, 2, 2); } g.globalAlpha = 1; g.fillStyle = "#f4efd2"; g.beginPath(); g.arc(W * .8, H * .15, 22, 0, 7); g.fill(); g.fillStyle = TEMPI.notte.cielo[0]; g.beginPath(); g.arc(W * .8 + 9, H * .15 - 5, 20, 0, 7); g.fill(); }
      if (st.tempo === "nuvole" || st.tempo === "pioggia") { g.fillStyle = st.tempo === "pioggia" ? "rgba(120,130,140,.85)" : "rgba(240,242,244,.85)"; for (let k = 0; k < 5; k++) { const x = ((k * 230 + st.t * 12) % (W + 300)) - 150, y = H * (.12 + (k % 2) * .1); for (const [dx, dy, r] of [[0, 0, 40], [38, -12, 46], [80, 0, 38], [40, 12, 40]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, 7); g.fill(); } } }
    }
    function muretto() {
      g.fillStyle = "#6d8f3f"; g.fillRect(0, y1, W, H - y1);
      const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#8a5a33"); gr.addColorStop(1, "#5f3c20"); g.fillStyle = gr;
      g.beginPath(); g.moveTo(0, y0 + 14); for (let x = 0; x <= W; x += 30) g.lineTo(x, y0 + Math.sin(x / 70) * 10); g.lineTo(W, y1 + 6); g.lineTo(0, y1 + 6); g.fill();
      g.strokeStyle = "rgba(40,22,8,.35)"; g.lineWidth = 3; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(0, y0 + 20 + k * (y1 - y0) / 6); for (let x = 0; x <= W; x += 40) g.lineTo(x, y0 + 20 + k * (y1 - y0) / 6 + Math.sin(x / 50 + k) * 5); g.stroke(); }
      g.fillStyle = "#6f9a3e"; for (let x = 10; x < W; x += 34) { g.beginPath(); g.arc(x, y0 + Math.sin(x / 70) * 10, 12 + (x % 5), 0, 7); g.fill(); }
      if (st.u > .5) { g.fillStyle = `rgba(200,225,240,${(st.u - .5) * .35})`; g.fillRect(0, y0, W, y1 - y0); } // il muretto bagnato luccica
      g.fillStyle = "rgba(30,50,20,.4)"; for (let x = 5; x < W; x += 15) { g.beginPath(); g.moveTo(x, y1 + 6); g.lineTo(x + 3, y1 - 6 - (x * 7) % 10); g.lineTo(x + 6, y1 + 6); g.fill(); }
    }
    function scie() {
      for (const c of ch) for (const p of c.scia) {
        const umida = Math.max(0, 1 - p.eta / 30) * (st.u > .5 ? 1 : .4);
        g.fillStyle = `rgba(${200 + 40 * umida},${215 + 30 * umida},${228 + 22 * umida},${.35 + .5 * umida})`; g.beginPath(); g.ellipse(p.x, p.y, s() * .28, s() * .1, 0, 0, 7); g.fill();
        if (umida > .5 && (p.x * 7 + st.t * 40) % 60 < 3) { g.fillStyle = "#fff"; g.fillRect(p.x, p.y - 1, 2, 2); }
      }
    }
    function chiocciola(c) {
      const S_ = s(), ap = c.ap;
      g.save(); g.translate(c.x, c.y); g.scale(c.dir, 1);
      if (ap > .05) { // il corpo e le corna
        const L = S_ * (1.1 + .9 * ap), ondula = Math.sin(st.t * 3 + c.x) * .05 * ap;
        g.fillStyle = "#cdbb98"; g.strokeStyle = "#8f7a58"; g.lineWidth = 2; g.beginPath(); g.ellipse(L * .25, S_ * .35, L * .75, S_ * .28, 0, 0, 7); g.fill(); g.stroke();
        const hx = L * .25 + L * .7, hy = S_ * .25;
        for (const [a, l] of [[-1.05 + ondula, 1], [-.75 - ondula, .85]]) { const tx = hx + Math.cos(a) * S_ * .9 * ap * l, ty = hy + Math.sin(a) * S_ * .9 * ap * l; g.beginPath(); g.moveTo(hx - 4, hy); g.lineTo(tx, ty); g.stroke(); g.fillStyle = "#3a2b20"; g.beginPath(); g.arc(tx, ty, 2.6, 0, 7); g.fill(); }
      }
      // il guscio
      g.fillStyle = c.col; g.strokeStyle = "#6e3e1a"; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, S_, 0, 7); g.fill(); g.stroke();
      g.strokeStyle = "rgba(90,50,20,.75)"; g.lineWidth = 2; g.beginPath(); for (let a = 0; a < 12; a += .2) { const r = S_ * (1 - a / 13); g.lineTo(Math.cos(a) * r * .9, Math.sin(a) * r * .9); } g.stroke();
      g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(-S_ * .35, -S_ * .45, S_ * .3, S_ * .14, -.5, 0, 7); g.fill();
      if (ap < .5) { const k = 1 - ap * 2; g.fillStyle = `rgba(235,240,245,${.75 * k})`; g.strokeStyle = `rgba(160,175,190,${.9 * k})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(S_ * .62, S_ * .62, S_ * .38, S_ * .26, .7, 0, 7); g.fill(); g.stroke(); } // la porticina
      g.restore();
    }
    function lente() {
      const L = st.lente; if (!L) return; const c = L.c, R = H * .2, cx = Math.min(W - R - 10, c.x + R * 1.2), cy = Math.max(R + 70, c.y - R * .8);
      g.save(); g.globalAlpha = Math.min(1, L.t); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fillStyle = "#7a5030"; g.fill(); g.clip();
      g.translate(cx, cy); g.scale(3, 3); g.translate(-c.x, -c.y); for (const p of c.scia) { g.fillStyle = "rgba(230,240,250,.8)"; g.beginPath(); g.ellipse(p.x, p.y, s() * .28, s() * .1, 0, 0, 7); g.fill(); } chiocciola(c); g.restore();
      g.save(); g.globalAlpha = Math.min(1, L.t); g.lineWidth = 8; g.strokeStyle = "#3a2b20"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.lineWidth = 10; g.beginPath(); g.moveTo(cx - R * .72, cy + R * .72); g.lineTo(cx - R * 1.1, cy + R * 1.1); g.stroke();
      const txt = c.ap < .3 ? "porticina chiusa" : "corna fuori!"; g.font = "700 14px Fredoka, sans-serif"; g.textAlign = "center"; const tw = g.measureText(txt).width + 18; g.fillStyle = "#fff3cf"; g.fillRect(cx - tw / 2, cy + R - 4, tw, 22); g.fillStyle = "#3a2b20"; g.fillText(txt, cx, cy + R + 12); g.restore();
    }
    function pioggia() { if (st.tempo !== "pioggia") return; g.strokeStyle = "rgba(200,220,240,.7)"; g.lineWidth = 1.6; for (const d of st.gocce) { g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[0] - 3, d[1] + 12); g.stroke(); } }
    function picoDisegno() { if (!st.pico || !picoImg.complete) return; const k = Math.min(1, st.pico), h = H * .24, w = h * picoImg.width / picoImg.height; g.globalAlpha = k; g.drawImage(picoImg, W * .5 - w / 2, y0 - h * .85 + Math.sin(st.t * 4) * 4 - (1 - k) * 60, w, h); g.globalAlpha = 1; }

    /* ---------- vita delle chiocciole ---------- */
    function aggiorna(dt) {
      st.t += dt; st.u += (TEMPI[st.tempo].u - st.u) * Math.min(1, dt * .7);
      if (st.tempo === "pioggia") { while (st.gocce.length < 90) st.gocce.push([Math.random() * W, Math.random() * H]); for (const d of st.gocce) { d[1] += 520 * dt; d[0] -= 60 * dt; if (d[1] > H) { d[1] = -10; d[0] = Math.random() * W * 1.1; } } } else st.gocce.length = 0;
      for (const c of ch) {
        const vuole = st.u > .55 ? 1 : 0;
        if (vuole && c.rit > 0) c.rit -= dt; else c.ap += ((vuole ? 1 : 0) - c.ap) * Math.min(1, dt * (vuole ? .8 : 1.6));
        if (!vuole) c.rit = Math.random() * 2.5;
        if (c.ap > .8) { c.x += c.dir * s() * .25 * c.v * dt; c.y += Math.sin(st.t * .5 + c.v * 9) * 3 * dt; if (c.x < W * .05 || c.x > W * .95) c.dir *= -1; const ul = c.scia[c.scia.length - 1]; if (!ul || Math.hypot(ul.x - (c.x - c.dir * s()), ul.y - c.y - s() * .55) > s() * .25) c.scia.push({x: c.x - c.dir * s() * .9, y: c.y + s() * .6, eta: 0}); }
        for (const p of c.scia) p.eta += dt * (st.u > .5 ? .2 : 1.5); if (c.scia.length > 160) c.scia.shift();
      }
      if (st.lente) { st.lente.t -= dt * .25; if (st.lente.t <= 0) st.lente = null; }
      if (st.pico && st.picoFatto === "via") st.pico = Math.max(0, st.pico - dt);
      else if (st.pico && st.pico < 1) st.pico += dt * 2;
      const aperte = ch.filter(c => c.ap > .8).length;
      if (!st.fatti.aperte && st.fatti.chiusa && aperte >= 3) { fatto("aperte"); parla("bip", "Escono! Una alla volta aprono la porta, allungano le corna e partono, lente lente."); }
    }

    /* ---------- chi parla e i compiti ---------- */
    let tok = 0;
    function parla(chi, testo, v) { if (!vivo) return; const t = ++tok, av = $("#labAv"); av.style.backgroundImage = `url(img/av-${AV[chi]}.webp)`; $("#bipT").textContent = testo; av.classList.add("parlando"); suono.dici(chi, testo, v, () => t === tok && av.classList.remove("parlando")); }
    function fatto(c) { if (!vivo || st.fatti[c]) return; st.fatti[c] = true; S.f[c] = true; salva(); $(`.compito[data-c="${c}"]`, lab).classList.add("ok"); suono.tintinnio(); if (st.fatti.chiusa && st.fatti.aperte && st.fatti.scia) { const b = $("#labCapito"); b.disabled = false; b.classList.add("pulsa"); coriandoli(innerWidth * .85, innerHeight * .85, 50); setTimeout(() => parla("bip", "Hai capito di cosa hanno bisogno le chiocciole! Quando sei pronto, tocca «Ho capito!»"), 4500); } }
    function momentoPico() { // Pico vuole aprire una porticina: si sceglie, e si vede cosa succede
      st.pico = .01; parla("pico", "Cra! Apriamo una porticina per guardare dentro!");
      const sc = $("#scelta"); sc.style.display = "flex"; $("#iTempo").style.visibility = "hidden";
      $$("#scelta button", lab).forEach(b => b.onclick = () => {
        sc.style.display = "none"; $("#iTempo").style.visibility = ""; suono.pop();
        if (b.dataset.s === "si") parla("tobia", "No! Se la strappi, lei resta senza porta.");
        else parla("tobia", "…sì. Se la strappi, lei resta senza porta.");
        setTimeout(() => { parla("pico", "Cra…", null); $("#bipT").textContent = "Pico ci pensa su. E per una volta non fa scherzi."; st.picoFatto = "via"; setTimeout(() => parla("tobia", "Proviamo ad aspettare l'umido. Cambia il tempo, lassù!"), 3800); }, 3600);
      });
    }

    /* ---------- tocchi: si guarda con la lente, non si tocca ---------- */
    cv.addEventListener("pointerup", e => {
      const x = e.clientX, y = e.clientY;
      const c = ch.find(c => Math.hypot(c.x - x, c.y - y) < s() * 1.6);
      if (c) {
        st.lente = {c, t: 1.6}; suono.pop();
        if (c.ap < .3) { if (st.tempo === "sole" && !st.fatti.chiusa) { fatto("chiusa"); parla("tobia", "È come se chiudessero la porta di casa per non far scappare l'acqua."); if (!st.picoFatto) { st.picoFatto = true; setTimeout(momentoPico, 4200); } } else parla("tobia", "Chiusa. Ha messo la porticina."); }
        else parla("tobia", "Guarda le corna! Si muove piano piano.");
        return;
      }
      for (const k of ch) for (const p of k.scia) if (Math.hypot(p.x - x, p.y - y) < s() * .9) {
        st.lente = {c: k, t: 1.6}; suono.pop();
        if (!st.fatti.scia && st.fatti.aperte) { fatto("scia"); parla("tobia", "La scia d'argento è la loro bava. Quando si asciuga resta lucida sui sassi."); }
        return;
      }
    });
    $$("#iTempo button", lab).forEach(b => b.onclick = () => { st.tempo = b.dataset.v; $$("#iTempo button", lab).forEach(x => x.classList.toggle("on", x === b)); suono.pop(); suono.ambiente(st.tempo === "pioggia" || st.tempo === "nuvole" ? "vento" : "borgo", .6);
      if (st.tempo === "notte") parla("bip", "Di notte è fresco e umido… guarda bene le chiocciole!"); });

    /* ---------- ciclo ---------- */
    let vivo = true, prec = performance.now();
    const ciclo = ora => { if (!vivo) return; const dt = Math.min(.05, (ora - prec) / 1000); prec = ora; aggiorna(dt); g.clearRect(0, 0, W, H); cielo(); muretto(); scie(); ch.forEach(chiocciola); pioggia(); picoDisegno(); lente(); requestAnimationFrame(ciclo); };
    addEventListener("resize", adatta); adatta(); requestAnimationFrame(ciclo);
    suono.ambiente("borgo", .6);
    parla("tobia", "Le chiocciole… col sole stanno ferme ferme. Tocca una chiocciola per guardarla con la lente: si guarda, non si tocca.");
    const chiudi = ok => { vivo = false; removeEventListener("resize", adatta); suono.fermaVoce(); lab.classList.remove("on"); lab.innerHTML = ""; document.body.classList.remove("in-lab"); document.body.classList.toggle("serve-orizz", document.body.dataset.schermo === "borgo"); chiudiModale(); fine(ok); };
    $("#labCapito").onclick = () => { suono.pop(); chiudi(true); };
    $("#labEsci").onclick = () => { suono.pop(); chiudi(false); };
  });
}
