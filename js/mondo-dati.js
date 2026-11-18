/* Alberalto · il MONDO: i luoghi fissi del Borgo e le loro piccole cose.
   Le storie (cartella storie/) aggiungono persone, oggetti, uscite e luoghi nuovi.
   Coordinate in pixel sui panorami 3384×1536 (si trovano con editor.html). */
"use strict";

export const LUOGHI = {
  piazza: {nome: "La piazza del Borgo", guarda: 2470, amb: "borgo", effetto: "polline",
    uscite: [{verso: "radici", x: 250, y: 840, testo: "Tra le radici"}, {verso: "casamira", x: 1555, y: 860, testo: "Casa di Mira"},
      {verso: "arco", x: 3330, y: 800, testo: "Arco del Vento"}, {verso: "felci", x: 640, y: 960, testo: "Verso le Felci Alte"},
      {verso: "casanonna", x: 2470, y: 800, testo: "Casa della Nonna"}],
    persone: [{chi: "nonna", x: 2830, y: 1120, h: 470}], cose: [],
    luci: [[120, 280, .7], [540, 370, .7], [985, 175, .6], [1245, 335, .6], [1620, 180, .6], [2940, 230, .7], [3150, 300, .7], [2160, 670, 1.1, .35], [2740, 670, 1.1, .35], [760, 520, .9, .3]],
    foglia: [1720, 1060], curio: [[640, 820, "bip", "k1", "La bancarella del mercante! Oggi è chiusa… chissà cosa porterà la prossima volta."]]},
  radici: {nome: "Tra le grandi radici", guarda: 1800, amb: "borgo", ambVol: .6, effetto: "pulviscolo",
    uscite: [{verso: "piazza", x: 2800, y: 760, testo: "Torna in piazza"}], persone: [], cose: [],
    luci: [[2700, 540, .5], [2790, 560, .5], [620, 660, .8, .3]], foglia: [720, 1050], curio: [[1200, 1000, "leo", "k4", "Il muschio è morbido come un cuscino… e tiene l'umido."]]},
  arco: {nome: "L'Arco del Vento", guarda: 1840, amb: "vento", effetto: "foglie",
    uscite: [{verso: "piazza", x: 520, y: 900, testo: "Torna in piazza"}],
    persone: [{chi: "tobia", x: 1230, y: 1150, h: 440}], cose: [],
    luci: [[940, 605, .7], [2790, 585, .7]], foglia: [3040, 1170], curio: [[2700, 650, "bip", "k3", "Da qui si vedono le colline lontane. Il vento arriva proprio da lì!"]]},
  casamira: {nome: "La casa di Mira", guarda: 1900, amb: "casa", effetto: "pulviscolo", senzaBip: true,
    uscite: [{verso: "piazza", x: 3110, y: 800, testo: "Esci"}], persone: [],
    cose: [{id: "bipLampada", x: 2180, y: 330, testo: "Una lanterna?", se: f => !f.bipLampada}],
    luci: [[2180, 420, 1.3], [1100, 880, .8]], foglia: [300, 1120], curio: [[820, 600, "bip", "k5", "Quanti disegni appesi! Mira disegna tutto quello che vede."]]},
  felci: {nome: "Il cancello delle Felci Alte", guarda: 1790, amb: "vento", ambVol: .6, effetto: "lucciole",
    uscite: [{verso: "piazza", x: 170, y: 1150, testo: "Torna in piazza"}], persone: [],
    cose: [{id: "cancello", x: 1790, y: 880, testo: "Il cancello"}],
    luci: [[1440, 600, .9], [2150, 600, .9]], curio: [[870, 820, "leo", "k8", "Il cartello non ha scritte… come se qualcuno se le fosse dimenticate."]]},
  casanonna: {nome: "La casa di Nonna Tessa", guarda: 2470, amb: "casa", effetto: "pulviscolo",
    uscite: [{verso: "piazza", x: 3110, y: 800, testo: "Esci"}], persone: [],
    cose: [{id: "libro", x: 2470, y: 720, testo: "Il libro delle storie"}],
    luci: [[2120, 300, 1.0], [1100, 940, 1.6, .55, "fuoco"], [1270, 440, .7]], foglia: [2640, 1060],
    curio: [[1100, 900, "bip", "k6", "Il fuoco della Nonna si guarda da lontano: scalda tutta la casa."], [1790, 880, "bip", "k7", "Tazze e teiera… la Nonna aspetta sempre qualcuno per merenda!"]]}
};

/* elementi dipinti in primo piano: [immagine, x, alto/basso, distanza, altezza] */
export const PRIMO = {
  piazza: [["felce", 2050, "basso", 2.4, 2.3], ["fiori", 3080, "basso", 2.2, 1.3], ["ramo", 2620, "alto", 2.6, 2.1], ["felce", 330, "basso", 2.4, 2.2], ["fiori", 1180, "basso", 2.3, 1.25]],
  radici: [["felce", 1400, "basso", 2.3, 2.4], ["felce", 2280, "basso", 2.5, 2.2], ["ramo", 1900, "alto", 2.6, 1.9], ["fiori", 2700, "basso", 2.3, 1.2]],
  arco: [["fiori", 1330, "basso", 2.2, 1.35], ["fiori", 2420, "basso", 2.2, 1.25], ["ramo", 1640, "alto", 2.7, 2.2], ["felce", 620, "basso", 2.4, 2.2]],
  felci: [["felce", 1330, "basso", 2.3, 2.6], ["felce", 2260, "basso", 2.3, 2.5], ["fiori", 2750, "basso", 2.1, 1.2], ["ramo", 900, "alto", 2.6, 2.0]]
};
export const RAGGI = {piazza: [3050, 2350], radici: [1700, 2350], felci: [2600, 2850], arco: [2900]};
export const ALATI = {piazza: {uccelli: true, farfalle: [[2050, 1150], [3000, 1180]]}, arco: {uccelli: true, farfalle: [[1300, 1180], [2500, 1150], [3000, 1220]]}, felci: {farfalle: [[1500, 1150], [2200, 1150]]}, radici: {farfalle: [[1500, 1150]]}};

/* la mappa del Borgo: posizione in % e nome breve */
export const MAPPA = {felci: [14, 22, "Felci Alte"], casanonna: [50, 14, "Casa della Nonna"], radici: [12, 62, "Radici"], piazza: [50, 52, "Piazza"], arco: [86, 36, "Arco del Vento"], casamira: [32, 86, "Casa di Mira"]};

/* tesori sparsi nel mondo */
export const CURIO = {
  k1: {ic: "🛒", t: "La bancarella"}, k4: {ic: "🌿", t: "Il muschio"}, k3: {ic: "⛰️", t: "Le colline lontane"},
  k5: {ic: "🖍️", t: "I disegni di Mira"}, k6: {ic: "🔥", t: "Il fuoco della Nonna"}, k7: {ic: "🫖", t: "La merenda"}, k8: {ic: "🪧", t: "Il cartello muto"}
};
export const FOGLIE = ["piazza", "radici", "arco", "casamira", "casanonna"];

/* cose del mondo che non appartengono a nessuna storia */
export const COSE_MONDO = {
  bipLampada: [{set: "bipLampada", valore: "fuori"}, ["bip", "Ehi, guarda lassù: c'è una lanterna che mi somiglia! Ah no… sono io, mi ero appeso per fare luce!", "m6"], {ridisegna: true}],
  cancello: [["bip", "Dietro questo cancello ci sono le Felci Alte. Qui comincerà una delle prossime avventure…", null], ["leo", "Allora torniamo presto con il taccuino!", "g2"]],
  libro: [["bip", "Il libro delle storie della Nonna! Le pagine sul perché delle cose… sono tutte sbiadite.", "c1"], ["leo", "Forse, se il Faro torna a brillare, anche le storie torneranno.", "c2"]]
};
/* quello che dicono i personaggi quando nessuna storia ha qualcosa da fargli dire */
export const CHIACCHIERE = {
  nonna: [["nonna", "Scrivi tutto nel taccuino, Leo.", "n5"]],
  tobia: [["tobia", "Ciao Leo! Guarda quante creature piccole ci sono qui intorno…", null]],
  mira: [["mira", "Ciao Leo! Sto pensando a un aquilone nuovo…", null]],
  pico: [["pico", "Cra! Cra!", "pico"]]
};

/* i 12 episodi del volume 1 (dal registro episodi) */
export const EPISODI = [
  ["ep-001", "La brocca che suda", "Radici", 7], ["ep-002", "La strada d'argento", "Radici", 13], ["ep-003", "La radice che risponde", "Radici", 19],
  ["ep-004", "Il passaparola", "Radici", 25], ["ep-005", "La fontana di tutti", "Radici", 31], ["ep-006", "Il sentiero delle Felci", "Sottobosco", 37],
  ["ep-007", "Le lanterne che parlano", "Sottobosco", 43], ["ep-008", "Gli anelli della Tempesta", "Radici", 49], ["ep-009", "L'aquilone che girava", "Radici", 55],
  ["ep-010", "Pico e la faccia giusta", "Radici", 61], ["ep-011", "Tobia e il buio", "Sottobosco", 67], ["ep-012", "L'ascensore di linfa", "Sottobosco", 73]
];
