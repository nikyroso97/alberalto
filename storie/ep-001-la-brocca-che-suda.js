/* STORIA · ep-001 «La brocca che suda» (Faro 1, Radici)
   Come si legge: guida in 07_Gioco/COME-AGGIUNGERE-UNA-STORIA.md
   Battute: [chi, testo, voce registrata (o null), didascalia]. */
export default {
  id: "brocca", ep: "ep-001", titolo: "La brocca che suda", piano: "Radici", pagina: 7, faro: true,

  scoperta: {
    titolo: "La brocca che suda",
    testo: "La terracotta ha buchini piccolissimi: un po' d'acqua esce e vola via nell'aria. È come se ogni gocciolina si portasse via un pezzetto di caldo. Lo smalto chiude i buchini.",
    parlarne: "E tu? Perché senti freschino quando esci dall'acqua e c'è un po' di vento?",
    vero: "La terracotta non smaltata è porosa: un po' d'acqua attraversa la parete ed evapora all'esterno. Per evaporare l'acqua ha bisogno di energia, e la prende dall'acqua rimasta dentro, che così si raffredda. Funziona meglio con aria secca e in movimento; con aria molto umida raffredda poco. Una brocca smaltata non raffredda, perché i pori sono chiusi. È lo stesso principio del sudore.",
    disegno: `<svg viewBox="0 0 100 100" class="dis"><path d="M30 18 q20 -6 40 0 M50 18 v6" stroke="#6b4a2c" stroke-width="3" fill="none"/><path d="M40 26 q-3 5 3 9 q-24 15 -20 46 q4 16 27 17 q23 -1 27 -17 q4 -31 -20 -46 q6 -4 3 -9 z" fill="#d9894f" stroke="#7d4220" stroke-width="2.5"/><g fill="#9cd0ee" stroke="#4f8fb8" stroke-width="1"><ellipse cx="38" cy="60" rx="2.5" ry="3.4"/><ellipse cx="55" cy="52" rx="2.5" ry="3.4"/><ellipse cx="62" cy="72" rx="2.5" ry="3.4"/><ellipse cx="44" cy="80" rx="2.5" ry="3.4"/></g><path d="M74 50 q8 -6 4 -14 M80 62 q8 -6 4 -14" stroke="#8fb7d3" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`
  },
  indizi: [
    [f => f.gocce, "Le brocche di terracotta «sudano»: sono piene di goccioline fuori."],
    [f => f.gocce, "Quando l'aria è appiccicosa restano meno fresche."],
    [f => f.bmira, "La brocca smaltata di Mira è liscia, asciutta… e tiepida."],
    [f => f.labBrocca, "Al vento e con l'aria secca l'acqua diventa freschissima."]
  ],

  /* gli obiettivi, in ordine: è attivo il primo non ancora fatto */
  passi: [
    {fatto: f => f.taccuino, t: f => f.luce ? "Prendi quello che brilla nella fessura" : "Pico è volato tra le radici: inseguilo!", dove: "radici", nonna: ["Pico vola sempre tra le radici grosse, a sinistra della piazza… Lì sotto, però, è buio.", "n1"]},
    {fatto: f => f.gocce, t: "Vai all'Arco del Vento: Tobia è lì con la sua lente", dove: "arco", chiama: "tobia", nonna: ["Tobia è all'Arco del Vento, con la sua lente. Guardate le brocche da vicino!", "n2"]},
    {fatto: f => f.bmira, t: "Chiedi a Mira della sua brocca nuova", dove: "casamira", chiama: "mira", nonna: ["Mira ha lasciato la sua brocca nuova in casa. È un po' distratta, sai…", "n3"]},
    {fatto: f => f.capito, t: "All'Arco: guarda la brocca di Mira accanto alle altre", dove: "arco", nonna: ["La brocca nuova di Mira… chissà se fa come le altre.", "n4"]},
    {fatto: (f, S) => S.scoperte.includes("brocca"), t: "Scrivi la scoperta nel taccuino", scrivi: true},
    {fatto: f => f.finale, t: "Il Faro brilla! Raccontalo a Nonna Tessa", dove: "piazza", chiama: "nonna"},
    {fatto: f => f.libro, t: "Guarda il libro delle storie, a casa della Nonna", dove: "casanonna"}
  ],

  /* cose che la storia aggiunge ai luoghi */
  persone: {
    arco: [{chi: "mira", x: 2560, y: 1170, h: 470, se: f => f.bmira}],
    casamira: [{chi: "mira", x: 2520, y: 1250, h: 560, se: f => !f.bmira}]
  },
  cose: {
    radici: [{id: "fessura", x: 1805, y: 900, testo: "La fessura"}],
    arco: [{id: "brocche", x: 1840, y: 760, testo: "Le brocche"}],
    casamira: [{id: "broccaMira", x: 1690, y: 860, testo: "La brocca nuova", se: f => !f.bmira}]
  },
  scena: {
    radici: [
      {tipo: "persona", chi: "pico", x: 2060, y: 470, h: 240, se: f => f.intro && !f.taccuino},
      {tipo: "luce", x: 1808, y: 880, s: 1.4, se: f => f.luce && !f.taccuino}
    ],
    arco: [
      {tipo: "gocce", da: 1460, a: 2210, y: 785, h: 115, n: 54, se: f => f.gocce},
      {tipo: "immagine", img: "broccaMira", x: 2330, y: 1030, h: 160, tocca: "brocche", se: f => f.bmira}
    ]
  },

  /* le sequenze: «su» dice quando partono (persona:, cosa:, arrivo:, ingresso, evento:), «se» quando valgono.
     Vale la prima regola che corrisponde. */
  regole: [
    {su: "ingresso", se: f => !f.intro, fai: [
      {guarda: 2650},
      ["leo", "Nonna, perché le brocche le appendiamo sempre all'Arco del Vento?", "i1"],
      ["nonna", "Si è sempre fatto così, tesoro… Ma il perché… l'abbiamo perso.", "i2"],
      ["pico", "Cra! Cra!", "pico", "Pico afferra la matita di Leo e vola via verso le grandi radici!", {vola: ["pico", 2900, 640, 1950, 520]}],
      ["leo", "Ehi! La mia matita!", "i4"],
      ["bip", "Inseguiamolo! Trascina per guardarti intorno, e tocca il cerchio delle radici.", "i5", "Se ti perdi, apri la 🗺️ Mappa o tocca Bip in alto a destra."],
      {set: "intro"}, {mano: true}
    ]},
    {su: "arrivo:radici", se: f => f.intro && !f.taccuino && !f.vistoPico, fai: [
      {set: "vistoPico"},
      ["pico", "Cra! Cra!", "pico", "Pico lascia cadere qualcosa nella fessura tra le radici e si mette a guardare dall'alto, soddisfatto."]
    ]},
    {su: "persona:pico", se: f => !f.taccuino, fai: [["pico", "Cra! Cra!", "pico"], ["bip", "Ride di noi! Guardiamo nella fessura qui sotto.", "r9"]]},
    {su: "cosa:fessura", se: f => !f.luce, fai: [
      ["leo", "È troppo buio qui sotto, non si vede niente…", "r2"],
      ["bip", "Ci penso io! Accendo la mia luce!", "r3"], {set: "luce"}, {ridisegna: true}, {suono: "tintinnio"},
      ["bip", "Guarda! C'è la tua matita… e accanto un piccolo taccuino di corteccia!", "r4"]
    ]},
    {su: "cosa:fessura", se: f => !f.taccuino, fai: [
      {set: "taccuino"}, {suono: "tintinnio"},
      ["leo", "La mia matita! E questo… un taccuino con un faro disegnato sopra.", "r5"],
      ["leo", "Le pagine sono tutte bianche.", "r6"],
      {premio: ["📒", "Il taccuino di Leo!", "Un taccuino di corteccia con un faro sulla copertina. Ogni volta che capisci il <b>perché</b> di qualcosa, scrivilo qui!"]},
      {ridisegna: true},
      ["bip", "Allora riempiamolo! Andiamo all'Arco del Vento, da Tobia.", "r7"]
    ]},
    {su: "persona:tobia", se: f => !f.taccuino, fai: [["tobia", "Ciao Leo! Pico è passato di qui a tutta velocità, verso le radici.", "t1"]]},
    {su: "persona:tobia", se: f => !f.gocce, fai: [
      ["tobia", "Guarda con la mia lente: fuori dalle brocche ci sono goccioline piccolissime…", "t2"], {set: "gocce"}, {ridisegna: true}, {guarda: 1840},
      ["tobia", "Sùdano!", "t3"],
      ["tobia", "Quando l'aria è appiccicosa, però, restano meno fresche.", "t4"],
      {toast: "🔍 Nuovo indizio nel taccuino"}
    ]},
    {su: "persona:tobia", se: (f, S) => !S.scoperte.includes("brocca"), fai: [["tobia", "Chissà cosa fa la brocca nuova di Mira…", "t5"]]},
    {su: "persona:tobia", se: f => !f.libro, fai: [["tobia", "Il Faro! Non l'avevo mai visto acceso!", "t6"]]},
    {su: "persona:mira", se: f => !f.gocce, fai: [["mira", "Ciao Leo! Ho una brocca nuova bellissima, l'ho presa da un mercante di passaggio!", "m1"]]},
    {su: "persona:mira", se: f => !f.bmira, fai: [
      ["mira", "Bleah! È tiepida!", "m2"],
      ["mira", "Eppure è la più bella di tutte: smaltata, lucida… La porto all'Arco, vicino alle altre!", "m3"],
      {set: "bmira"}, {toast: "🔍 Nuovo indizio nel taccuino"}, {ridisegna: true}
    ]},
    {su: "cosa:broccaMira", fai: [{regola: "persona:mira"}]},
    {su: "persona:mira", se: f => !f.capito, fai: [{se: (f, S, M) => M.qui === "arco", fai: [{regola: "cosa:brocche"}], altrimenti: [["mira", "Ci vediamo all'Arco!", "m4"]]}]},
    {su: "persona:mira", se: f => !f.libro, fai: [["mira", "E lo smalto i buchini li chiude! L'ho capito io, eh!", "m5"]]},
    {su: "cosa:brocche", se: f => !f.gocce, fai: [["leo", "Sono fresche e un po' umide… ma per capire bisogna guardarle da vicino. Tobia ha la lente!", "b1"]]},
    {su: "cosa:brocche", se: f => !f.bmira, fai: [["leo", "Sono piene di goccioline. E la brocca nuova di Mira? Andiamo a chiederle!", "b2"]]},
    {su: "cosa:brocche", se: f => !f.capito, fai: [
      ["leo", "Le brocche di terracotta sono piene di goccioline. Quella di Mira è liscia e asciutta…", "b3"],
      ["bip", "Perché la tua è calda, e le altre no?", "b4"],
      ["bip", "Facciamo delle prove nel mio laboratorio! Così scopriamo cosa conta davvero.", "l0"],
      {lab: "brocca"}, {set: "labBrocca"},
      {domanda: {chi: "bip", testo: "Allora, Leo: perché la brocca di terracotta resta fresca?", voce: "q1",
        giusta: "Un po' d'acqua esce dai buchini della terracotta e vola via nell'aria: è come se ogni gocciolina si portasse via un pezzetto di caldo.",
        sbagliate: [["Perché il vento è sempre freddo.", [["bip", "Ma anche la brocca di Mira è qui al vento… ed è tiepida!", "q5"]]],
                    ["Perché la terracotta è magica.", [["bip", "Uhm… proviamo a spiegarlo senza magia. Ripensa alle goccioline!", "q6"]]]]}},
      {set: "capito"},
      ["leo", "La terracotta ha dei buchini piccolissimi! Un po' d'acqua esce, e il vento la porta via. È come se ogni gocciolina si portasse via un pezzetto di caldo!", "q2"],
      ["mira", "E lo smalto i buchini li chiude!", "q3"],
      ["bip", "Presto, Leo: apri il taccuino e scrivilo!", "q4"],
      {scrivi: "brocca"}
    ]},
    {su: "cosa:brocche", fai: [["leo", "Le brocche sudano, e l'acqua resta fresca. Adesso sappiamo perché!", "b5"]]},
    {su: "persona:nonna", se: (f, S) => S.scoperte.includes("brocca") && !f.finale, fai: [
      ["nonna", "Ho visto il Faro brillare lassù! Allora il perché… non era perso per sempre.", "n6"],
      ["nonna", "E tu? Perché senti freschino quando esci dall'acqua, e c'è un po' di vento?", "n7"],
      {set: "finale"}, {parlarne: "brocca"}
    ]},
    {su: "persona:nonna", se: f => f.finale && !f.libro, fai: [["nonna", "Entra pure in casa, tesoro. Il libro delle storie è sul leggio.", "n8"]]},
    {su: "cosa:libro", se: (f, S) => S.scoperte.includes("brocca"), fai: [
      {se: f => !f.libro, fai: [{set: "libro"}, {suono: "tintinnio"}]},
      ["bip", "Guarda! Una pagina è tornata leggibile: parla di brocche e di vento!", "c3"],
      {toast: "📖 Una pagina del libro è tornata!"}
    ]}
  ]
};
