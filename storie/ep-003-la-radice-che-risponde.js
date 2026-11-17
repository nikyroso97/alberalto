/* STORIA · ep-003 «La radice che risponde» (episodio libero, Radici)
   Aggiunge due luoghi nuovi: il prato e la Radice Cava (panorami in img/). */
export default {
  id: "eco", ep: "ep-003", titolo: "La radice che risponde", piano: "Radici", pagina: 19,
  richiede: ["chiocciole"], iniziata: f => f.a2,

  scoperta: {
    titolo: "La radice che risponde",
    testo: "È come se la voce fosse una palla: va, sbatte sulla parete dura e torna indietro. Se la parete è lontana ci mette di più. Il muschio è morbido: la voce ci affonda dentro.",
    parlarne: "Dove ti è capitato di sentire l'eco? Com'era fatto quel posto?",
    vero: "L'eco è un suono che rimbalza su una superficie e torna a chi ascolta con un ritardo. Le superfici dure e lisce riflettono bene il suono; quelle morbide o ruvide lo assorbono o lo sparpagliano. Il suono nell'aria viaggia a circa 340 metri al secondo. Per sentire l'eco ben separata dalla voce serve un ritardo di circa un decimo di secondo: la parete deve essere ad almeno 17 metri circa (da riverificare prima della pubblicazione).",
    disegno: `<svg viewBox="0 0 100 100" class="dis"><circle cx="22" cy="58" r="9" fill="#f3c9a0" stroke="#7d4220" stroke-width="2"/><path d="M80 10 q-8 40 0 88 h18 v-88 z" fill="#8a5a33" stroke="#5a3a20" stroke-width="2"/><g fill="none" stroke="#b8652f" stroke-width="2.5" stroke-linecap="round"><path d="M36 48 q5 10 0 20"/><path d="M46 42 q8 16 0 32"/><path d="M56 36 q11 22 0 44"/></g><g fill="none" stroke="#5d8fc9" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"><path d="M70 40 q-9 18 0 36"/><path d="M62 46 q-6 12 0 24"/></g></svg>`
  },
  indizi: [
    [f => (f.eco || {}).lontano, "Da lontano la Radice Cava risponde dopo un po'."],
    [f => (f.eco || {}).vicino, "Da vicino la voce torna subito, quasi insieme."],
    [f => (f.eco || {}).muschio, "Verso il muschio morbido non torna niente."]
  ],

  passi: [
    {fatto: f => f.a2, t: "Nonna Tessa vorrebbe raccontarti ancora qualcosa", dove: "piazza", chiama: "nonna"},
    {fatto: f => f.a2arr, t: "Cerca il prato della Radice Cava, ai margini del Borgo", dove: "prato"},
    {fatto: f => f.ecoProvato, t: "Guarda verso la grande Radice e premi 📣 Grida!", dove: "prato"},
    {fatto: f => f.ecoCapito, t: "Fai le prove con Bip nel suo laboratorio", lab: "eco-prove"},
    {fatto: (f, S) => S.scoperte.includes("eco"), t: "Scrivi la scoperta nel taccuino", scrivi: true},
    {fatto: f => f.a2finale, t: "Il Faro brilla più forte! Raccontalo a Nonna Tessa", dove: "piazza", chiama: "nonna"}
  ],

  /* luoghi nuovi portati da questa storia */
  luoghi: {
    prato: {nome: "Il prato della Radice Cava", guarda: 2300, amb: "vento", ambVol: .75, effetto: "polline", se: f => f.a2,
      eco: "lontano", parete: [2250, .85], gridaSe: f => f.a2arr,
      uscite: [{verso: "piazza", x: 420, y: 1000, testo: "Torna in piazza"}, {verso: "radicecava", x: 2050, y: 860, testo: "Avvicinati alla Radice"}],
      persone: [], cose: [], luci: [[560, 560, .7], [980, 600, .6]],
      primo: [["fiori", 1100, "basso", 2.2, 1.35], ["fiori", 3000, "basso", 2.2, 1.3], ["ramo", 1900, "alto", 2.7, 2.2]],
      raggi: [1500, 3000], alati: {uccelli: true, farfalle: [[1300, 1200], [2600, 1150], [3100, 1250]]}, mappa: [70, 82, "Prato"]},
    radicecava: {nome: "Ai piedi della Radice Cava", guarda: 1700, amb: "vento", ambVol: .5, effetto: "polline", se: f => f.a2,
      eco: "vicino", parete: [1600, 1.0], muschio: [2560, .38], gridaSe: f => f.a2arr,
      uscite: [{verso: "prato", x: 3150, y: 950, testo: "Torna nel prato"}], persone: [], cose: [], luci: [],
      primo: [["fiori", 300, "basso", 2.2, 1.3], ["felce", 2950, "basso", 2.4, 2.2], ["ramo", 1300, "alto", 2.6, 2.0]],
      raggi: [2300], alati: {farfalle: [[2300, 1100]]}, mappa: [91, 70, "Radice Cava"]}
  },
  uscite: {piazza: [{verso: "prato", x: 1180, y: 930, testo: "Verso il prato", se: f => f.a2}]},
  persone: {
    prato: [{chi: "mira", x: 1650, y: 1250, h: 480, se: f => f.a2arr}, {chi: "pico", x: 980, y: 505, h: 230, ombra: false, se: f => f.a2arr}],
    radicecava: [{chi: "mira", x: 1050, y: 1230, h: 520, se: f => f.a2arr}]
  },

  regole: [
    {su: "persona:nonna", se: f => f.libro && !f.a2, fai: [
      ["nonna", "Ai margini del Borgo c'è un prato grande… Lì, la Radice Cava ha una voce tutta sua.", "e14"],
      {set: "a2"}, {ridisegna: true}, {toast: "🗺️ Nuovo luogo: il prato della Radice Cava"}
    ]},
    {su: "persona:nonna", se: (f, S) => f.a2 && !S.scoperte.includes("eco"), fai: [["nonna", "Ai margini del Borgo c'è un prato grande… Lì, la Radice Cava ha una voce tutta sua.", "e14"]]},
    {su: "arrivo:prato", se: f => f.a2 && !f.a2arr, fai: [
      {set: "a2arr"}, {ridisegna: true},
      ["mira", "Ehi!", "e1", "", {eco: ["e1", "lontano"]}],
      ["mira", "C'è qualcuno là!", "e2"],
      ["pico", "Cra! Cra!", "pico", "Pico gonfia le piume: «È lo Spirito Brontolone! Ripete tutto quello che dici!»"],
      ["leo", "Ciao, Spirito!", "e3", "", {eco: ["e3", "lontano"]}],
      ["bip", "Perché risponde un po' dopo?", "e4"],
      ["bip", "Proviamo! Grida da lontano, da vicino… e anche verso il muschio!", "e7", "Guarda verso la grande Radice e usa il pulsante 📣 Grida!"]
    ]},
    {su: "persona:pico", se: (f, S, M) => M.qui === "prato", fai: [["pico", "Cra! Cra!", "pico", "Pico gonfia le piume: «È lo Spirito Brontolone! Ripete tutto quello che dici!»"]]},
    {su: "persona:mira", se: (f, S, M) => (M.qui === "prato" || M.qui === "radicecava") && f.ecoCapito, fai: [["mira", "C'è la tua voce, che torna a trovarti!", "e9"]]},
    {su: "persona:mira", se: (f, S, M) => (M.qui === "prato" || M.qui === "radicecava") && (f.eco || {}).muschio, fai: [["mira", "Lo Spirito non ama il muschio?", "e6"]]},
    {su: "persona:mira", se: (f, S, M) => M.qui === "prato" || M.qui === "radicecava", fai: [["mira", "Ehi!", "e1", "Mira grida verso la Radice. Prova anche tu con 📣 Grida!", {eco: ["e1", "lontano"]}]]},
    /* il pulsante Grida! (nel mondo) manda l'evento grida con il tipo: lontano, vicino, muschio, spalle */
    {su: "evento:grida", se: (f, S, M, ev) => ev === "spalle", fai: [{fumetto: ["bip", "Di spalle alla parete, la voce non torna indietro. Girati verso la Radice!", "e17"]}]},
    {su: "evento:grida", fai: [
      {se: (f, S, M, ev) => ev === "muschio", fai: [{fumetto: ["bip", "Verso il muschio… niente. Silenzio.", "e16"]}], altrimenti: [{fumetto: ["bip", "Da lontano la voce torna dopo un po'. Da vicino, torna subito!", "e15"]}]},
      {fn: (ctx, ev) => { const e = ctx.f.eco = ctx.f.eco || {}; if (!e[ev]) ctx.suono.tintinnio(); e[ev] = true; }},
      {se: f => !f.ecoProvato, fai: [{set: "ecoProvato"}, {attendi: 4200}, {regola: "eco-prove"}]}
    ]},
    {su: "eco-prove", se: f => !f.ecoCapito, fai: [
      ["bip", "Facciamo delle prove nel mio laboratorio! Così scopriamo cosa conta davvero.", "l0"],
      {lab: "eco"},
      {domanda: {chi: "bip", testo: "Allora, Leo: perché la Radice risponde?", voce: "e10",
        giusta: "È come se la voce fosse una palla: va, sbatte sulla parete dura e torna indietro. Più la parete è lontana, più ci mette. Il muschio è morbido e la voce ci affonda.",
        sbagliate: [["C'è uno Spirito Brontolone che ripete tutto.", [["bip", "Ma allora perché, verso il muschio, non risponde nessuno?", "e11"]]],
                    ["La parete è magica.", [["bip", "Uhm… ripensa a quando eri lontano, e a quando eri vicino!", "e12"]]]]}},
      {set: "ecoCapito"},
      ["leo", "È come se la voce fosse una palla! Va, sbatte sulla parete dura e torna indietro. Se la parete è lontana, ci mette di più. Il muschio invece è morbido: la voce ci affonda dentro.", "e8"],
      ["mira", "C'è la tua voce, che torna a trovarti!", "e9"],
      ["bip", "Presto, Leo: apri il taccuino e scrivilo!", "q4"],
      {scrivi: "eco"},
      {se: (f, S, M) => M.qui === "prato", fai: [{attendi: 900}, {eco: ["pico", "lontano", true]}, {fumetto: ["pico", "CRA! … CRA!", null]}]}
    ]},
    {su: "persona:nonna", se: (f, S) => S.scoperte.includes("eco") && !f.a2finale, fai: [
      ["nonna", "Ho visto il Faro brillare ancora più forte!", null],
      ["nonna", "E tu? Dove ti è capitato di sentire l'eco?… Com'era fatto quel posto?", "e13"],
      {set: "a2finale"}, {parlarne: "eco"}
    ]}
  ]
};
