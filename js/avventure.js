/* Alberalto · le avventure nel Borgo delle Radici (ep-001 e ep-003) */
"use strict";
import {$, S, salva, suono, dialogo, domanda, toast, premio, mescola, finestra, occupato, NOMI, AV, aspetta, schermo, lampo} from "./core.js";
import {M, punto, mostraLuogo, ridisegna, guardaVerso, aggiungi, togli, bagliore, sprite, spriteTex, goccia, aggiungiPersona, aggiornaChiamate, onda, vaiA, yawDi, angDiff, RAGGIO, PH} from "./mondo.js";
import {apriLabBrocca} from "./lab-brocca.js";
import {apriLabEco} from "./lab-eco.js";
import {apriTaccuino} from "./taccuino.js";
import {celebraFaro} from "./albero.js";

const F = () => S.f;

/* ======================== i luoghi (coordinate in pixel sui panorami 3384×1536) ======================== */
export const LUOGHI = {
  piazza: {nome: "La piazza del Borgo", guarda: 2470, amb: "borgo", effetto: "polline",
    uscite: [{verso: "radici", x: 250, y: 840, testo: "Tra le radici"}, {verso: "casamira", x: 1555, y: 860, testo: "Casa di Mira"},
      {verso: "arco", x: 3330, y: 800, testo: "Arco del Vento"}, {verso: "felci", x: 640, y: 960, testo: "Verso le Felci Alte"},
      {verso: "casanonna", x: 2470, y: 800, testo: "Casa della Nonna"}, {verso: "prato", x: 1180, y: 930, testo: "Verso il prato", se: () => F().a2}],
    persone: [{chi: "nonna", x: 2830, y: 1120, h: 470}], cose: [],
    luci: [[120, 280, .7], [540, 370, .7], [985, 175, .6], [1245, 335, .6], [1620, 180, .6], [2940, 230, .7], [3150, 300, .7], [2160, 670, 1.1, .35], [2740, 670, 1.1, .35], [760, 520, .9, .3]],
    foglia: [1980, 1270], curio: [[640, 820, "bip", "k1", "La bancarella del mercante! Oggi è chiusa… chissà cosa porterà la prossima volta."]]},
  radici: {nome: "Tra le grandi radici", guarda: 1800, amb: "borgo", ambVol: .6, effetto: "pulviscolo",
    uscite: [{verso: "piazza", x: 2800, y: 760, testo: "Torna in piazza"}], persone: [],
    cose: [{id: "fessura", x: 1805, y: 900, testo: "La fessura"}],
    luci: [[2700, 540, .5], [2790, 560, .5], [620, 660, .8, .3]], foglia: [760, 1150], curio: [[1200, 1000, "leo", "k4", "Il muschio è morbido come un cuscino… e tiene l'umido."]]},
  arco: {nome: "L'Arco del Vento", guarda: 1840, amb: "vento", effetto: "foglie",
    uscite: [{verso: "piazza", x: 520, y: 900, testo: "Torna in piazza"}],
    persone: [{chi: "tobia", x: 1230, y: 1150, h: 440}, {chi: "mira", x: 2560, y: 1170, h: 470, se: () => F().bmira}],
    cose: [{id: "brocche", x: 1840, y: 760, testo: "Le brocche"}],
    luci: [[940, 605, .7], [2790, 585, .7]], foglia: [3000, 1240], curio: [[2700, 650, "bip", "k3", "Da qui si vedono le colline lontane. Il vento arriva proprio da lì!"]]},
  casamira: {nome: "La casa di Mira", guarda: 1900, amb: "casa", effetto: "pulviscolo", senzaBip: true,
    uscite: [{verso: "piazza", x: 3110, y: 800, testo: "Esci"}],
    persone: [{chi: "mira", x: 2520, y: 1250, h: 560, se: () => !F().bmira}],
    cose: [{id: "broccaMira", x: 1690, y: 860, testo: "La brocca nuova", se: () => !F().bmira}, {id: "bipLampada", x: 2180, y: 330, testo: "Una lanterna?", se: () => !F().bipLampada}],
    luci: [[2180, 420, 1.3], [1100, 880, .8]], foglia: [300, 1180], curio: [[820, 600, "bip", "k5", "Quanti disegni appesi! Mira disegna tutto quello che vede."]]},
  felci: {nome: "Il cancello delle Felci Alte", guarda: 1790, amb: "vento", ambVol: .6, effetto: "lucciole",
    uscite: [{verso: "piazza", x: 170, y: 1150, testo: "Torna in piazza"}], persone: [],
    cose: [{id: "cancello", x: 1790, y: 880, testo: "Il cancello"}],
    luci: [[1440, 600, .9], [2150, 600, .9]], curio: [[870, 820, "leo", "k8", "Il cartello non ha scritte… come se qualcuno se le fosse dimenticate."]]},
  casanonna: {nome: "La casa di Nonna Tessa", guarda: 2470, amb: "casa", effetto: "pulviscolo",
    uscite: [{verso: "piazza", x: 3110, y: 800, testo: "Esci"}], persone: [],
    cose: [{id: "libro", x: 2470, y: 720, testo: "Il libro delle storie"}],
    luci: [[2120, 300, 1.0], [1100, 940, 1.6, .55, "fuoco"], [1270, 440, .7]], foglia: [2650, 1130],
    curio: [[1100, 900, "bip", "k6", "Il fuoco della Nonna si guarda da lontano: scalda tutta la casa."], [1790, 880, "bip", "k7", "Tazze e teiera… la Nonna aspetta sempre qualcuno per merenda!"]]},
  prato: {nome: "Il prato della Radice Cava", guarda: 2300, amb: "vento", ambVol: .75, effetto: "polline", eco: "lontano", parete: [2250, .85],
    uscite: [{verso: "piazza", x: 420, y: 1000, testo: "Torna in piazza"}, {verso: "radicecava", x: 2050, y: 860, testo: "Avvicinati alla Radice"}],
    persone: [{chi: "mira", x: 1650, y: 1250, h: 480, se: () => F().a2arr}, {chi: "pico", x: 980, y: 505, h: 230, ombra: false, se: () => F().a2arr}], cose: [],
    luci: [[560, 560, .7], [980, 600, .6]]},
  radicecava: {nome: "Ai piedi della Radice Cava", guarda: 1700, amb: "vento", ambVol: .5, effetto: "polline", eco: "vicino", parete: [1600, 1.0], muschio: [2560, .38],
    uscite: [{verso: "prato", x: 3150, y: 950, testo: "Torna nel prato"}],
    persone: [{chi: "mira", x: 1050, y: 1230, h: 520, se: () => F().a2arr}], cose: [], luci: []}
};
export const PRIMO = {
  piazza: [["felce", 2050, "basso", 2.4, 2.3], ["fiori", 3080, "basso", 2.2, 1.3], ["ramo", 2620, "alto", 2.6, 2.1], ["felce", 330, "basso", 2.4, 2.2], ["fiori", 1180, "basso", 2.3, 1.25]],
  radici: [["felce", 1400, "basso", 2.3, 2.4], ["felce", 2280, "basso", 2.5, 2.2], ["ramo", 1900, "alto", 2.6, 1.9], ["fiori", 2700, "basso", 2.3, 1.2]],
  arco: [["fiori", 1330, "basso", 2.2, 1.35], ["fiori", 2420, "basso", 2.2, 1.25], ["ramo", 1640, "alto", 2.7, 2.2], ["felce", 620, "basso", 2.4, 2.2]],
  felci: [["felce", 1330, "basso", 2.3, 2.6], ["felce", 2260, "basso", 2.3, 2.5], ["fiori", 2750, "basso", 2.1, 1.2], ["ramo", 900, "alto", 2.6, 2.0]],
  prato: [["fiori", 1100, "basso", 2.2, 1.35], ["fiori", 3000, "basso", 2.2, 1.3], ["ramo", 1900, "alto", 2.7, 2.2]],
  radicecava: [["fiori", 300, "basso", 2.2, 1.3], ["felce", 2950, "basso", 2.4, 2.2], ["ramo", 1300, "alto", 2.6, 2.0]]
};
export const RAGGI = {prato: [1500, 3000], radicecava: [2300], piazza: [3050, 2350], radici: [1700, 2350], felci: [2600, 2850], arco: [2900]};
export const ALATI = {prato: {uccelli: true, farfalle: [[1300, 1200], [2600, 1150], [3100, 1250]]}, radicecava: {farfalle: [[2300, 1100]]}, piazza: {uccelli: true, farfalle: [[2050, 1150], [3000, 1180]]}, arco: {uccelli: true, farfalle: [[1300, 1180], [2500, 1150], [3000, 1220]]}, felci: {farfalle: [[1500, 1150], [2200, 1150]]}, radici: {farfalle: [[1500, 1150]]}};
export const NOMIMAPPA = {piazza: "Piazza", radici: "Radici", arco: "Arco del Vento", casamira: "Casa di Mira", felci: "Felci Alte", casanonna: "Casa della Nonna", prato: "Prato", radicecava: "Radice Cava"};
const POSMAPPA = {felci: [14, 22], casanonna: [50, 14], radici: [12, 62], piazza: [50, 52], arco: [86, 36], casamira: [32, 86], prato: [70, 82], radicecava: [91, 70]};

/* ======================== tesori e scoperte (per il taccuino) ======================== */
export const CURIO = {
  k1: {ic: "🛒", t: "La bancarella", dove: "piazza"}, k4: {ic: "🌿", t: "Il muschio", dove: "radici"}, k3: {ic: "⛰️", t: "Le colline lontane", dove: "arco"},
  k5: {ic: "🖍️", t: "I disegni di Mira", dove: "casamira"}, k6: {ic: "🔥", t: "Il fuoco della Nonna", dove: "casanonna"}, k7: {ic: "🫖", t: "La merenda", dove: "casanonna"}, k8: {ic: "🪧", t: "Il cartello muto", dove: "felci"}
};
export const TESTI_CURIO = Object.fromEntries(Object.values(LUOGHI).flatMap(L => (L.curio || []).map(c => [c[3], c[4]])));
export const FOGLIE = ["piazza", "radici", "arco", "casamira", "casanonna"];

export const SCOPERTE = {
  brocca: {titolo: "La brocca che suda", ep: "ep-001", pagina: 7,
    testo: "La terracotta ha buchini piccolissimi: un po' d'acqua esce e vola via nell'aria. È come se ogni gocciolina si portasse via un pezzetto di caldo. Lo smalto chiude i buchini.",
    parlarne: "E tu? Perché senti freschino quando esci dall'acqua e c'è un po' di vento?",
    vero: "La terracotta non smaltata è porosa: un po' d'acqua attraversa la parete ed evapora all'esterno. Per evaporare l'acqua ha bisogno di energia, e la prende dall'acqua rimasta dentro, che così si raffredda. Funziona meglio con aria secca e in movimento; con aria molto umida raffredda poco. Una brocca smaltata non raffredda, perché i pori sono chiusi. È lo stesso principio del sudore.",
    disegno: `<svg viewBox="0 0 100 100" class="dis"><path d="M30 18 q20 -6 40 0 M50 18 v6" stroke="#6b4a2c" stroke-width="3" fill="none"/><path d="M40 26 q-3 5 3 9 q-24 15 -20 46 q4 16 27 17 q23 -1 27 -17 q4 -31 -20 -46 q6 -4 3 -9 z" fill="#d9894f" stroke="#7d4220" stroke-width="2.5"/><g fill="#9cd0ee" stroke="#4f8fb8" stroke-width="1"><ellipse cx="38" cy="60" rx="2.5" ry="3.4"/><ellipse cx="55" cy="52" rx="2.5" ry="3.4"/><ellipse cx="62" cy="72" rx="2.5" ry="3.4"/><ellipse cx="44" cy="80" rx="2.5" ry="3.4"/></g><path d="M74 50 q8 -6 4 -14 M80 62 q8 -6 4 -14" stroke="#8fb7d3" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
    indizi: () => [[F().gocce, "Le brocche di terracotta «sudano»: sono piene di goccioline fuori."], [F().gocce, "Quando l'aria è appiccicosa restano meno fresche."], [F().bmira, "La brocca smaltata di Mira è liscia, asciutta… e tiepida."], [F().labBrocca, "Al vento e con l'aria secca l'acqua diventa freschissima."]]},
  eco: {titolo: "La radice che risponde", ep: "ep-003", pagina: 19,
    testo: "È come se la voce fosse una palla: va, sbatte sulla parete dura e torna indietro. Se la parete è lontana ci mette di più. Il muschio è morbido: la voce ci affonda dentro.",
    parlarne: "Dove ti è capitato di sentire l'eco? Com'era fatto quel posto?",
    vero: "L'eco è un suono che rimbalza su una superficie e torna a chi ascolta con un ritardo. Le superfici dure e lisce riflettono bene il suono; quelle morbide o ruvide lo assorbono o lo sparpagliano. Il suono nell'aria viaggia a circa 340 metri al secondo. Per sentire l'eco ben separata dalla voce serve un ritardo di circa un decimo di secondo: la parete deve essere ad almeno 17 metri circa (da riverificare prima della pubblicazione).",
    disegno: `<svg viewBox="0 0 100 100" class="dis"><circle cx="22" cy="58" r="9" fill="#f3c9a0" stroke="#7d4220" stroke-width="2"/><path d="M80 10 q-8 40 0 88 h18 v-88 z" fill="#8a5a33" stroke="#5a3a20" stroke-width="2"/><g fill="none" stroke="#b8652f" stroke-width="2.5" stroke-linecap="round"><path d="M36 48 q5 10 0 20"/><path d="M46 42 q8 16 0 32"/><path d="M56 36 q11 22 0 44"/></g><g fill="none" stroke="#5d8fc9" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"><path d="M70 40 q-9 18 0 36"/><path d="M62 46 q-6 12 0 24"/></g></svg>`,
    indizi: () => { const e = F().eco || {}; return [[e.lontano, "Da lontano la Radice Cava risponde dopo un po'."], [e.vicino, "Da vicino la voce torna subito, quasi insieme."], [e.muschio, "Verso il muschio morbido non torna niente."]]; }}
};

/* i 12 episodi del volume 1 (dal registro): giocabili quelli con un'avventura pronta */
export const EPISODI = [
  ["ep-001", "La brocca che suda", "Radici", 7, "brocca"], ["ep-002", "La strada d'argento", "Radici", 13], ["ep-003", "La radice che risponde", "Radici", 19, "eco"],
  ["ep-004", "Il passaparola", "Radici", 25], ["ep-005", "La fontana di tutti", "Radici", 31], ["ep-006", "Il sentiero delle Felci", "Sottobosco", 37],
  ["ep-007", "Le lanterne che parlano", "Sottobosco", 43], ["ep-008", "Gli anelli della Tempesta", "Radici", 49], ["ep-009", "L'aquilone che girava", "Radici", 55],
  ["ep-010", "Pico e la faccia giusta", "Radici", 61], ["ep-011", "Tobia e il buio", "Sottobosco", 67], ["ep-012", "L'ascensore di linfa", "Sottobosco", 73]
];

/* ======================== obiettivi ======================== */
export function obiettivo() {
  const f = F();
  if (!f.intro) return null;
  if (!f.taccuino) return {t: f.luce ? "Prendi quello che brilla nella fessura" : "Pico è volato tra le radici: inseguilo!", dove: "radici"};
  if (!f.gocce) return {t: "Vai all'Arco del Vento: Tobia è lì con la sua lente", dove: "arco"};
  if (!f.bmira) return {t: "Chiedi a Mira della sua brocca nuova", dove: "casamira"};
  if (!f.capito) return {t: "All'Arco: guarda la brocca di Mira accanto alle altre", dove: "arco"};
  if (!S.scoperte.includes("brocca")) return {t: "Scrivi la scoperta nel taccuino", dove: null, scrivi: true};
  if (!f.finale) return {t: "Il Faro brilla! Raccontalo a Nonna Tessa", dove: "piazza"};
  if (!f.libro) return {t: "Guarda il libro delle storie, a casa della Nonna", dove: "casanonna"};
  if (!f.a2) return {t: "Nonna Tessa vorrebbe raccontarti ancora qualcosa", dove: "piazza"};
  if (!f.a2arr) return {t: "Cerca il prato della Radice Cava, ai margini del Borgo", dove: "prato"};
  if (!f.ecoProvato) return {t: "Guarda verso la grande Radice e premi 📣 Grida!", dove: "prato"};
  if (!f.ecoCapito) return {t: "Fai le prove con Bip: tocca Bip in alto a destra", dove: null, lab: true};
  if (!S.scoperte.includes("eco")) return {t: "Scrivi la seconda scoperta nel taccuino", dove: null, scrivi: true};
  if (!f.a2finale) return {t: "Il Faro brilla più forte! Raccontalo a Nonna Tessa", dove: "piazza"};
  return {t: `Esplora il Borgo: foglie d'oro ${Object.keys(S.foglie).length}/5 · curiosità ${Object.keys(S.curio).length}/7`, dove: null};
}
export function chiama(k) {
  const f = F();
  if (k === "nonna") return (f.intro && !f.taccuino && false) || (S.scoperte.includes("brocca") && !f.finale) || (f.libro && !f.a2) || (S.scoperte.includes("eco") && !f.a2finale);
  if (k === "tobia") return f.taccuino && !f.gocce;
  if (k === "mira") return (f.gocce && !f.bmira) || (f.bmira && !f.capito && M.qui === "arco");
  return false;
}
export function aggiornaHud() {
  const o = obiettivo(), ob = $("#obiettivo");
  ob.innerHTML = o ? `<span class="st">★</span><span>${o.t}</span>${o.scrivi ? `<button class="btn verde piccolo" id="scrivi">📒 Scrivi</button>` : ""}${o.lab ? `<button class="btn piccolo" id="vaiLab">🔬 Prove</button>` : ""}` : "";
  ob.onclick = () => { if (!occupato()) aiutoBip(); };
  const s = $("#scrivi"); if (s) s.onclick = ev => { ev.stopPropagation(); scriviScoperta(); };
  const l = $("#vaiLab"); if (l) l.onclick = ev => { ev.stopPropagation(); labEco(); };
  $("#bTaccuino").hidden = !F().taccuino;
  $("#bTaccuino").classList.toggle("nota", !!o && !!o.scrivi);
  $("#bMappa").hidden = !F().intro;
  for (const e of document.querySelectorAll(".faroC b")) e.textContent = S.scoperte.length;
  aggiornaGrida(); aggiornaChiamate(); salva();
}

/* ======================== oggetti speciali nei luoghi ======================== */
let picoRadici = null;
export function extra(id) {
  const f = F();
  if (id === "radici" && !f.taccuino && f.intro) picoRadici = aggiungiPersona("pico", 2060, 470, 240);
  if (id === "radici" && f.luce && !f.taccuino) bagliore(punto(1808, 880, RAGGIO * .96), 1.4, .95);
  if (id === "arco" && f.gocce) for (let k = 0; k < 54; k++) goccia(punto([1460, 1610, 1760, 1910, 2060, 2210][k % 6] + (Math.random() - .5) * 95, 785 + Math.random() * 115, RAGGIO * .97));
  if (id === "arco" && f.bmira) { const piede = punto(2330, 1030, RAGGIO * .93), testa = punto(2330, 870, RAGGIO * .93); spriteTex("broccaMira", piede, testa.y - piede.y, {tipo: "tocca", fai: () => usa("brocche")}); }
}

/* ======================== personaggi ======================== */
const parlaOpz = {parla: chi => M.parlante = chi};
const dire = (b, opz) => dialogo(b, Object.assign({}, parlaOpz, opz));
export async function parla(chi) {
  const f = F(), brocca = S.scoperte.includes("brocca"), eco = S.scoperte.includes("eco");
  if (chi === "nonna") {
    if (brocca && !f.finale) { f.finale = true; await dire([["nonna", "Ho visto il Faro brillare lassù! Allora il perché… non era perso per sempre.", "n6"], ["nonna", "E tu? Perché senti freschino quando esci dall'acqua, e c'è un po' di vento?", "n7"]]); await perParlarne("brocca"); return aggiornaHud(); }
    if (eco && !f.a2finale) { f.a2finale = true; await dire([["nonna", "Ho visto il Faro brillare ancora più forte!", null], ["nonna", "E tu? Dove ti è capitato di sentire l'eco?… Com'era fatto quel posto?", "e13"]]); await perParlarne("eco"); return aggiornaHud(); }
    if (f.libro && !f.a2) { f.a2 = true; await dire([["nonna", "Ai margini del Borgo c'è un prato grande… Lì, la Radice Cava ha una voce tutta sua.", "e14"]]); ridisegna(); toast("🗺️ Nuovo luogo: il prato della Radice Cava"); return aggiornaHud(); }
    if (f.finale && !f.libro) return dire([["nonna", "Entra pure in casa, tesoro. Il libro delle storie è sul leggio.", "n8"]]);
    if (f.a2 && !eco) return dire([["nonna", "Ai margini del Borgo c'è un prato grande… Lì, la Radice Cava ha una voce tutta sua.", "e14"]]);
    const o = obiettivo();
    const c = {radici: ["Pico vola sempre tra le radici grosse, a sinistra della piazza… Lì sotto, però, è buio.", "n1"], arco: f.gocce ? ["La brocca nuova di Mira… chissà se fa come le altre.", "n4"] : ["Tobia è all'Arco del Vento, con la sua lente. Guardate le brocche da vicino!", "n2"], casamira: ["Mira ha lasciato la sua brocca nuova in casa. È un po' distratta, sai…", "n3"]};
    const [t, v] = (o && c[o.dove]) || ["Scrivi tutto nel taccuino, Leo.", "n5"];
    return dire([["nonna", t, v]]);
  }
  if (chi === "pico" && (M.qui === "prato")) return dire([["pico", "Cra! Cra!", "pico", "Pico gonfia le piume: «È lo Spirito Brontolone! Ripete tutto quello che dici!»"]]);
  if (chi === "pico") return dire([["pico", "Cra! Cra!", "pico"], ["bip", "Ride di noi! Guardiamo nella fessura qui sotto.", "r9"]]);
  if (chi === "tobia") {
    if (!f.taccuino) return dire([["tobia", "Ciao Leo! Pico è passato di qui a tutta velocità, verso le radici.", "t1"]]);
    if (!f.gocce) { f.gocce = true; await dire([["tobia", "Guarda con la mia lente: fuori dalle brocche ci sono goccioline piccolissime…", "t2", "", () => { ridisegna(); guardaVerso(1840); }], ["tobia", "Sùdano!", "t3"], ["tobia", "Quando l'aria è appiccicosa, però, restano meno fresche.", "t4"]]); toast("🔍 Nuovo indizio nel taccuino"); return aggiornaHud(); }
    return dire([brocca ? ["tobia", "Il Faro! Non l'avevo mai visto acceso!", "t6"] : ["tobia", "Chissà cosa fa la brocca nuova di Mira…", "t5"]]);
  }
  if (chi === "mira" && (M.qui === "prato" || M.qui === "radicecava")) {
    if (f.ecoCapito) return dire([["mira", "C'è la tua voce, che torna a trovarti!", "e9"]]);
    if (f.eco && f.eco.muschio) return dire([["mira", "Lo Spirito non ama il muschio?", "e6"]]);
    return dire([["mira", "Ehi!", "e1", "Mira grida verso la Radice. Prova anche tu con 📣 Grida!", () => ecoDopo("e1", "lontano")]]);
  }
  if (chi === "mira") {
    if (!f.gocce) return dire([["mira", "Ciao Leo! Ho una brocca nuova bellissima, l'ho presa da un mercante di passaggio!", "m1"]]);
    if (!f.bmira) { f.bmira = true; await dire([["mira", "Bleah! È tiepida!", "m2"], ["mira", "Eppure è la più bella di tutte: smaltata, lucida… La porto all'Arco, vicino alle altre!", "m3"]]); toast("🔍 Nuovo indizio nel taccuino"); ridisegna(); return aggiornaHud(); }
    if (M.qui === "arco" && !f.capito) return usa("brocche");
    return dire([brocca ? ["mira", "E lo smalto i buchini li chiude! L'ho capito io, eh!", "m5"] : ["mira", "Ci vediamo all'Arco!", "m4"]]);
  }
}

/* ======================== cose ======================== */
export async function usa(id) {
  const f = F();
  if (id === "fessura") {
    if (!f.luce) return dire([["leo", "È troppo buio qui sotto, non si vede niente…", "r2"], ["bip", "Ci penso io! Accendo la mia luce!", "r3", "", () => { f.luce = true; ridisegna(); suono.tintinnio(); }], ["bip", "Guarda! C'è la tua matita… e accanto un piccolo taccuino di corteccia!", "r4"]]);
    f.taccuino = true; suono.tintinnio();
    await dire([["leo", "La mia matita! E questo… un taccuino con un faro disegnato sopra.", "r5"], ["leo", "Le pagine sono tutte bianche.", "r6"]]);
    await premio("📒", "Il taccuino di Leo!", "Un taccuino di corteccia con un faro sulla copertina. Ogni volta che capisci il <b>perché</b> di qualcosa, scrivilo qui!");
    ridisegna(); aggiornaHud();
    return dire([["bip", "Allora riempiamolo! Andiamo all'Arco del Vento, da Tobia.", "r7"]]);
  }
  if (id === "broccaMira") return parla("mira");
  if (id === "bipLampada") { f.bipLampada = "fuori"; await dire([["bip", "Ehi, guarda lassù: c'è una lanterna che mi somiglia! Ah no… sono io, mi ero appeso per fare luce!", "m6"]]); return ridisegna(); }
  if (id === "cancello") return dire([["bip", "Dietro questo cancello ci sono le Felci Alte. Qui comincerà la prossima avventura…", "g1"], ["leo", "Allora torniamo presto con il taccuino!", "g2"]]);
  if (id === "libro") {
    if (!S.scoperte.includes("brocca")) return dire([["bip", "Il libro delle storie della Nonna! Le pagine sul perché delle cose… sono tutte sbiadite.", "c1"], ["leo", "Forse, se il Faro torna a brillare, anche le storie torneranno.", "c2"]]);
    if (!f.libro) { f.libro = true; suono.tintinnio(); await dire([["bip", "Guarda! Una pagina è tornata leggibile: parla di brocche e di vento!", "c3"]]); toast("📖 Una pagina del libro è tornata!"); return aggiornaHud(); }
    return dire([["bip", "Guarda! Una pagina è tornata leggibile: parla di brocche e di vento!", "c3"]]);
  }
  if (id === "brocche") {
    if (!f.gocce) return dire([["leo", "Sono fresche e un po' umide… ma per capire bisogna guardarle da vicino. Tobia ha la lente!", "b1"]]);
    if (!f.bmira) return dire([["leo", "Sono piene di goccioline. E la brocca nuova di Mira? Andiamo a chiederle!", "b2"]]);
    if (f.capito) return dire([["leo", "Le brocche sudano, e l'acqua resta fresca. Adesso sappiamo perché!", "b5"]]);
    await dire([["leo", "Le brocche di terracotta sono piene di goccioline. Quella di Mira è liscia e asciutta…", "b3"], ["bip", "Perché la tua è calda, e le altre no?", "b4"], ["bip", "Facciamo delle prove nel mio laboratorio! Così scopriamo cosa conta davvero.", "l0"]]);
    return labBrocca();
  }
}
async function labBrocca() {
  const ok = await apriLabBrocca();
  if (!ok) return aggiornaHud();
  F().labBrocca = true; aggiornaHud();
  return domandaBrocca();
}
async function domandaBrocca() {
  for (;;) {
    const r = await domanda("bip", "Allora, Leo: perché la brocca di terracotta resta fresca?", "q1", mescola([
      ["Un po' d'acqua esce dai buchini della terracotta e vola via nell'aria: è come se ogni gocciolina si portasse via un pezzetto di caldo.", "giusta"],
      ["Perché il vento è sempre freddo.", "vento"], ["Perché la terracotta è magica.", "magia"]]));
    if (r === "giusta") break;
    suono.sbaglio();
    await dire([["bip", r === "vento" ? "Ma anche la brocca di Mira è qui al vento… ed è tiepida!" : "Uhm… proviamo a spiegarlo senza magia. Ripensa alle goccioline!", r === "vento" ? "q5" : "q6"]]);
  }
  F().capito = true; aggiornaHud();
  await dire([["leo", "La terracotta ha dei buchini piccolissimi! Un po' d'acqua esce, e il vento la porta via. È come se ogni gocciolina si portasse via un pezzetto di caldo!", "q2"], ["mira", "E lo smalto i buchini li chiude!", "q3"], ["bip", "Presto, Leo: apri il taccuino e scrivilo!", "q4"]]);
  return scriviScoperta();
}

/* ======================== scrivere nel taccuino e accendere il Faro ======================== */
export async function scriviScoperta() {
  const f = F(), id = f.capito && !S.scoperte.includes("brocca") ? "brocca" : f.ecoCapito && !S.scoperte.includes("eco") ? "eco" : null;
  if (!id) return apriTaccuino();
  const letto = await apriTaccuino({scrivi: id});
  if (!letto) return aggiornaHud();
  S.scoperte.push(id); salva();
  await celebraFaro(id);
  lampo(400); schermo("borgo"); ridisegna(); aggiornaHud();
  if (id === "eco" && M.qui === "prato") setTimeout(() => { suono.voce("pico"); ecoDopo("pico", "lontano"); fumetto("pico", "CRA! … CRA!"); }, 900);
}
async function perParlarne(id) {
  const s = SCOPERTE[id];
  await new Promise(fine => {
    const fin = finestra("finPiano", "💬 Per parlarne insieme", `<div style="font-size:20px;font-weight:700;line-height:1.35">${s.parlarne}</div>
      <details><summary>Il vero perché (per i grandi)</summary><p style="margin-top:6px;line-height:1.45">${s.vero}</p></details>
      ${id === "eco" ? `<p style="font-size:14px;opacity:.75;margin-top:10px">Fine dell'avventura 2. Le prossime avventure arriveranno con il libro!</p>` : ""}
      <div class="azioni"><button class="btn verde" id="contEspl">Continua a esplorare ▸</button></div>`, {chiusa: fine});
    $("#contEspl").onclick = () => fin.chiudi();
  });
}

/* ======================== foglie d'oro e curiosità ======================== */
export async function foglia(o) {
  S.foglie[M.qui] = true; suono.tintinnio(); togli(o); salva();
  const n = Object.keys(S.foglie).length; aggiornaHud();
  await dire([n === 5 ? ["bip", "Tutte e cinque le foglie d'oro! Sei un vero esploratore!", "o3"] : n === 1 ? ["bip", "Una foglia d'oro! Chissà quante ce ne sono nel Borgo…", "o1"] : ["bip", `Un'altra foglia d'oro! (${n} su 5)`, "o2"]]);
  if (n === 5) premio("🍂", "Tutte le foglie d'oro!", "Hai esplorato ogni angolo del Borgo delle Radici.");
}
export async function curio(u) {
  if (!S.curio[u.chiave]) { S.curio[u.chiave] = true; suono.tintinnio(); salva(); }
  await dire([[u.chi, u.testo, u.v]]);
  toast(`🔍 Curiosità ${Object.keys(S.curio).length} su 7 · nel taccuino`);
}

/* ======================== arrivi ======================== */
export function arrivato(id) {
  const f = F();
  if (id === "prato" && f.a2 && !f.a2arr) {
    f.a2arr = true; ridisegna(); aggiornaHud();
    dire([
      ["mira", "Ehi!", "e1", "", () => ecoDopo("e1", "lontano")],
      ["mira", "C'è qualcuno là!", "e2"],
      ["pico", "Cra! Cra!", "pico", "Pico gonfia le piume: «È lo Spirito Brontolone! Ripete tutto quello che dici!»"],
      ["leo", "Ciao, Spirito!", "e3", "", () => ecoDopo("e3", "lontano")],
      ["bip", "Perché risponde un po' dopo?", "e4"],
      ["bip", "Proviamo! Grida da lontano, da vicino… e anche verso il muschio!", "e7", "Guarda verso la grande Radice e usa il pulsante 📣 Grida!"]
    ]).then(aggiornaHud);
    return true;
  }
  if (id === "radici" && !f.taccuino && !f.vistoPico && f.intro) { f.vistoPico = true; dire([["pico", "Cra! Cra!", "pico", "Pico lascia cadere qualcosa nella fessura tra le radici e si mette a guardare dall'alto, soddisfatto."]]); return true; }
  return false;
}

/* ======================== Bip, aiuto! ======================== */
export async function aiutoBip() {
  if (occupato()) return;
  const o = obiettivo();
  if (!o) return dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", "Esploriamo!", null]]);
  if (o.scrivi) { await dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", "Hai capito il perché! Scriviamolo nel taccuino.", null]]); return scriviScoperta(); }
  if (o.lab) return labEco();
  if (!o.dove || o.dove === M.qui) return dire([["bip", "Uhm… vediamo un po'.", "h0"], ["bip", o.t + ". Guardati intorno: è qui vicino!", null]]);
  const r = await domanda("bip", `${o.t}. Ti accompagno io?`, "h0", [["Sì, andiamo insieme! 🏃", "si"], ["No, la trovo da solo 🔍", "no"]]);
  if (r === "si") vaiA(o.dove);
}

/* ======================== la mappa del Borgo ======================== */
export function apriMappa() {
  const pos = Object.fromEntries(Object.entries(POSMAPPA).filter(([k]) => F().a2 || !["prato", "radicecava"].includes(k)));
  const archi = []; for (const [k, L] of Object.entries(LUOGHI)) if (pos[k]) for (const u of L.uscite) if ((!u.se || u.se()) && pos[u.verso] && k < u.verso) archi.push([pos[k], pos[u.verso]]);
  const o = obiettivo();
  const f = finestra("finMappa", "🗺️ Il Borgo delle Radici", `<div style="font-size:14px;margin-bottom:6px">Tocca un luogo per andarci.</div>
    <div class="mappa"><svg viewBox="0 0 100 57" preserveAspectRatio="none">${archi.map(([[px, py], [x, y]]) => `<path d="M${px} ${py * .57} Q${(px + x) / 2 + 5} ${(py + y) / 2 * .57 - 5} ${x} ${y * .57}" stroke="#c9a36b" stroke-width="1.1" stroke-dasharray="2 1.5" fill="none"/>`).join("")}</svg>
    ${Object.entries(pos).map(([k, [x, y]]) => `<button class="nodo ${k === M.qui ? "qui" : ""} ${S.visti[k] ? "" : "ignoto"}" data-k="${k}" style="left:${x}%;top:${y}%"><span class="im" style="background-image:url(img/mini-${k}.webp)"></span><span class="t">${NOMIMAPPA[k]}${o && o.dove === k ? " ★" : ""}</span></button>`).join("")}</div>`, {largo: true});
  f.querySelectorAll(".nodo").forEach(b => b.onclick = () => { const k = b.dataset.k; f.chiudi(); if (k !== M.qui) setTimeout(() => vaiA(k), 150); });
}

/* ======================== l'eco della Radice Cava (nel mondo) ======================== */
const RITARDI = {lontano: [[.62, .5], [1.24, .18]], vicino: [[.06, .45], [.12, .22]]};
async function ecoDopo(n, tipo) {
  const b = await suono.carica(n), d = b ? b.duration : .6, L = LUOGHI[M.qui];
  suono.eco(n, RITARDI[tipo].map(([dl, g]) => [d + dl - (tipo === "vicino" ? d * .85 : 0), g]));
  if (L.parete) onda(tipo, d, undefined, L.parete[0]);
}
function aggiornaGrida() { const L = LUOGHI[M.qui]; $("#grida").classList.toggle("on", !!(L && L.eco && F().a2arr)); }
let gridando = false;
export async function grida() {
  if (occupato() || gridando || M.inCammino) return; gridando = true; setTimeout(() => gridando = false, 2400);
  const L = LUOGHI[M.qui], dP = Math.abs(angDiff(M.yaw, yawDi(L.parete[0]))), dM = L.muschio ? Math.abs(angDiff(M.yaw, yawDi(L.muschio[0]))) : 9;
  let tipo = "spalle";
  if (L.muschio && dM < L.muschio[1]) tipo = "muschio"; else if (dP < L.parete[1]) tipo = L.eco;
  suono.voce("e5"); const b = await suono.carica("e5"); const d = b ? b.duration : .5;
  if (tipo === "lontano" || tipo === "vicino") ecoDopo("e5", tipo); else onda(tipo, d * .5, tipo === "muschio" ? L.muschio[0] : undefined, L.parete[0]);
  await aspetta((d + (tipo === "lontano" ? 1.5 : .9)) * 1000);
  if (tipo === "spalle") return fumetto("bip", "Di spalle alla parete, la voce non torna indietro. Girati verso la Radice!", "e17");
  if (tipo === "muschio") fumetto("bip", "Verso il muschio… niente. Silenzio.", "e16");
  else fumetto("bip", "Da lontano la voce torna dopo un po'. Da vicino, torna subito!", "e15");
  const e = F().eco = F().eco || {}; const nuova = !e[tipo]; e[tipo] = true; if (nuova) suono.tintinnio();
  if (!F().ecoProvato) { F().ecoProvato = true; aggiornaHud(); await aspetta(4200); if (!occupato() && !F().ecoCapito) labEco(); }
  else aggiornaHud();
}
async function labEco() {
  if (occupato()) return;
  await dire([["bip", "Facciamo delle prove nel mio laboratorio! Così scopriamo cosa conta davvero.", "l0"]]);
  const ok = await apriLabEco();
  if (!ok) return aggiornaHud();
  for (;;) {
    const r = await domanda("bip", "Allora, Leo: perché la Radice risponde?", "e10", mescola([
      ["È come se la voce fosse una palla: va, sbatte sulla parete dura e torna indietro. Più la parete è lontana, più ci mette. Il muschio è morbido e la voce ci affonda.", "giusta"],
      ["C'è uno Spirito Brontolone che ripete tutto.", "spirito"], ["La parete è magica.", "magia"]]));
    if (r === "giusta") break;
    suono.sbaglio();
    await dire([["bip", r === "spirito" ? "Ma allora perché, verso il muschio, non risponde nessuno?" : "Uhm… ripensa a quando eri lontano, e a quando eri vicino!", r === "spirito" ? "e11" : "e12"]]);
  }
  F().ecoCapito = true; aggiornaHud();
  await dire([["leo", "È come se la voce fosse una palla! Va, sbatte sulla parete dura e torna indietro. Se la parete è lontana, ci mette di più. Il muschio invece è morbido: la voce ci affonda dentro.", "e8"], ["mira", "C'è la tua voce, che torna a trovarti!", "e9"], ["bip", "Presto, Leo: apri il taccuino e scrivilo!", "q4"]]);
  return scriviScoperta();
}
export function fumetto(chi, testo, v) {
  const f = $("#fumetto"); f.querySelector(".av").style.backgroundImage = `url(img/av-${AV[chi]}.webp)`; f.querySelector(".t").textContent = testo; f.classList.add("on");
  if (v) { M.parlante = chi; suono.voce(v); }
  clearTimeout(fumetto.h); fumetto.h = setTimeout(() => f.classList.remove("on"), 4600);
}

/* ======================== l'inizio della storia ======================== */
export async function intro() {
  guardaVerso(2650);
  await dire([
    ["leo", "Nonna, perché le brocche le appendiamo sempre all'Arco del Vento?", "i1"],
    ["nonna", "Si è sempre fatto così, tesoro… Ma il perché… l'abbiamo perso.", "i2"],
    ["pico", "Cra! Cra!", "pico", "Pico afferra la matita di Leo e vola via verso le grandi radici!", volaPico],
    ["leo", "Ehi! La mia matita!", "i4"],
    ["bip", "Inseguiamolo! Trascina per guardarti intorno, e tocca il cerchio delle radici.", "i5", "Se ti perdi, apri la 🗺️ Mappa o tocca Bip in alto a destra."]
  ]);
  F().intro = true; aggiornaHud();
}
function volaPico() {
  const s = sprite("pico", .9); aggiungi(s); let k = 0;
  const da = punto(2900, 640, RAGGIO * .75), a = punto(1950, 520, RAGGIO * .75);
  const vola = () => { k += .009; s.position.lerpVectors(da, a, Math.min(1, k)); s.position.y += Math.sin(k * Math.PI) * .35; s.material.rotation = Math.sin(k * 30) * .15; s.material.opacity = 1 - Math.max(0, k - .8) * 5; if (k < 1) requestAnimationFrame(vola); else togli(s); };
  vola();
}

export const storia = {LUOGHI, PRIMO, RAGGI, ALATI, NOMI, parla, usa, arrivato, chiama, extra, aggiornaHud, foglia, curio};
