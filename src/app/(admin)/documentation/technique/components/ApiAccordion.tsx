/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { Accordion, Badge, Table } from 'react-bootstrap'

function ApiRow({ method, endpoint, description }: { method: string; endpoint: string; description: string }) {
  const colors: Record<string, string> = {
    GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger',
  }
  return (
    <tr>
      <td><Badge bg={colors[method] ?? 'secondary'} className="fw-normal font-monospace">{method}</Badge></td>
      <td><code className="text-muted">{endpoint}</code></td>
      <td className="text-muted small">{description}</td>
    </tr>
  )
}

function ApiTable({ rows }: { rows: { method: string; endpoint: string; description: string }[] }) {
  return (
    <Table hover responsive className="align-middle mb-0 table-sm">
      <thead className="table-light">
        <tr>
          <th style={{ width: 80 }}>Méthode</th>
          <th>Endpoint</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <ApiRow key={i} {...r} />)}
      </tbody>
    </Table>
  )
}

export default function ApiAccordion() {
  return (
    <Accordion flush>

      <Accordion.Item eventKey="0">
        <Accordion.Header>Bâtiments</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/batiments',        description: 'Liste tous les bâtiments' },
            { method: 'GET',    endpoint: '/api/batiments/{id}',   description: 'Retourne un bâtiment par son id' },
            { method: 'POST',   endpoint: '/api/batiments',        description: 'Crée un nouveau bâtiment' },
            { method: 'PUT',    endpoint: '/api/batiments/{id}',   description: 'Met à jour un bâtiment' },
            { method: 'DELETE', endpoint: '/api/batiments/{id}',   description: 'Supprime un bâtiment' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="1">
        <Accordion.Header>Fiche d&apos;identification — Champs dynamiques</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/champs-fiche',      description: 'Liste tous les champs configurés' },
            { method: 'POST',   endpoint: '/api/champs-fiche',      description: 'Crée un nouveau champ' },
            { method: 'PUT',    endpoint: '/api/champs-fiche/{id}', description: 'Modifie un champ (libellé, type, options…)' },
            { method: 'DELETE', endpoint: '/api/champs-fiche/{id}', description: 'Supprime un champ' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="2">
        <Accordion.Header>Critères — État Fonctionnel</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/criteres/fonctionnel',                        description: 'Sections fonctionnelles avec leurs éléments' },
            { method: 'POST',   endpoint: '/api/criteres/fonctionnel',                        description: 'Crée une section fonctionnelle' },
            { method: 'PUT',    endpoint: '/api/criteres/fonctionnel/{id}',                   description: 'Modifie une section' },
            { method: 'DELETE', endpoint: '/api/criteres/fonctionnel/{id}',                   description: 'Supprime une section' },
            { method: 'POST',   endpoint: '/api/criteres/fonctionnel/{id}/elements',          description: 'Ajoute un élément à une section' },
            { method: 'PUT',    endpoint: '/api/criteres/fonctionnel/{id}/elements/{elemId}', description: 'Modifie un élément' },
            { method: 'DELETE', endpoint: '/api/criteres/fonctionnel/{id}/elements/{elemId}', description: 'Supprime un élément' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="3">
        <Accordion.Header>Critères — État Technique</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/criteres/technique',                        description: 'Sections techniques avec leurs éléments' },
            { method: 'POST',   endpoint: '/api/criteres/technique',                        description: 'Crée une section technique' },
            { method: 'PUT',    endpoint: '/api/criteres/technique/{id}',                   description: 'Modifie une section' },
            { method: 'DELETE', endpoint: '/api/criteres/technique/{id}',                   description: 'Supprime une section' },
            { method: 'POST',   endpoint: '/api/criteres/technique/{id}/elements',          description: 'Ajoute un élément à une section' },
            { method: 'PUT',    endpoint: '/api/criteres/technique/{id}/elements/{elemId}', description: 'Modifie un élément' },
            { method: 'DELETE', endpoint: '/api/criteres/technique/{id}/elements/{elemId}', description: 'Supprime un élément' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="4">
        <Accordion.Header>Évaluations complètes</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/evaluations',               description: 'Liste toutes les évaluations (filtrable par bâtiment)' },
            { method: 'POST',   endpoint: '/api/evaluations',               description: 'Crée une évaluation en statut brouillon' },
            { method: 'PUT',    endpoint: '/api/evaluations/{id}',          description: 'Met à jour une évaluation' },
            { method: 'POST',   endpoint: '/api/evaluations/{id}/valider',  description: 'Passe au statut validé' },
            { method: 'DELETE', endpoint: '/api/evaluations/{id}',          description: 'Supprime une évaluation' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="5">
        <Accordion.Header>Recensements</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',    endpoint: '/api/recensements',              description: 'Liste tous les recensements (filtrable par bâtiment)' },
            { method: 'GET',    endpoint: '/api/recensements/{id}',         description: 'Retourne un recensement par son id' },
            { method: 'POST',   endpoint: '/api/recensements',              description: 'Crée un recensement en statut brouillon' },
            { method: 'PUT',    endpoint: '/api/recensements/{id}',         description: "Met à jour les critères d'un recensement" },
            { method: 'POST',   endpoint: '/api/recensements/{id}/valider', description: 'Passe au statut validé' },
            { method: 'DELETE', endpoint: '/api/recensements/{id}',         description: 'Supprime un recensement' },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="6">
        <Accordion.Header>Zones, Aléas Climatiques & Cartographie</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',  endpoint: '/api/zones-climatiques',      description: 'Liste les zones climatiques et leurs départements' },
            { method: 'POST', endpoint: '/api/zones-climatiques',      description: 'Crée une zone climatique' },
            { method: 'PUT',  endpoint: '/api/zones-climatiques/{id}', description: 'Modifie une zone climatique' },
            { method: 'GET',  endpoint: '/api/aleas-climatiques',      description: 'Liste les aléas climatiques configurés' },
            { method: 'POST', endpoint: '/api/aleas-climatiques',      description: 'Crée un aléa climatique' },
            { method: 'PUT',  endpoint: '/api/aleas-climatiques/{id}', description: 'Modifie un aléa climatique' },
            { method: 'GET',  endpoint: '/api/carto-alea',             description: 'Cartographie complète département × aléa' },
            { method: 'PUT',  endpoint: '/api/carto-alea',             description: "Remplace l'intégralité de la cartographie" },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="7">
        <Accordion.Header>Parties d&apos;Ouvrage & Pondérations</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',  endpoint: '/api/parties-ouvrage',      description: "Liste toutes les parties d'ouvrage" },
            { method: 'POST', endpoint: '/api/parties-ouvrage',      description: "Crée une partie d'ouvrage" },
            { method: 'PUT',  endpoint: '/api/parties-ouvrage/{id}', description: "Modifie une partie d'ouvrage" },
            { method: 'GET',  endpoint: '/api/ponderation-alea',     description: "Matrice partie d'ouvrage × aléa" },
            { method: 'PUT',  endpoint: '/api/ponderation-alea',     description: "Remplace l'intégralité des pondérations" },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey="8">
        <Accordion.Header>Types de Bâtiment & Critères d&apos;État</Accordion.Header>
        <Accordion.Body className="p-0">
          <ApiTable rows={[
            { method: 'GET',  endpoint: '/api/types-batiment',              description: 'Liste les types de bâtiment' },
            { method: 'POST', endpoint: '/api/types-batiment',              description: 'Crée un type de bâtiment' },
            { method: 'PUT',  endpoint: '/api/types-batiment/{id}',         description: 'Modifie un type (coefficients de pondération physique)' },
            { method: 'GET',  endpoint: '/api/criteres-etat-batiment',      description: 'Pondérations globales physique/fonct./technique' },
            { method: 'POST', endpoint: '/api/criteres-etat-batiment',      description: "Crée un critère d'état" },
            { method: 'PUT',  endpoint: '/api/criteres-etat-batiment/{id}', description: "Modifie un critère d'état" },
          ]} />
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  )
}
