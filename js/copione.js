/* Alberalto · il copione: dà a ogni battuta un codice stabile per il doppiaggio
   (ep-002-07 = settima battuta dell'episodio 2; mondo-03 = battute del mondo).
   Lo usano sia il gioco (regia.js) sia l'Officina delle storie (editor.html). */
"use strict";
const cod = (pref, n) => `${pref}-${String(n).padStart(2, "0")}`;
function numera(fai, pref, cont, lista, storia) {
  for (const p of fai || []) {
    if (Array.isArray(p)) { p.codice = cod(pref, ++cont.n); lista.push({codice: p.codice, chi: p[0], testo: typeof p[1] === "function" ? "(testo che cambia)" : p[1], voce: p[2] || null, nota: p[3] || "", storia}); }
    else if (p && typeof p === "object") {
      numera(p.fai, pref, cont, lista, storia); numera(p.altrimenti, pref, cont, lista, storia);
      if (p.domanda) { p.domanda.codice = cod(pref, ++cont.n); lista.push({codice: p.domanda.codice, chi: p.domanda.chi || "bip", testo: p.domanda.testo, voce: p.domanda.voce || null, nota: "domanda", storia}); for (const s of p.domanda.sbagliate || []) numera(s[1], pref, cont, lista, storia); }
      if (p.fumetto) { /* il fumetto ha la voce nel terzo posto */ }
    }
  }
}
/* numera tutte le battute e restituisce il copione completo */
export function preparaCopione(STORIE, MONDO) {
  const lista = [];
  const cm = {n: 0};
  for (const fai of Object.values(MONDO.COSE_MONDO || {})) numera(fai, "mondo", cm, lista, "mondo");
  for (const fai of Object.values(MONDO.CHIACCHIERE || {})) numera(fai, "mondo", cm, lista, "mondo");
  for (const st of STORIE) { const c = {n: 0}; for (const r of st.regole || []) numera(r.fai, st.ep, c, lista, st.ep); }
  return lista;
}
