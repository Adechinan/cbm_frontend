/* Konrad Ahodan : konrad.ahodan@approbations.ca */
// Données géographiques officielles du Bénin
// 12 départements · 77 communes · ~546 arrondissements

export type Commune = { nom: string; arrondissements: string[] }
export type Departement = { nom: string; communes: Commune[] }

export const BENIN_GEO: Departement[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. ALIBORI  (chef-lieu : Kandi)  — 6 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Alibori',
    communes: [
      {
        nom: 'Banikoara',
        arrondissements: ['Banikoara', 'Founougo', 'Gomparou', 'Goumori', 'Kokey', 'Ounet', 'Soroko', 'Toura'],
      },
      {
        nom: 'Gogounou',
        arrondissements: ['Gogounou', 'Gah', 'Sori'],
      },
      {
        nom: 'Kandi',
        arrondissements: ['Donwari', 'Kandi I', 'Kandi II', 'Kandi III', 'Kassakou', 'Saah'],
      },
      {
        nom: 'Karimama',
        arrondissements: ['Birni-Lafia', 'Bogo-Bogo', 'Karimama', 'Monsey', 'Yèdènou'],
      },
      {
        nom: 'Malanville',
        arrondissements: ['Garou', 'Guène', 'Madécali', 'Malanville', 'Momkassa'],
      },
      {
        nom: 'Ségbana',
        arrondissements: ['Liboussou', 'Lougou', 'Ségbana', 'Sorèketa', 'Wèwè'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. ATACORA  (chef-lieu : Natitingou)  — 9 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Atacora',
    communes: [
      {
        nom: 'Boukoumbé',
        arrondissements: ['Boukoumbé', 'Katabomboua', 'Korontière', 'Natta', 'Tabota', 'Tchanhoun-Monou'],
      },
      {
        nom: 'Cobly',
        arrondissements: ['Cobly', 'Datori', 'Kountori', 'Tapoga'],
      },
      {
        nom: 'Kérou',
        arrondissements: ['Brignan', 'Firou', 'Kérou', 'Kombori', 'Kouarfa'],
      },
      {
        nom: 'Kouandé',
        arrondissements: ['Birni', 'Guilmaro', 'Kouandé', 'Oroukayo', 'Péhongou'],
      },
      {
        nom: 'Matéri',
        arrondissements: ['Dassari', 'Matéri', 'Nodi', 'Tantéga', 'Yandéra'],
      },
      {
        nom: 'Natitingou',
        arrondissements: ['Kouandata', 'Natitingou', 'Perma', 'Toucountouna'],
      },
      {
        nom: 'Pehunco',
        arrondissements: ['Gnémasson', 'Kotopounga', 'Pehunco', 'Séméré'],
      },
      {
        nom: 'Tanguiéta',
        arrondissements: ['Cotiakou', 'Tanguiéta', 'Tanéka-Koko'],
      },
      {
        nom: 'Toukountouna',
        arrondissements: ['Bouéra', 'Bouyéra', 'Toukountouna'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ATLANTIQUE  (chef-lieu : Allada)  — 8 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Atlantique',
    communes: [
      {
        nom: 'Abomey-Calavi',
        arrondissements: ['Abomey-Calavi', 'Akassato', 'Glo-Djigbé', 'Godomey', 'Hêvié', 'Kpanroun', 'Ouèdo', 'Togba', 'Zinvié'],
      },
      {
        nom: 'Allada',
        arrondissements: ['Allada', 'Attogon', 'Avakpa', 'Ayou', 'Lon-Agonmey', 'Sékou', 'Togoudo', 'Zinsou'],
      },
      {
        nom: 'Kpomassè',
        arrondissements: ['Agatogbo', 'Ahouandji', 'Kpomassè', 'Ouèdèmè-Kpomassè', 'Sègbohouè', 'Tokpa-Domè'],
      },
      {
        nom: 'Ouidah',
        arrondissements: ['Avlékété', 'Gakpé', 'Houakpè-Daho', 'Kpovié', 'Ouidah I', 'Ouidah II', 'Ouidah III', 'Ouidah IV', 'Pahou'],
      },
      {
        nom: 'Sô-Ava',
        arrondissements: ['Acron-Hou', 'Ganvié I', 'Ganvié II', 'Houédo-Aguéko', 'Lokossa', 'Sô-Ava', 'Vèkky'],
      },
      {
        nom: 'Toffo',
        arrondissements: ['Agon', 'Dèkin', 'Kpoba', 'Sèdjè-Dénou', 'Sèdjè-Kotomey', 'Toffo', 'Zê-Kpota'],
      },
      {
        nom: 'Tori-Bossito',
        arrondissements: ['Adingnigon', 'Tori-Bossito', 'Tori-Cada', 'Tori-Gare'],
      },
      {
        nom: 'Zê',
        arrondissements: ['Dodji-Aliho', 'Glo-Djigbé', 'Kpanroun', 'Sèdjè-Kotomey', 'Tangbo', 'Zê'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BORGOU  (chef-lieu : Parakou)  — 8 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Borgou',
    communes: [
      {
        nom: 'Bembèrèkè',
        arrondissements: ['Bembèrèkè', 'Bouanri', 'Gamia', 'Ina', 'Sirarou'],
      },
      {
        nom: 'Kalalé',
        arrondissements: ['Birni', 'Guilmaro', 'Kalalé', 'Kèrèmou', 'Sinawongourou'],
      },
      {
        nom: "N'Dali",
        arrondissements: ["Bori", "N'Dali", 'Pèrèrè', 'Sirarou'],
      },
      {
        nom: 'Nikki',
        arrondissements: ['Biro', 'Nikki', 'Ouénou', 'Séro-Djiboro', 'Suya', 'Tasso'],
      },
      {
        nom: 'Parakou',
        arrondissements: ['Parakou I', 'Parakou II', 'Parakou III'],
      },
      {
        nom: 'Pèrèrè',
        arrondissements: ['Fô-Bouré', 'Gninsy', 'Pèrèrè', 'Sakara'],
      },
      {
        nom: 'Sinendé',
        arrondissements: ['Basso', 'Gbérou', 'Sinendé', 'Toui'],
      },
      {
        nom: 'Tchaourou',
        arrondissements: ['Bétérou', 'Gbassi', 'Kika', 'Sanson', 'Tchaourou', 'Tchatchou', 'Toui-Kpèvi'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. COLLINES  (chef-lieu : Savalou)  — 6 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Collines',
    communes: [
      {
        nom: 'Bantè',
        arrondissements: ['Atokolibé', 'Bantè', 'Bobè', 'Cotiakou', 'Sèmè', 'Tchetti'],
      },
      {
        nom: 'Dassa-Zoumè',
        arrondissements: ['Dassa I', 'Dassa II', 'Gbanlin', 'Kami', 'Kèrè', 'Kpingni', 'Lèma', 'Ouèdèmè'],
      },
      {
        nom: 'Glazoué',
        arrondissements: ['Cové', 'Glazoué', 'Gomè', 'Kpakpaza', 'Magoumi', 'Ouèdèmè-Peulh', 'Thio'],
      },
      {
        nom: 'Ouèssè',
        arrondissements: ['Adja-Ouèrè', 'Kèrè', 'Kilibo', 'Miniffi', 'Okpara', 'Ouèssè', 'Sovié', 'Tchaada'],
      },
      {
        nom: 'Savalou',
        arrondissements: ['Agbado', 'Assanté', 'Djalloukou', 'Doumè', 'Gobada', 'Kpataba', 'Lahotan', 'Lèmè', 'Ottola', 'Savalou'],
      },
      {
        nom: 'Savè',
        arrondissements: ['Bané', 'Kaboua', 'Okpara', 'Ouèssè', 'Savè', 'Tchètti', 'Tolèbou'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. COUFFO  (chef-lieu : Aplahoué)  — 6 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Couffo',
    communes: [
      {
        nom: 'Aplahoué',
        arrondissements: ['Adjahonmè', 'Aplahoué', 'Dekpo', 'Doutou', 'Gohomey', 'Klobè', 'Tota'],
      },
      {
        nom: 'Djakotomey',
        arrondissements: ['Adomè', 'Djakotomey', 'Gbakpodji', 'Kpoba', 'Sokouhoué', 'Zalli'],
      },
      {
        nom: 'Dogbo',
        arrondissements: ['Azovè', 'Dogbo-Tota', 'Kpodèhou', 'Lokogohoué', 'Madjrè', 'Tohou'],
      },
      {
        nom: 'Klouékanmè',
        arrondissements: ['Agondji', 'Hlassamè', 'Klouékanmè', 'Kokohoué', 'Lanta', 'Tayakou'],
      },
      {
        nom: 'Lalo',
        arrondissements: ['Gnizounmè', 'Lalo', 'Lèzè', 'Lokogba', 'Tohou', 'Wègbé', 'Zalli'],
      },
      {
        nom: 'Toviklin',
        arrondissements: ['Ayomi', 'Houégamè', 'Kpédékpo', 'Toviklin', 'Yokon'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. DONGA  (chef-lieu : Djougou)  — 4 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Donga',
    communes: [
      {
        nom: 'Bassila',
        arrondissements: ['Alédjo', 'Bassila', 'Manigri', 'Pénéssoulou', 'Tchetti'],
      },
      {
        nom: 'Copargo',
        arrondissements: ['Copargo', 'Kpèbèra', 'Partago', 'Tchakalakou'],
      },
      {
        nom: 'Djougou',
        arrondissements: ['Bariénou', 'Barei', 'Djougou I', 'Djougou II', 'Djougou III', 'Kolokondé', 'Onklou', 'Serou', 'Sèmèrè I'],
      },
      {
        nom: 'Ouaké',
        arrondissements: ['Dèrèkèlè', 'Kountonou', 'Naboua', 'Ouaké', 'Tokibi'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. LITTORAL  (chef-lieu : Cotonou)  — 1 commune
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Littoral',
    communes: [
      {
        nom: 'Cotonou',
        arrondissements: [
          'Cotonou I', 'Cotonou II', 'Cotonou III', 'Cotonou IV', 'Cotonou V',
          'Cotonou VI', 'Cotonou VII', 'Cotonou VIII', 'Cotonou IX', 'Cotonou X',
          'Cotonou XI', 'Cotonou XII', 'Cotonou XIII',
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. MONO  (chef-lieu : Lokossa)  — 6 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Mono',
    communes: [
      {
        nom: 'Athiémé',
        arrondissements: ['Athiémé', 'Dèdèkpoê', 'Lobogo', 'Possotomè'],
      },
      {
        nom: 'Bopa',
        arrondissements: ['Bopa', 'Dégbé', 'Gbècon-Houégbo', 'Lobogo', 'Ouèdèmè', 'Yègodé'],
      },
      {
        nom: 'Comè',
        arrondissements: ['Comè', 'Guèzin', 'Oumako', 'Sèkodji', 'Zoungbonou'],
      },
      {
        nom: 'Grand-Popo',
        arrondissements: ['Agbannakin', 'Agoué', 'Avlo', 'Grand-Popo', 'Sazué'],
      },
      {
        nom: 'Houéyogbé',
        arrondissements: ['Dèdèkpoê', 'Dogbo', 'Hondjin', 'Houéyogbé', 'Kpinnou', 'Malanhoui'],
      },
      {
        nom: 'Lokossa',
        arrondissements: ['Agamè', 'Koudo', 'Lokossa', 'Ouèdèmè-Lokossa'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. OUÉMÉ  (chef-lieu : Porto-Novo)  — 9 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Ouémé',
    communes: [
      {
        nom: 'Adjarra',
        arrondissements: ['Adjarra I', 'Adjarra II', 'Aglogbè', 'Hozin'],
      },
      {
        nom: 'Adjohoun',
        arrondissements: ['Adjohoun', 'Afô', 'Akpadanou', 'Bè', 'Gangban', 'Kodé'],
      },
      {
        nom: 'Aguégués',
        arrondissements: ['Aguégués', 'Zoungamè'],
      },
      {
        nom: 'Akpro-Missérété',
        arrondissements: ['Akpro-Missérété', 'Détohou', 'Gomè-Sota', 'Kpankou', 'Ouanho'],
      },
      {
        nom: 'Avrankou',
        arrondissements: ['Avrankou', 'Kpanroun', 'Odohou', 'Tohouè', 'Yèvènohou'],
      },
      {
        nom: 'Bonou',
        arrondissements: ['Bonou', 'Dèkin', 'Kpédékpo', 'Ouèmè-Boundary'],
      },
      {
        nom: 'Dangbo',
        arrondissements: ['Dangbo', 'Dékin', 'Gbèko', 'Houègbo', 'Kpédékpo', 'Xwlacodji'],
      },
      {
        nom: 'Porto-Novo',
        arrondissements: ['Porto-Novo I', 'Porto-Novo II', 'Porto-Novo III', 'Porto-Novo IV', 'Porto-Novo V'],
      },
      {
        nom: 'Sèmè-Kpodji',
        arrondissements: ['Agblangandan', 'Daagbarou', 'Sèmè-Kpodji', 'Tohouè'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. PLATEAU  (chef-lieu : Pobè)  — 5 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Plateau',
    communes: [
      {
        nom: 'Adja-Ouèrè',
        arrondissements: ['Adja-Ouèrè', 'Igana', 'Kpoulou', 'Massè', 'Towè'],
      },
      {
        nom: 'Ifangni',
        arrondissements: ['Boundary', 'Ifangni', 'Issaba', 'Lagbè'],
      },
      {
        nom: 'Kétou',
        arrondissements: ['Idigny', 'Kétou', 'Okpometa', 'Owèrè', 'Yoko'],
      },
      {
        nom: 'Pobè',
        arrondissements: ['Igana', 'Pobè', 'Towè', 'Yoko'],
      },
      {
        nom: 'Sakété',
        arrondissements: ['Ita-Djèbou', 'Médédjonou', 'Sakété', 'Togon', 'Towè'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. ZOU  (chef-lieu : Abomey)  — 9 communes
  // ─────────────────────────────────────────────────────────────────────────
  {
    nom: 'Zou',
    communes: [
      {
        nom: 'Abomey',
        arrondissements: ['Abomey I', 'Abomey II', 'Agbokpa', 'Cana I', 'Cana II', 'Détohou', 'Djègbé', 'Gnizounmè', 'Hounli'],
      },
      {
        nom: 'Agbangnizoun',
        arrondissements: ['Agbangnizoun', 'Djègbé', 'Lissazounmè', 'Tannou-Gola', 'Za-Tanta', 'Zonmon'],
      },
      {
        nom: 'Bohicon',
        arrondissements: ['Bohicon I', 'Bohicon II', 'Ségbananmè', 'Vèdji'],
      },
      {
        nom: 'Covè',
        arrondissements: ['Covè', 'Domè', 'Gnidjazoun', 'Lalo', 'Zounzonmè'],
      },
      {
        nom: 'Djidja',
        arrondissements: ['Djidja', 'Gnanhouizounmè', 'Gounarou', 'Kpakpaza', 'Ouèssè', 'Vèdji', 'Zado'],
      },
      {
        nom: 'Ouinhi',
        arrondissements: ['Agondji', 'Démè', 'Kinkinhoué', 'Ouinhi', 'Sagon'],
      },
      {
        nom: 'Zagnanado',
        arrondissements: ['Agoua', 'Kpèdè', 'Massi', 'Vossa', 'Zagnanado'],
      },
      {
        nom: 'Za-Kpota',
        arrondissements: ['Agongointo', 'Domè', 'Gbèco', 'Kpozoun', 'Lissazounmè', 'Sèhoun', 'Za-Kpota'],
      },
      {
        nom: 'Zogbodomè',
        arrondissements: ['Agondji', 'Kponou', 'Lissèzoun', 'Zogbodomè', 'Zonmon', 'Zounzounmè'],
      },
    ],
  },
]
