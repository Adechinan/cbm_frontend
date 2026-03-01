<!-- Konrad Ahodan : konrad.ahodan@approbations.ca -->

# Entretien Batiment — Système de Gestion et d'Évaluation des Bâtiments

Application Next.js de gestion du patrimoine immobilier : recensement des bâtiments, paramétrage des critères d'évaluation et calcul de l'état physique, fonctionnel et technique.

---

## Démarrage

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

### Variable d'environnement (optionnelle)

Sans cette variable, l'application utilise des **données mock** en mémoire.
Pour connecter le backend Laravel, créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Architecture

```
src/
├── app/(admin)/
│   ├── batiments/          # Liste et gestion des bâtiments
│   ├── evaluations/        # Évaluations complètes (physique + fonctionnel + technique)
│   ├── parametrage/
│   │   ├── batiment/       # Types, critères d'état, parties d'ouvrage
│   │   ├── etat-fonctionnel/   # Sections et éléments — État Fonctionnel
│   │   ├── etat-technique/     # Sections et éléments — État Technique
│   │   ├── fiche-identification/  # Champs dynamiques de la fiche bâtiment
│   │   ├── carto-aleas/    # Cartographie aléas climatiques × départements
│   │   └── ponderation-climatique/  # Pondérations aléas × parties d'ouvrage
│   └── recensement/        # Recensements (état fonctionnel + technique)
├── services/
│   └── batimentService.ts  # Couche service — mock ou API REST
├── types/
│   └── data.ts             # Types TypeScript partagés
└── assets/data/
    └── parametrage.ts      # Données mock par défaut
```

---

## Service Layer — `batimentService.ts`

Toutes les fonctions sont **async** et retournent une `Promise`.
En l'absence de `NEXT_PUBLIC_API_URL`, elles opèrent sur les données mock en mémoire.

---

### Bâtiments

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getBatiments()` | `GET` | `/api/batiments` | Retourne la liste complète des bâtiments |
| `getBatiment(id)` | `GET` | `/api/batiments/{id}` | Retourne un bâtiment par son identifiant |
| `createBatiment(data)` | `POST` | `/api/batiments` | Crée un nouveau bâtiment |
| `updateBatiment(id, data)` | `PUT` | `/api/batiments/{id}` | Met à jour partiellement un bâtiment |
| `deleteBatiment(id)` | `DELETE` | `/api/batiments/{id}` | Supprime un bâtiment |

---

### Fiche d'identification — Champs dynamiques

Les champs du formulaire bâtiment sont configurables via le paramétrage.
Chaque champ a un `fieldKey` qui le lie à une propriété de `BatimentType`.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getChampsFiche()` | `GET` | `/api/champs-fiche` | Retourne tous les champs configurés (actifs et inactifs) |
| `createChampFiche(data)` | `POST` | `/api/champs-fiche` | Ajoute un nouveau champ à la fiche |
| `updateChampFiche(id, data)` | `PUT` | `/api/champs-fiche/{id}` | Modifie un champ (libellé, type, options, actif…) |
| `deleteChampFiche(id)` | `DELETE` | `/api/champs-fiche/{id}` | Supprime un champ de la fiche |

Types de champ disponibles : `Texte`, `Nombre`, `Select`, `Radio`, `Checkbox`, `Date`, `GPS`.

---

### Critères — État Fonctionnel

Organisés en **sections** (`CritereEvaluationType`) contenant des **éléments** (`ElementCritereEvaluation`).

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getCriteresEtatFonctionnel()` | `GET` | `/api/criteres/fonctionnel` | Retourne toutes les sections fonctionnelles avec leurs éléments |
| `createCritere(data)` | `POST` | `/api/criteres/fonctionnel` | Crée une nouvelle section fonctionnelle |
| `updateCritere(id, data)` | `PUT` | `/api/criteres/fonctionnel/{id}` | Modifie une section fonctionnelle |
| `deleteCritere(id)` | `DELETE` | `/api/criteres/fonctionnel/{id}` | Supprime une section fonctionnelle |
| `addElementFonctionnel(sectionId, data)` | `POST` | `/api/criteres/fonctionnel/{id}/elements` | Ajoute un élément dans une section |
| `updateElementFonctionnel(sectionId, elementId, data)` | `PUT` | `/api/criteres/fonctionnel/{id}/elements/{elementId}` | Modifie un élément |
| `deleteElementFonctionnel(sectionId, elementId)` | `DELETE` | `/api/criteres/fonctionnel/{id}/elements/{elementId}` | Supprime un élément |

---

### Critères — État Technique

Même structure que l'état fonctionnel.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getCriteresEtatTechnique()` | `GET` | `/api/criteres/technique` | Retourne toutes les sections techniques avec leurs éléments |
| `createCriteresTechnique(data)` | `POST` | `/api/criteres/technique` | Crée une nouvelle section technique |
| `updateCritereTechnique(id, data)` | `PUT` | `/api/criteres/technique/{id}` | Modifie une section technique |
| `deleteCritereTechnique(id)` | `DELETE` | `/api/criteres/technique/{id}` | Supprime une section technique |
| `addElementTechnique(sectionId, data)` | `POST` | `/api/criteres/technique/{id}/elements` | Ajoute un élément dans une section |
| `updateElementTechnique(sectionId, elementId, data)` | `PUT` | `/api/criteres/technique/{id}/elements/{elementId}` | Modifie un élément |
| `deleteElementTechnique(sectionId, elementId)` | `DELETE` | `/api/criteres/technique/{id}/elements/{elementId}` | Supprime un élément |

---

### Évaluations complètes

Évaluation combinant état physique, fonctionnel et technique avec calcul de notes et coût global.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getEvaluations(batimentId?)` | `GET` | `/api/evaluations` | Liste toutes les évaluations (filtrables par bâtiment) |
| `saveEvaluation(data)` | `POST` | `/api/evaluations` | Crée une évaluation en statut `brouillon` |
| `updateEvaluation(id, data)` | `PUT` | `/api/evaluations/{id}` | Met à jour une évaluation existante |
| `validerEvaluation(id)` | `POST` | `/api/evaluations/{id}/valider` | Passe une évaluation au statut `validé` |
| `deleteEvaluation(id)` | `DELETE` | `/api/evaluations/{id}` | Supprime une évaluation |

---

### Évaluations fonctionnelles & techniques (détaillées)

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getEvaluationsFonctionnelles(batimentId?)` | `GET` | `/api/evaluations/fonctionnelle` | Liste les évaluations fonctionnelles |
| `saveEvaluationFonctionnelle(data)` | `POST` | `/api/evaluations/fonctionnelle` | Enregistre une évaluation fonctionnelle |
| `getEvaluationsTechniques(batimentId?)` | `GET` | `/api/evaluations/technique` | Liste les évaluations techniques |
| `saveEvaluationTechnique(data)` | `POST` | `/api/evaluations/technique` | Enregistre une évaluation technique |

---

### Recensements

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getRecensements(batimentId?)` | `GET` | `/api/recensements` | Liste tous les recensements (filtrables par bâtiment) |
| `getRecensement(id)` | `GET` | `/api/recensements/{id}` | Retourne un recensement par son identifiant |
| `saveRecensement(data)` | `POST` | `/api/recensements` | Crée un recensement en statut `brouillon` |
| `updateRecensement(id, data)` | `PUT` | `/api/recensements/{id}` | Met à jour les critères d'un recensement |
| `validerRecensement(id)` | `POST` | `/api/recensements/{id}/valider` | Passe un recensement au statut `validé` |
| `deleteRecensement(id)` | `DELETE` | `/api/recensements/{id}` | Supprime un recensement |

---

### Zones et Aléas Climatiques

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getZonesClimatiques()` | `GET` | `/api/zones-climatiques` | Liste les zones climatiques et leurs départements |
| `createZoneClimatique(data)` | `POST` | `/api/zones-climatiques` | Crée une zone climatique |
| `updateZoneClimatique(id, data)` | `PUT` | `/api/zones-climatiques/{id}` | Modifie une zone climatique |
| `deleteZoneClimatique(id)` | `DELETE` | `/api/zones-climatiques/{id}` | Supprime une zone climatique |
| `getAleasClimatiques()` | `GET` | `/api/aleas-climatiques` | Liste les aléas climatiques configurés |
| `createAleaClimatique(data)` | `POST` | `/api/aleas-climatiques` | Crée un aléa climatique |
| `updateAleaClimatique(id, data)` | `PUT` | `/api/aleas-climatiques/{id}` | Modifie un aléa climatique |
| `deleteAleaClimatique(id)` | `DELETE` | `/api/aleas-climatiques/{id}` | Supprime un aléa climatique |

---

### Cartographie des Aléas

Matrice département × aléa → niveau de risque (`Faible`, `Moyen`, `Elevé`).

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getCartoAlea()` | `GET` | `/api/carto-alea` | Retourne toutes les cellules de la cartographie |
| `saveCartoAlea(data)` | `PUT` | `/api/carto-alea` | Remplace l'intégralité de la cartographie |

---

### Parties d'Ouvrage

Lots de travaux avec superficie et prix unitaire de référence.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getPartiesOuvrage()` | `GET` | `/api/parties-ouvrage` | Liste toutes les parties d'ouvrage |
| `createPartieOuvrage(data)` | `POST` | `/api/parties-ouvrage` | Crée une partie d'ouvrage |
| `updatePartieOuvrage(id, data)` | `PUT` | `/api/parties-ouvrage/{id}` | Modifie une partie d'ouvrage |
| `deletePartieOuvrage(id)` | `DELETE` | `/api/parties-ouvrage/{id}` | Supprime une partie d'ouvrage |

---

### Pondérations Aléas

Matrice partie d'ouvrage × aléa → scores (exposition, sensibilité, importance fonctionnelle).

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getPonderationsAlea()` | `GET` | `/api/ponderation-alea` | Retourne toutes les pondérations |
| `savePonderationsAlea(data)` | `PUT` | `/api/ponderation-alea` | Remplace l'intégralité des pondérations |

---

### Critères d'Évaluation des Pondérations

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getCriteresEvalPonderation()` | `GET` | `/api/criteres-eval-ponderation` | Liste les critères de pondération |
| `createCritereEvalPonderation(data)` | `POST` | `/api/criteres-eval-ponderation` | Crée un critère de pondération |
| `updateCritereEvalPonderation(id, data)` | `PUT` | `/api/criteres-eval-ponderation/{id}` | Modifie un critère de pondération |
| `deleteCritereEvalPonderation(id)` | `DELETE` | `/api/criteres-eval-ponderation/{id}` | Supprime un critère de pondération |

---

### Types de Bâtiment

Définissent les coefficients de pondération pour le calcul de l'état physique.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getTypesBatiment()` | `GET` | `/api/types-batiment` | Liste les types de bâtiment |
| `createTypeBatiment(data)` | `POST` | `/api/types-batiment` | Crée un type de bâtiment |
| `updateTypeBatiment(id, data)` | `PUT` | `/api/types-batiment/{id}` | Modifie un type de bâtiment |
| `deleteTypeBatiment(id)` | `DELETE` | `/api/types-batiment/{id}` | Supprime un type de bâtiment |

---

### Critères d'État de Bâtiment

Pondérations globales entre état physique, fonctionnel et technique.

| Fonction | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getCriteresEtatBatiment()` | `GET` | `/api/criteres-etat-batiment` | Liste les critères d'état global |
| `createCritereEtatBatiment(data)` | `POST` | `/api/criteres-etat-batiment` | Crée un critère d'état |
| `updateCritereEtatBatiment(id, data)` | `PUT` | `/api/criteres-etat-batiment/{id}` | Modifie un critère d'état |
| `deleteCritereEtatBatiment(id)` | `DELETE` | `/api/criteres-etat-batiment/{id}` | Supprime un critère d'état |

---

## Stack technique

- **Framework** : [Next.js 15](https://nextjs.org) — App Router
- **UI** : React Bootstrap + Iconify
- **Langage** : TypeScript strict
- **Backend attendu** : Laravel (connexion via `NEXT_PUBLIC_API_URL`)
- **Données** : Mock en mémoire (fichier `src/assets/data/parametrage.ts`) tant que le backend n'est pas connecté

Auth — NextAuth avec connexion Laravel Sanctum (
    admin@entretien.com/password si backend actif, 
    user@demo.com / 123456 en mode mock
    )


type/entretien-batiement : Crée la table ChampFicheType . BatimentType a un ou plusieurs ChampFicheType + valeur


Todo Utilisateur: Crud utilisateur + liste des utilisateurs et possibilité pour l'Admin de reinitialiser le mot de passe d'un user.

Todo Roles : crud des privileges, roles, et groupes utilisateurs. 
- Lecteur : Par defaut, il peux consulter , créé mais ne peux pas valider.
- Validation : seule ceux qui ont ce privilege pourra valider. 
- Super Admin : pour l'administrateur. ce privilege peut accéder aux parametres de l'app et - les modifier. Aussi Il a acces a tous dans l'application
- Consult Admin : peux juste consulter les données de parametre - aucune modification

Possibilité de créer des roles/groupes utilisateurs et leur affecté des privileges. possibilité de retirer/ajouter des utilisateurs. Un utilisateur peut etre dans plusieurs groupe.
Ajoute ses privileges dans le mock parametrage.js


Todo Page de Profil : Proposer une page de profil pour l'utilisateur, il peux voir ses infos, nom, prenoms, modifier son mot de passe.

Todo audit : Afficher la liste des actions des utilisateurs (IP, date heure:min:seconde, action modification/creation/validation, ) - cree la table dans la bd pour stocker les infos
