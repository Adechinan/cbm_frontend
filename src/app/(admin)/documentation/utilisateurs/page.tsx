/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { type ReactNode } from 'react'
import { Alert, Badge, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export const metadata: Metadata = { title: 'Documentation Utilisateurs' }

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

function StepCard({
  step,
  title,
  route,
  description,
}: {
  step: string
  title: string
  route: string
  description: string
}) {
  return (
    <Col md={6} xl={4}>
      <Card className="h-100 border-0 shadow-sm">
        <CardBody>
          <Badge bg="primary" className="mb-2">{step}</Badge>
          <h6 className="fw-semibold mb-1">{title}</h6>
          <code className="small text-muted d-block mb-2">{route}</code>
          <p className="small text-muted mb-0">{description}</p>
        </CardBody>
      </Card>
    </Col>
  )
}

export default function UserDocumentationPage() {
  return (
    <div>
      <PageTitle title="Documentation Utilisateurs" subTitle="Documentation" />

      <div className="p-4 rounded-3 mb-4 bg-info bg-opacity-10 border border-info border-opacity-25">
        <div className="d-flex gap-3 align-items-start">
          <IconifyIcon icon="tabler:book" className="fs-36 text-info flex-shrink-0 mt-1" />
          <div>
            <h4 className="fw-bold mb-1">Guide d&apos;utilisation</h4>
            <p className="text-muted mb-0">
              Cette page explique comment utiliser l&apos;application pour gérer les bâtiments,
              réaliser les recensements, produire les évaluations et piloter les paramétrages.
            </p>
          </div>
        </div>
      </div>

      <Section icon="tabler:map-2" title="Parcours recommandé (tour de l'application)">
        <Row className="g-3">
          <StepCard
            step="Étape 1"
            title="Préparer les référentiels"
            route="/parametrage/*"
            description="Configurer types de bâtiment, critères, champs de fiche, aléas et pondérations avant toute saisie métier."
          />
          <StepCard
            step="Étape 2"
            title="Créer les bâtiments"
            route="/batiments"
            description="Renseigner les fiches d'identification; les champs visibles dépendent du paramétrage de la fiche."
          />
          <StepCard
            step="Étape 3"
            title="Faire le recensement"
            route="/batiments/recensement"
            description="Saisir l'état fonctionnel et technique par bâtiment, puis enregistrer en brouillon ou valider."
          />
          <StepCard
            step="Étape 4"
            title="Lancer les évaluations"
            route="/evaluations/nouveau"
            description="Construire l'évaluation complète (physique + fonctionnel + technique) avec calcul des notes et du coût."
          />
          <StepCard
            step="Étape 5"
            title="Suivre les résultats"
            route="/dashboard/entretien-batiment"
            description="Consulter KPI, notes par bâtiment, alertes de brouillons et synthèse globale du patrimoine."
          />
          <StepCard
            step="Étape 6"
            title="Maintenir l'administration"
            route="/administration/*"
            description="Préparer l'espace rôles/utilisateurs/système (écrans de base présents, enrichissement fonctionnel à venir)."
          />
        </Row>
      </Section>

      <Section icon="tabler:settings" title="Paramétrage (à faire avant exploitation)">
        <Row className="g-3">
          <Col lg={6}>
            <h6 className="fw-semibold">Bâtiment</h6>
            <ul className="text-muted small mb-3">
              <li>Gérer les types de bâtiment.</li>
              <li>Définir les critères d'état du bâtiment.</li>
              <li>Maintenir les parties d'ouvrage et leurs valeurs de référence.</li>
            </ul>

            <h6 className="fw-semibold">Fiche d&apos;identification</h6>
            <ul className="text-muted small mb-0">
              <li>Ajouter/modifier les champs dynamiques (texte, nombre, select, radio, checkbox, date, GPS).</li>
              <li>Ajuster l&apos;ordre, la section et l&apos;activation des champs.</li>
            </ul>
          </Col>
          <Col lg={6}>
            <h6 className="fw-semibold">Critères d&apos;évaluation</h6>
            <ul className="text-muted small mb-3">
              <li>État fonctionnel: sections et éléments avec pondération.</li>
              <li>État technique: même logique de structure.</li>
            </ul>

            <h6 className="fw-semibold">Climat et risques</h6>
            <ul className="text-muted small mb-0">
              <li>Configurer zones climatiques et aléas.</li>
              <li>Renseigner la cartographie des aléas par département.</li>
              <li>Définir les pondérations aléas par partie d&apos;ouvrage.</li>
            </ul>
          </Col>
        </Row>
      </Section>

      <Section icon="tabler:building" title="Gestion des bâtiments">
        <p className="text-muted small mb-2">
          Route: <code>/batiments</code>
        </p>
        <ul className="text-muted small mb-0">
          <li>Créer un bâtiment avec une fiche d&apos;identification adaptée au paramétrage.</li>
          <li>Modifier les informations administratives et techniques déjà saisies.</li>
          <li>Supprimer un bâtiment si nécessaire.</li>
          <li>Utiliser cette base comme point d&apos;entrée pour recensements et évaluations.</li>
        </ul>
      </Section>

      <Section icon="tabler:clipboard-list" title="Recensements">
        <p className="text-muted small mb-2">
          Routes: <code>/batiments/recensement</code> et <code>/batiments/recensements</code>
        </p>
        <ul className="text-muted small mb-0">
          <li>Sélectionner le bâtiment puis saisir les éléments fonctionnels et techniques.</li>
          <li>Enregistrer en <Badge bg="warning" text="dark">brouillon</Badge> pour continuer plus tard.</li>
          <li>Passer en <Badge bg="success">validé</Badge> quand la saisie est complète.</li>
          <li>Retrouver l&apos;historique via la liste des recensements.</li>
        </ul>
      </Section>

      <Section icon="tabler:chart-bar" title="Évaluations complètes">
        <p className="text-muted small mb-2">
          Routes: <code>/evaluation</code> et <code>/evaluations/nouveau</code>
        </p>
        <ul className="text-muted small mb-0">
          <li>Créer une évaluation avec calcul des notes physique, fonctionnelle et technique.</li>
          <li>Exploiter les paramètres climatiques (aléas + pondérations) dans le calcul global.</li>
          <li>Travailler en brouillon puis valider l&apos;évaluation pour publication interne.</li>
          <li>Utiliser la liste pour suivi, relecture et suppression si besoin.</li>
        </ul>
      </Section>

      <Section icon="tabler:dashboard" title="Tableau de bord">
        <p className="text-muted small mb-2">
          Route: <code>/dashboard/entretien-batiment</code>
        </p>
        <ul className="text-muted small mb-0">
          <li>KPI clés: nombre de bâtiments, surface totale, évaluations validées, éléments en attente.</li>
          <li>Graphiques: comparaison des notes par bâtiment et répartition des statuts.</li>
          <li>Vue opérationnelle: évaluations récentes et alertes sur brouillons.</li>
          <li>Synthèse globale: lecture consolidée pour pilotage.</li>
        </ul>
      </Section>

      <Section icon="tabler:user-cog" title="Administration et sécurité d'accès">
        <p className="text-muted small mb-3">
          L&apos;accès aux routes métier est protégé par authentification. Les pages administration sont accessibles
          depuis le menu, avec un contenu initial actuellement centré sur les titres de sections.
        </p>
        <Row className="g-2">
          <Col md={4}><Badge bg="secondary">/administration/roles</Badge></Col>
          <Col md={4}><Badge bg="secondary">/administration/users</Badge></Col>
          <Col md={4}><Badge bg="secondary">/administration/system</Badge></Col>
        </Row>
      </Section>

      <Section icon="tabler:help-circle" title="Bonnes pratiques utilisateur">
        <ul className="text-muted small mb-3">
          <li>Commencer toujours par le paramétrage avant les premières saisies.</li>
          <li>Utiliser les brouillons pour éviter de valider des données incomplètes.</li>
          <li>Conserver une nomenclature cohérente des bâtiments pour faciliter les recherches.</li>
          <li>Vérifier la cohérence des notes et des coûts via le tableau de bord.</li>
        </ul>
        <Alert variant="info" className="mb-0 py-2">
          <small>
            Si <code>NEXT_PUBLIC_API_URL</code> n&apos;est pas configuré, l&apos;application fonctionne avec des données mock.
            Les changements ne sont alors pas persistés après rechargement.
          </small>
        </Alert>
      </Section>
    </div>
  )
}
