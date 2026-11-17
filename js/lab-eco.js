/* Alberalto · il laboratorio di Bip: perché la Radice Cava risponde (l'eco).
   La voce viaggia a 343 metri al secondo, rimbalza sulla parete dura e torna:
   il ritardo è quello vero (2 × distanza ÷ 343). Il muschio morbido la assorbe. */
"use strict";
import {$, $$, suono, apriModale, chiudiModale, coriandoli} from "./core.js";

const C = 343, DMIN = 5, DMAX = 170;
const caricaImg = src => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

export function apriLabEco() {
  return new Promise(async fine => {
    const lab = $("#lab"); apriModale(); document.body.classList.add("in-lab", "serve-orizz");
    lab.innerHTML = `<canvas></canvas>
      <div class="lab-alto"><div class="bipdice"><div class="avatar" style="background-image:url(img/av-bip.webp)"></div><div class="t" id="bipT"></div></div>
        <div class="compiti" style="margin-right:52px"><div class="compito" data-c="lontano">Grida da lontano</div><div class="compito" data-c="vicino">Grida da vicino</div><div class="compito" data-c="muschio">Grida verso il muschio</div></div></div>
      <button class="tondo piccolo esci" id="labEsci" aria-label="Esci">✕</button>
      <div class="lab-basso"><div class="gruppoC">
        <div class="interr verde" id="iMuschio"><button data-v="no" class="on">🪵 Corteccia dura</button><button data-v="si">🌿 Muschio</button></div>
        <div class="interr" id="iVel"><button data-v="1" class="on">⚡ Vera</button><button data-v="8">🐢 Lenta</button></div></div>
        <button class="grida on" id="labGrida" style="position:static;animation:none"><span>📣</span>Grida!</button>
        <button class="btn verde" id="labCapito" disabled>Ho capito! ▸</button></div>`;
    lab.classList.add("on");
    const cv = $("canvas", lab), g = cv.getContext("2d");
    const [leo, bipI] = await Promise.all([caricaImg("img/sp-leo.png"), caricaImg("img/sp-bip.png")]);
    let W = 0, H = 0, yG = 0, xL = 0, ppm = 1;
    const st = {d: 110, muschio: false, lento: 1, onde: [], prove: [], fatti: {}, t: 0, trasc: false, mano: 1};
    const adatta = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = lab.clientWidth; H = lab.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); yG = H * .7; xL = W * .1; ppm = (W * .9 - xL) / DMAX; };
    const xParete = () => xL + st.d * ppm, bocca = () => [xL + H * .06, yG - H * .23];

    /* ---------- disegno ---------- */
    function scena() {
      let gr = g.createLinearGradient(0, 0, 0, yG); gr.addColorStop(0, "#8ec5ea"); gr.addColorStop(1, "#f6e7c6"); g.fillStyle = gr; g.fillRect(0, 0, W, yG);
      g.fillStyle = "rgba(120,160,110,.55)"; g.beginPath(); g.moveTo(0, yG); for (let x = 0; x <= W; x += 20) g.lineTo(x, yG - 40 - Math.sin(x / 110) * 22 - Math.sin(x / 41) * 6); g.lineTo(W, yG); g.fill();
      gr = g.createLinearGradient(0, yG, 0, H); gr.addColorStop(0, "#9fbe5e"); gr.addColorStop(1, "#5f8a36"); g.fillStyle = gr; g.fillRect(0, yG, W, H - yG);
      g.fillStyle = "rgba(60,90,30,.35)"; for (let x = 6; x < W; x += 17) { g.beginPath(); g.moveTo(x, yG + 4); g.lineTo(x + 3, yG - 6 - (x * 7) % 9); g.lineTo(x + 6, yG + 4); g.fill(); }
      // la Radice Cava
      const xp = xParete(); g.save();
      g.fillStyle = "#7a4c2a"; g.beginPath(); g.moveTo(xp, H); g.lineTo(xp, yG - H * .2); g.bezierCurveTo(xp - 6, yG - H * .5, xp + 20, yG - H * .75, xp + 70, -20); g.lineTo(W + 40, -20); g.lineTo(W + 40, H); g.closePath(); g.fill();
      g.strokeStyle = "rgba(45,25,10,.45)"; g.lineWidth = 3; for (let k = 0; k < 7; k++) { const x0 = xp + 18 + k * 26; g.beginPath(); g.moveTo(x0, H); g.bezierCurveTo(x0 - 8, yG - 40, x0 + 14, yG - H * .4, x0 + 60, -20); g.stroke(); }
      g.fillStyle = "#3b2414"; g.beginPath(); g.ellipse(xp + 90, yG + 4, 46, 64, 0, Math.PI, 0); g.fill();
      if (st.muschio) { g.fillStyle = "#5f8f35"; for (let y = yG + 10; y > yG - H * .62; y -= 11) { const x = xp + Math.sin(y / 20) * 3 - 2; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); } g.fillStyle = "#86b34a"; for (let y = yG; y > yG - H * .6; y -= 17) { g.beginPath(); g.arc(xp - 4 + Math.sin(y) * 2, y, 6, 0, 7); g.fill(); } }
      g.restore();
      // maniglia
      if (!st.trasc) { const y = yG - H * .32; g.globalAlpha = .75 + .25 * Math.sin(st.t * 4); g.fillStyle = "#fff3cf"; g.strokeStyle = "#b8652f"; g.lineWidth = 3; g.beginPath(); g.arc(xp - 2, y, 20, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#b8652f"; g.font = "700 20px Fredoka, sans-serif"; g.textAlign = "center"; g.fillText("↔", xp - 2, y + 7); g.globalAlpha = 1; }
      if (st.mano > 0) { g.globalAlpha = Math.min(1, st.mano); g.font = "40px sans-serif"; g.textAlign = "center"; g.fillText("👆", xParete() - 2 + Math.sin(st.t * 3) * 30, yG - H * .32 + 46); g.globalAlpha = 1; }
      // Leo e Bip
      if (leo) { const h = H * .32, w = h * leo.width / leo.height; g.drawImage(leo, xL - w / 2, yG - h + 6, w, h); }
      if (bipI) { const h = H * .13, w = h * bipI.width / bipI.height; g.drawImage(bipI, xL + H * .12, yG - H * .36 + Math.sin(st.t * 2.2) * 5, w, h); }
      // la distanza
      g.setLineDash([8, 7]); g.strokeStyle = "rgba(58,43,32,.6)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(xL + 20, yG + 16); g.lineTo(xp - 6, yG + 16); g.stroke(); g.setLineDash([]);
      const tx = `📏 ${Math.round(st.d)} metri`; g.font = "700 16px Fredoka, sans-serif"; g.textAlign = "center"; const tw = g.measureText(tx).width + 22, cx = (xL + xp) / 2;
      g.fillStyle = "rgba(251,244,227,.95)"; arrot(cx - tw / 2, yG + 4, tw, 26, 13); g.fill(); g.fillStyle = "#3a2b20"; g.fillText(tx, cx, yG + 23);
    }
    function arrot(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function disegnaOnde() {
      const [mx, my] = bocca();
      for (const o of st.onde) {
        const rFront = ppm * C * o.t, xp = o.xp, dpx = xp - mx;
        for (let k = 0; k < 3; k++) {
          const r = rFront - k * 16; if (r <= 4) continue;
          // andata
          if (r < dpx + 30) {
            g.save(); g.beginPath(); g.rect(0, 0, xp, H); g.clip();
            let a = .9 - k * .25; if (o.muschio && r > dpx) a *= Math.max(0, 1 - (r - dpx) / 30);
            g.globalAlpha = a; g.strokeStyle = "#e0782f"; g.lineWidth = 5 - k; g.beginPath(); g.arc(mx, my, r, -.55, .55); g.stroke(); g.restore();
          }
          // ritorno (come se partisse da una "Leo specchiato" dietro la parete)
          if (!o.muschio && r > dpx) {
            const r2 = r, cx = mx + 2 * dpx; if (r2 > 2 * dpx + 60) continue;
            g.save(); g.beginPath(); g.rect(0, 0, xp, H); g.clip();
            g.globalAlpha = (.75 - k * .2) * Math.max(0, 1 - Math.max(0, r2 - 2 * dpx) / 60); g.strokeStyle = "#3d84c6"; g.lineWidth = 4.5 - k; g.setLineDash([10, 6]); g.beginPath(); g.arc(cx, my, r2, Math.PI - .55, Math.PI + .55); g.stroke(); g.restore();
          }
        }
        if (o.muschio && rFront > dpx && rFront < dpx + 80) { g.globalAlpha = 1 - (rFront - dpx) / 80; g.fillStyle = "#a6d36a"; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(xp - 4, my - 40 + k * 16, 4 + (rFront - dpx) / 10, 0, 7); g.fill(); } g.globalAlpha = 1; }
      }
      g.globalAlpha = 1;
    }
    function cronologia() {
      if (!st.prove.length) return;
      const x0 = W * .3, x1 = W * .64, y0 = H * .24, sc = (x1 - x0) / 1.1;
      const righe = st.prove.slice(-3);
      g.fillStyle = "rgba(251,244,227,.9)"; arrot(x0 - 92, y0 - 26, x1 - x0 + 112, 30 + righe.length * 28, 14); g.fill();
      g.font = "700 13px Fredoka, sans-serif"; g.textAlign = "left"; g.fillStyle = "#7d4220"; g.fillText("⏱️ Quanto ci mette la voce a tornare", x0 - 82, y0 - 8);
      g.textAlign = "right"; g.fillStyle = "#7a6a55"; g.fillText("1 secondo", x1 - 10, y0 - 8);
      righe.forEach((p, i) => {
        const y = y0 + 12 + i * 28;
        g.fillStyle = "#3a2b20"; g.textAlign = "right"; g.font = "700 13px Fredoka, sans-serif"; g.fillText(p.muschio ? "🌿 muschio" : `${p.d} m`, x0 - 12, y + 5);
        g.strokeStyle = "#d9c7a0"; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
        g.strokeStyle = "#b8a37a"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0 + sc * .5, y - 5); g.lineTo(x0 + sc * .5, y + 5); g.moveTo(x0 + sc, y - 5); g.lineTo(x0 + sc, y + 5); g.stroke();
        g.fillStyle = "#e0782f"; g.beginPath(); g.arc(x0, y, 7, 0, 7); g.fill();
        if (p.muschio) { g.fillStyle = "#5f8f35"; g.textAlign = "left"; g.fillText("nessuna eco", x0 + 14, y + 5); }
        else { const xe = x0 + sc * Math.min(1.1, p.ritardo); g.fillStyle = "#3d84c6"; g.beginPath(); g.arc(xe, y, 7, 0, 7); g.fill(); g.textAlign = "left"; g.fillStyle = "#255a8c"; g.fillText(p.ritardo < .1 ? "quasi insieme!" : `${p.ritardo.toFixed(2).replace(".", ",")} s`, Math.min(xe + 12, x1 - 40), y - 8); }
      });
    }

    /* ---------- gridare ---------- */
    let bipTok = 0;
    function bip(testo, v) { if (!vivo) return; $("#bipT").textContent = testo; const av = $(".bipdice .avatar", lab); const t = ++bipTok; av.classList.add("parlando"); suono.dici("bip", testo, v, () => t === bipTok && av.classList.remove("parlando")); }
    function fatto(c) { if (!vivo || st.fatti[c]) return false; st.fatti[c] = true; $(`.compito[data-c="${c}"]`, lab).classList.add("ok"); suono.tintinnio(); return true; }
    let ultima = 0;
    async function grida() {
      const ora = performance.now(); if (ora - ultima < 700) return; ultima = ora; st.mano = 0;
      const d = Math.round(st.d), ritardo = 2 * d / C, prova = {d, muschio: st.muschio, ritardo};
      const onda = {t: 0, xp: xParete(), muschio: st.muschio, lento: st.lento}; st.onde.push(onda);
      suono.voce("e5");
      if (!st.muschio) suono.eco("e5", [[ritardo * st.lento, .55], [ritardo * st.lento * 2, .15]]);
      setTimeout(() => { if (!vivo) return; st.prove.push(prova); commenta(prova); }, Math.max(400, ritardo * st.lento * 1000 + 450));
    }
    function commenta(p) {
      if (p.muschio) { if (fatto("muschio")) bip("Verso il muschio… niente. Silenzio.", "e16"); else bip("Il muschio è morbido: la voce ci affonda dentro e non torna."); }
      else if (p.d >= 60) { const n = fatto("lontano"); if (n && st.fatti.vicino) bip("Da lontano la voce torna dopo un po'. Da vicino, torna subito!", "e15"); else bip(`Da ${p.d} metri la voce torna dopo ${p.ritardo.toFixed(2).replace(".", ",")} secondi. Ora avvicina la Radice, tanto tanto!`); }
      else if (p.d <= 17) { const n = fatto("vicino"); if (n && st.fatti.lontano) bip("Da lontano la voce torna dopo un po'. Da vicino, torna subito!", "e15"); else bip("Così vicino la voce torna subito, quasi insieme! Ora prova da lontano, trascinando la Radice."); }
      else bip("Hai sentito? Prova ad allontanare la Radice tanto… oppure ad avvicinarla tantissimo!");
      if (st.fatti.lontano && st.fatti.vicino && !st.fatti.muschio && !p.muschio) setTimeout(() => bip("E se la parete fosse coperta di muschio morbido? Provalo!"), 4200);
      if (st.fatti.lontano && st.fatti.vicino && st.fatti.muschio && !st.finito) { st.finito = true; const b = $("#labCapito"); b.disabled = false; b.classList.add("pulsa"); coriandoli(innerWidth * .85, innerHeight * .85, 50); setTimeout(() => bip("Hai capito come funziona l'eco! Quando sei pronto, tocca «Ho capito!»"), 4200); }
    }

    /* ---------- tocchi ---------- */
    cv.addEventListener("pointerdown", e => { if (Math.abs(e.clientX - xParete()) < 70 && e.clientY > H * .15) { st.trasc = true; st.mano = 0; try { cv.setPointerCapture(e.pointerId); } catch (er) {} } });
    cv.addEventListener("pointermove", e => { if (!st.trasc) return; const d = (e.clientX - xL) / ppm; const n = Math.max(DMIN, Math.min(DMAX, d)); if (Math.round(n / 10) !== Math.round(st.d / 10)) suono.tic(); st.d = n; });
    const su = () => { st.trasc = false; }; cv.addEventListener("pointerup", su); cv.addEventListener("pointercancel", su);
    $$("#iMuschio button", lab).forEach(b => b.onclick = () => { st.muschio = b.dataset.v === "si"; $$("#iMuschio button", lab).forEach(x => x.classList.toggle("on", x === b)); suono.pop(); });
    $$("#iVel button", lab).forEach(b => b.onclick = () => { st.lento = +b.dataset.v; $$("#iVel button", lab).forEach(x => x.classList.toggle("on", x === b)); suono.pop(); if (st.lento > 1) bip("Al rallentatore tutto va 8 volte più piano: così vedi la voce che viaggia!"); });
    $("#labGrida").onclick = grida;

    /* ---------- ciclo ---------- */
    let vivo = true, prec = performance.now();
    const ciclo = ora => {
      if (!vivo) return; const dt = Math.min(.05, (ora - prec) / 1000); prec = ora; st.t += dt; st.mano = Math.max(0, st.mano - dt * .08);
      for (const o of st.onde) o.t += dt / o.lento;
      st.onde = st.onde.filter(o => ppm * C * o.t < (o.xp - bocca()[0]) * 2 + 120);
      g.clearRect(0, 0, W, H); scena(); disegnaOnde(); cronologia();
      requestAnimationFrame(ciclo);
    };
    addEventListener("resize", adatta); adatta(); requestAnimationFrame(ciclo);
    suono.ambiente("vento", .5); suono.carica("e5");
    bip("Trascina la Radice per spostarla lontano o vicino. Poi premi 📣 Grida! e ascolta bene.");
    const chiudi = ok => { vivo = false; removeEventListener("resize", adatta); suono.fermaVoce(); lab.classList.remove("on"); lab.innerHTML = ""; document.body.classList.remove("in-lab"); document.body.classList.toggle("serve-orizz", document.body.dataset.schermo === "borgo"); chiudiModale(); fine(ok); };
    $("#labCapito").onclick = () => { suono.pop(); chiudi(true); };
    $("#labEsci").onclick = () => { suono.pop(); chiudi(false); };
  });
}
