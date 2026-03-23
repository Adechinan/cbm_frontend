/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { MenuItemType } from "../../types/menu";


export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'apps-dashboard',
    label: 'Tableau de bord',
    isTitle: true,
  },
  {
    key: 'apps-entretien-batiment-dashboard',
    label: 'Accueil',
    icon: 'tabler:dashboard',
    url: '/dashboard/entretien-batiment',
  },
  {
    key: 'apps-batiments',
    label: 'Bâtiments',
    icon: 'tabler:building-skyscraper',
    children: [
      {
        key: 'batiments-liste',
        label: 'Liste des bâtiments',
        url: '/batiments',
        parentKey: 'apps-batiments',
      },
      {
        key: 'batiments-recensements',
        label: 'Liste des recensements',
        url: '/batiments/recensements',
        parentKey: 'apps-batiments',
      },
    ],
  },
  {
    key: 'apps-evaluation',
    label: 'Évaluation',
    icon: 'tabler:clipboard-check',
    children: [
      // {
      //   key: 'evaluation-liste',
      //   label: 'Liste des évaluations',
      //   url: '/evaluations',
      //   parentKey: 'apps-evaluation',
      // },
      // {
      //   key: 'evaluation-nouveau',
      //   label: 'Nouvelle évaluation',
      //   url: '/evaluations/nouveau',
      //   parentKey: 'apps-evaluation',
      // },
      {
        key: 'evaluation-campagnes',
        label: 'Campagnes',
        url: '/evaluations/campagnes',
        parentKey: 'apps-evaluation',
      },
    ],
  },
  {
    key: 'apps-requetes',
    label: 'Requêtes',
    icon: 'tabler:filter-question',
    children: [
      {
        key: 'requetes-stats',
        label: 'Statistiques générales',
        url: '/requetes',
        parentKey: 'apps-requetes',
      },
      {
        key: 'requetes-construction',
        label: 'Construction & Matériaux',
        url: '/requetes/construction',
        parentKey: 'apps-requetes',
      },
      {
        key: 'requetes-toitures',
        label: 'Toitures & Surfaces',
        url: '/requetes/toitures-surfaces',
        parentKey: 'apps-requetes',
      },
      {
        key: 'requetes-cartographie',
        label: 'Cartographie des Bâtiments',
        url: '/requetes/cartographie',
        parentKey: 'apps-requetes',
      },
    ],
  },
  {
    key: 'apps-parametrage',
    label: 'Paramétrages & Configuration',
    isTitle: true
  },
  {
    key: 'parametrage-param',
    label: 'Paramétrage',
    icon: 'tabler:settings',
    children: [
      {
        key: 'param-batiment',
        label: 'Bâtiment',
        url: '/parametrage/batiment',
        parentKey: 'parametrage-param',
      },
      {
        key: 'param-fiche-identification',
        label: 'Fiche d\'identification',
        url: '/parametrage/fiche-identification',
        parentKey: 'parametrage-param',
      },
      {
        key: 'param-etat-fonctionnel',
        label: 'État Fonctionnel',
        url: '/parametrage/etat-fonctionnel',
        parentKey: 'parametrage-param',
      },
      {
        key: 'etat-technique',
        label: 'État Technique',
        url: '/parametrage/etat-technique',
        parentKey: 'parametrage-param',
      },
      // {
      //   key: 'etat-physique',
      //   label: 'État Physique',
      //   url: '/parametrage/etat-physique',
      //   parentKey: 'parametrage',
      // },
      {
        key: 'param-carto-aleas',
        label: 'Carto. Aléas Climatiques',
        url: '/parametrage/carto-aleas',
        parentKey: 'parametrage-param',
      },
      {
        key: 'param-ponderation-climatique',
        label: 'Pondération Climatique',
        url: '/parametrage/ponderation-climatique',
        parentKey: 'parametrage-param',
      },
      {
        key: 'param-initialisation',
        label: 'Initialisation des données',
        url: '/parametrage/initialisation',
        parentKey: 'parametrage-param',
      }
     
    ]
  },
  {
    key: 'apps-administration',
    label: 'Administration',
    isTitle: true
  },
  {
    key: 'app-admin-users-roles',
    label: 'Utilisateurs & Rôles',
    icon: 'tabler:user-cog',
    children: [
      {
        key: 'app-admin-roles',
        label: 'Rôles',
        url: '/administration/roles',
        parentKey: 'app-admin-users-roles',
      },
      {
        key: 'app-admin-users',
        label: 'Utilisateurs',
        url: '/administration/users',
        parentKey: 'app-admin-users-roles',
      },
      {
        key: 'app-admin-system',
        label: 'Système',
        url: '/administration/system',
        parentKey: 'app-admin-users-roles',
      },
    ]
  },
  {
    key: 'app-doc',
    label: 'Documentation & Aide',
    isTitle: true
  },
  {
    key: 'app-documentation',
    label: 'Documentation',
    icon: 'tabler:file-pencil',
    children: [
      {
        key: 'app-doc-users',
        label: 'Utilisateurs',
        url: '/documentation/utilisateurs',
        parentKey: 'app-documentation',
      },
      {
        key: 'app-doc-technique',
        label: 'Technique',
        url: '/documentation/technique',
        parentKey: 'app-documentation',
      },
      
    ]
  },
 
]

export const HORIZONTAL_MENU_ITEM: MenuItemType[] = [
  
]