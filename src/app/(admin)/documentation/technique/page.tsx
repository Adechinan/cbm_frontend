/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { type ReactNode } from 'react'
import { Badge, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Metadata } from 'next'
import ApiAccordion from './components/ApiAccordion'

export const metadata: Metadata = { title: 'Documentation — Entretien Bâtiment' }

// ─── Blocs réutilisables ──────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <Card className="mb-4">
      <CardHeader className="border-bottom border-dashed">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <IconifyIcon icon={icon} className="fs-20 text-primary" />
          {title}
        </h5>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

function ModuleCard({ icon, title, route, description, variant = 'primary' }: {
  icon: string; title: string; route: string; description: string; variant?: string
}) {
  return (
    <Col md={6} xl={4}>
      <Card className="h-100 border-0 shadow-sm">
        <CardBody className="d-flex gap-3">
          <div
            className={`flex-shrink-0 rounded d-flex align-items-center justify-content-center bg-${variant} bg-opacity-10`}
            style={{ width: 44, height: 44 }}
          >
            <IconifyIcon icon={icon} className={`fs-22 text-${variant}`} />
          </div>
          <div>
            <h6 className="fw-semibold mb-1">{title}</h6>
            <code className="small text-muted d-block mb-1">{route}</code>
            <p className="text-muted small mb-0">{description}</p>
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentationPage() {
  return (
    <div>
      <PageTitle title="Documentation technique" subTitle="Documentation" />

      {/* Intro */}
      <div className="p-4 rounded-3 mb-4 bg-info bg-opacity-10 border border-primary border-opacity-25">
        <div className="d-flex gap-3 align-items-start">
          <IconifyIcon icon="tabler:book-2" className="fs-36 text-primary flex-shrink-0 mt-1" />
          <div>
            <h4 className="fw-bold mb-1">Système de Gestion et d&apos;Évaluation des Bâtiments</h4>
            <p className="text-muted mb-0">
              Application Next.js de gestion du patrimoine immobilier : recensement des bâtiments,
              paramétrage des critères d&apos;évaluation et calcul de l&apos;état physique, fonctionnel et technique.
              Sans variable <code>NEXT_PUBLIC_API_URL</code>, l&apos;application fonctionne en mode{' '}
              <strong>données mock</strong> intégrées.
            </p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <Section icon="tabler:layout-grid" title="Modules de l'application">
        <Row className="g-3">
          <ModuleCard icon="tabler:building"         title="Bâtiments"                route="/batiments"                       description="Recensement du patrimoine immobilier. Fiche d'identification dynamique alimentée par le paramétrage." variant="primary" />
          <ModuleCard icon="tabler:clipboard-list"   title="Recensements"             route="/batiments/recensement"           description="Saisie de l'état fonctionnel et technique d'un bâtiment. Statuts : brouillon ou validé." variant="info" />
          <ModuleCard icon="tabler:chart-bar"        title="Évaluations complètes"    route="/evaluations/nouveau"              description="Évaluation combinant état physique, fonctionnel et technique avec calcul de notes et coût global." variant="success" />
          <ModuleCard icon="tabler:settings"         title="Paramétrage — Fiche"      route="/parametrage/fiche-identification" description="Configuration des champs dynamiques du formulaire bâtiment (type, section, ordre, options)." variant="warning" />
          <ModuleCard icon="tabler:checklist"        title="Paramétrage — Fonctionnel" route="/parametrage/etat-fonctionnel"   description="Critères et éléments d'évaluation de l'état fonctionnel, organisés par sections pondérées." variant="secondary" />
          <ModuleCard icon="tabler:tool"             title="Paramétrage — Technique"  route="/parametrage/etat-technique"      description="Critères et éléments d'évaluation de l'état technique (structure, façade, toiture…)." variant="danger" />
          <ModuleCard icon="tabler:map-pin"          title="Cartographie Aléas"       route="/parametrage/carto-aleas"         description="Matrice département × aléa climatique → niveau de risque (Faible / Moyen / Élevé)." variant="primary" />
          <ModuleCard icon="tabler:adjustments"      title="Pondération Climatique"   route="/parametrage/ponderation-climatique" description="Matrice partie d'ouvrage × aléa → scores d'exposition, sensibilité, importance fonctionnelle." variant="info" />
          <ModuleCard icon="tabler:dashboard"        title="Tableau de bord"          route="/dashboard/entretien-batiment"    description="Vue synthétique : KPI, notes par bâtiment, répartition par statut, alertes et synthèse." variant="success" />
        </Row>
      </Section>

      {/* Architecture */}
      <Section icon="tabler:folder-code" title="Architecture du projet">
        <pre className="bg-light rounded p-3 small mb-0" style={{ lineHeight: 1.6 }}>{`src/
├── app/(admin)/
│   ├── batiments/              # Liste et gestion des bâtiments
│   │   └── recensement/        # Formulaire de recensement
│   ├── evaluations/nouveau/     # Évaluation complète (physique + fonct. + tech.)
│   ├── dashboard/
│   │   └── entretien-batiment/ # Tableau de bord synthétique
│   ├── parametrage/
│   │   ├── batiment/           # Types de bâtiment, critères d'état, parties d'ouvrage
│   │   ├── etat-fonctionnel/   # Sections & éléments — État Fonctionnel
│   │   ├── etat-technique/     # Sections & éléments — État Technique
│   │   ├── fiche-identification/  # Champs dynamiques de la fiche bâtiment
│   │   ├── carto-aleas/        # Cartographie aléas climatiques × départements
│   │   └── ponderation-climatique/  # Pondérations aléas × parties d'ouvrage
│   └── documentation/          # Cette page
├── services/
│   └── batimentService.ts      # Couche service — mock ou API REST
├── types/
│   └── data.ts                 # Types TypeScript partagés
└── assets/data/
    └── parametrage.ts          # Données mock par défaut`}</pre>
      </Section>

      {/* Types de champ */}
      <Section icon="tabler:forms" title="Types de champs — Fiche d'identification">
        <p className="text-muted small mb-3">
          Chaque champ de la fiche bâtiment est typé. Le type détermine le contrôle affiché dans le formulaire.
        </p>
        <Row className="g-2">
          {[
            { type: 'Texte',    icon: 'tabler:cursor-text',  desc: 'Champ de saisie libre',           variant: 'primary' },
            { type: 'Nombre',   icon: 'tabler:123',           desc: 'Valeur numérique',                 variant: 'info' },
            { type: 'Select',   icon: 'tabler:list',          desc: 'Liste déroulante à choix unique',  variant: 'warning' },
            { type: 'Radio',    icon: 'tabler:circle-dot',    desc: 'Boutons radio (choix unique)',      variant: 'purple' },
            { type: 'Checkbox', icon: 'tabler:checkbox',      desc: 'Cases à cocher (choix multiple)',  variant: 'dark' },
            { type: 'Date',     icon: 'tabler:calendar',      desc: 'Sélecteur de date',                variant: 'secondary' },
            { type: 'GPS',      icon: 'tabler:map-pin',       desc: 'Coordonnée géographique décimale', variant: 'success' },
          ].map(({ type, icon, desc, variant }) => (
            <Col xs={12} sm={6} md={4} key={type}>
              <div className="d-flex align-items-center gap-2 p-2 border rounded">
                <Badge bg={variant} className="fw-normal">{type}</Badge>
                <IconifyIcon icon={icon} className="text-muted" />
                <small className="text-muted">{desc}</small>
              </div>
            </Col>
          ))}
        </Row>
      </Section>

      {/* Couche service — accordion extrait en client component */}
      <Section icon="tabler:server" title="Couche service — API REST">
        <p className="text-muted small mb-3">
          Toutes les fonctions de <code>batimentService.ts</code> sont <strong>async</strong>.
          Elles utilisent les données mock intégrées si <code>NEXT_PUBLIC_API_URL</code> n&apos;est pas défini,
          ou appellent l&apos;API Laravel sinon.
        </p>
        <ApiAccordion />
      </Section>

      {/* Connexion backend */}
      <Section icon="tabler:plug" title="Connexion au backend Laravel">
        <p className="text-muted small mb-3">
          Par défaut l&apos;application utilise des données mock en mémoire.
          Pour connecter le backend Laravel, créer un fichier <code>.env.local</code> à la racine :
        </p>
        <pre className="bg-light rounded p-3 small mb-3">{`NEXT_PUBLIC_API_URL=http://localhost:8000`}</pre>
        <div className="alert alert-info d-flex gap-2 align-items-start py-2 mb-0">
          <IconifyIcon icon="tabler:info-circle" className="fs-18 flex-shrink-0 mt-1" />
          <span className="small">
            Sans cette variable, toutes les modifications (ajout, édition, suppression) sont appliquées en mémoire et
            perdues au rechargement. C&apos;est utile pour le développement frontend sans backend disponible.
          </span>
        </div>
      </Section>

      {/* Stack */}
      <Section icon="tabler:stack-2" title="Stack technique">
        <Row className="g-3">
          {[
            { label: 'Framework',   value: 'Next.js 15 — App Router',         variant: 'primary' },
            { label: 'UI',          value: 'React Bootstrap + Iconify',        variant: 'info' },
            { label: 'Langage',     value: 'TypeScript strict',                 variant: 'success' },
            { label: 'Graphiques',  value: 'ApexCharts (react-apexcharts)',     variant: 'warning' },
            { label: 'Formulaires', value: 'react-hook-form + yup',            variant: 'secondary' },
            { label: 'Backend',     value: 'Laravel (via NEXT_PUBLIC_API_URL)', variant: 'danger' },
          ].map(({ label, value, variant }) => (
            <Col xs={12} sm={6} md={4} key={label}>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={variant} className="fw-normal flex-shrink-0">{label}</Badge>
                <span className="text-muted small">{value}</span>
              </div>
            </Col>
          ))}
        </Row>
      </Section>
    </div>
  )
}
