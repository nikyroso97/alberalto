/* STORIA · ep-002 «La strada d'argento» (episodio libero, Radici)
   Fatto: catalogo/chiocciole-e-umidita (verificato). Battute senza voce: si doppiano più avanti. */
export default {
  id: "chiocciole", ep: "ep-002", titolo: "La strada d'argento", piano: "Radici", pagina: 13,
  richiede: ["brocca"],

  scoperta: {
    titolo: "La strada d'argento",
    testo: "Le chiocciole hanno bisogno di umido. Col sole chiudono il guscio con una porticina sottile: è come se chiudessero la porta di casa per non far scappare l'acqua. Con le nuvole e la pioggia escono. La scia d'argento è la loro bava che si asciuga.",
    parlarne: "Perché secondo te Tobia non ha voluto aprire la porticina della chiocciola?",
    vero: "Chiocciole e lumache hanno bisogno di umidità: sono più attive di notte e nelle giornate nuvolose o nebbiose, mentre con sole e caldo cercano riparo. Nei periodi secchi la chiocciola chiude il guscio con una membrana sottile di muco seccato (epifragma), che riduce la perdita d'acqua e si strappa facilmente se la si stacca a forza. La scia argentata è muco seccato. Meglio osservarle senza toccarle.",
    disegno: `<svg viewBox="0 0 100 100" class="dis"><path d="M8 82 q20 -6 40 0 t44 -2" stroke="#c9d4dc" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M30 76 q-2 -14 12 -18 q16 -3 18 12 q1 9 -9 10 q-8 0 -8 -7 q0 -5 5 -5" fill="#c98a4a" stroke="#7d4220" stroke-width="2.5"/><path d="M58 78 q10 0 16 -2 l4 -10 M74 76 l6 -10" stroke="#8a6a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="78" cy="65" r="2" fill="#3a2b20"/><circle cx="84" cy="65" r="2" fill="#3a2b20"/><path d="M14 30 q6 -10 16 -6 q4 -8 14 -4 q10 -2 10 8 q4 6 -4 9 h-32 q-8 -2 -4 -7z" fill="#e3e8ec" stroke="#9aa8b3" stroke-width="2"/><g stroke="#7fb6dc" stroke-width="2" stroke-linecap="round"><path d="M20 44 l-2 6"/><path d="M30 44 l-2 6"/><path d="M40 44 l-2 6"/></g></svg>`
  },
  indizi: [
    [f => f.scie >= 4, "Le strisce d'argento sono secche: chi le ha fatte non si vede col sole."],
    [f => f.chiusa, "Col sole le chiocciole chiudono il guscio con una porticina trasparente."],
    [f => f.aperte, "Con le nuvole aprono la porta, allungano le corna e partono."],
    [f => f.scia, "Dietro ogni chiocciola che cammina resta una scia lucida."]
  ],

  passi: [
    {fatto: f => f.e2inizio, t: "Torna in piazza: c'è qualcosa che luccica sui sassi", dove: "piazza"},
    {fatto: f => f.scie >= 4, t: f => `Cerca i folletti d'argento: tocca le strisce lucenti (${f.scie || 0} su 4)`, dove: f => ((f.scie || 0) - (f.scieQui || 0)) >= 2 ? "radici" : "piazza"},
    {fatto: f => f.capitoChiocciole, t: "Chiedi a Tobia: è all'Arco del Vento", dove: "arco", chiama: "tobia", nonna: ["Tobia conosce tutte le creature piccole del Borgo. Chiedi a lui!", null]},
    {fatto: (f, S) => S.scoperte.includes("chiocciole"), t: "Scrivi la scoperta nel taccuino", scrivi: true},
    {fatto: f => f.finaleChiocciole, t: "Raccontalo a Tobia, all'Arco del Vento", dove: "arco", chiama: "tobia"}
  ],

  persone: {piazza: [{chi: "pico", x: 1990, y: 1080, h: 250, se: f => f.e2inizio && !f.capitoChiocciole}]},
  scena: {
    piazza: [
      {tipo: "cerca", id: "s1", img: "scia", x: 1700, y: 1170, h: 95, se: f => f.e2inizio},
      {tipo: "cerca", id: "s2", img: "scia", x: 2420, y: 1140, h: 90, se: f => f.e2inizio}
    ],
    radici: [
      {tipo: "cerca", id: "s3", img: "scia", x: 1500, y: 1080, h: 95, se: f => f.e2inizio},
      {tipo: "cerca", id: "s4", img: "scia", x: 2150, y: 1010, h: 90, se: f => f.e2inizio}
    ]
  },

  regole: [
    {su: "arrivo:piazza", se: (f, S) => S.scoperte.includes("brocca") && f.libro && !f.e2inizio, fai: [{regola: "inizio"}]},
    {su: "ingresso", se: (f, S) => S.scoperte.includes("brocca") && f.libro && !f.e2inizio, fai: [{regola: "inizio"}]},
    {su: "inizio", fai: [
      {set: "e2inizio"}, {ridisegna: true},
      ["bip", "Leo, guarda! Dopo la pioggia di stanotte il Borgo luccica tutto…", null, "Sui sassi e sulle radici ci sono strisce d'argento, sottili e lucenti."],
      ["pico", "Cra! Sono le strade dei folletti d'argento! Passano di notte e scappano all'alba!", null],
      ["leo", "Folletti? Voglio vederli! Seguiamo le strisce!", null, "Tocca le strisce lucenti in piazza e tra le radici."]
    ]},
    {su: "trovato:scia", se: f => (f.scie || 0) < 4, fai: [
      {conta: "scie"}, {se: (f, S, M) => M.qui === "radici", fai: [{conta: "scieQui"}]},
      {se: f => f.scie === 1, fai: [["leo", "Una striscia d'argento! È ancora un po' lucida… ma di folletti, niente.", null]]},
      {se: f => f.scie === 2 || f.scie === 3, fai: [{toast: f => `✨ Striscia ${f.scie} su 4`}]},
      {se: f => f.scie >= 4, fai: [
        ["leo", "Ho cercato dappertutto, sotto il sole di mezzogiorno. Niente folletti. Solo strisce ormai secche.", null],
        ["bip", "Chi conosce le creature piccole meglio di tutti? Tobia! È all'Arco del Vento.", null],
        {toast: "🔍 Nuovo indizio nel taccuino"}
      ]}
    ]},
    {su: "persona:pico", se: f => !f.capitoChiocciole, fai: [["pico", "Cra! I folletti d'argento sono velocissimi. Non li prenderete mai!", null]]},
    {su: "persona:tobia", se: f => f.scie >= 4 && !f.capitoChiocciole, fai: [
      ["tobia", "Non escono col sole…", null, "Tobia, che non parla quasi mai, tira Leo per la manica."],
      ["tobia", "Vieni.", null, "E lo porta all'ombra, dove una radice fa un muretto fresco."],
      {lab: "chiocciole"}, {set: "labChiocciole"},
      {domanda: {chi: "bip", testo: "Allora, Leo: perché le chiocciole stanno chiuse quando c'è il sole?",
        giusta: "Hanno bisogno di umido: col secco chiudono il guscio con una porticina, per non far scappare l'acqua.",
        sbagliate: [["Perché hanno paura dei folletti.", [["bip", "Ma i folletti non li abbiamo mai visti! Ripensa al sole… e alle nuvole.", null]]],
                    ["Perché di giorno dormono sempre.", [["bip", "Però appena sono arrivate le nuvole si sono svegliate tutte!", null]]]]}},
      {set: "capitoChiocciole"},
      ["leo", "Bastava aspettare l'umido! È come se chiudessero la porta di casa per non far scappare l'acqua. E la strada d'argento è la loro bava che si asciuga.", null],
      ["tobia", "…sì.", null, "E Tobia sorride un po' più del solito."],
      ["bip", "Presto, Leo: apri il taccuino e scrivilo!", "q4"],
      {scrivi: "chiocciole"}
    ]},
    {su: "persona:tobia", se: f => f.e2inizio && !f.scie, fai: [["tobia", "Strisce d'argento?… Prima guardale bene.", null]]},
    {su: "persona:tobia", se: (f, S) => S.scoperte.includes("chiocciole") && !f.finaleChiocciole, fai: [
      ["tobia", "Le chiocciole tornano fuori ogni volta che arriva l'umido.", null],
      {set: "finaleChiocciole"}, {parlarne: "chiocciole"}
    ]}
  ]
};
