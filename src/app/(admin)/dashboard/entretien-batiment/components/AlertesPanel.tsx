/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Badge, Card, CardBody, CardHeader, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export type Alerte = {
  id: string
  type: 'evaluation' | 'recensement'
  batimentNom: string
  date: string
  evaluateur?: string
}

type Props = {
  alertes: Alerte[]
}

export default function AlertesPanel({ alertes }: Props) {
  return (
    <Card className="h-100">
      <CardHeader className="border-bottom border-dashed d-flex justify-content-between align-items-center">
        <h4 className="header-title mb-0">En attente de validation</h4>
        {alertes.length > 0 && (
          <Badge bg="warning" text="dark" pill>
            {alertes.length}
          </Badge>
        )}
      </CardHeader>
      <CardBody className="p-0">
        {alertes.length === 0 ? (
          <div className="text-center py-5 px-3">
            <IconifyIcon icon="tabler:checks" className="text-success mb-2" style={{ fontSize: 40 }} />
            <p className="text-muted mb-0">Aucun document en attente</p>
          </div>
        ) : (
          <ul className="list-unstyled mb-0">
            {alertes.map((a, i) => (
              <li
                key={a.id}
                className={`d-flex align-items-start gap-3 px-3 py-3 ${i < alertes.length - 1 ? 'border-bottom border-dashed' : ''}`}
              >
                <div
                  className={`flex-shrink-0 rounded d-flex align-items-center justify-content-center mt-1 bg-${a.type === 'evaluation' ? 'primary' : 'info'} bg-opacity-10`}
                  style={{ width: 34, height: 34 }}
                >
                  <IconifyIcon
                    icon={a.type === 'evaluation' ? 'tabler:clipboard-list' : 'tabler:building-community'}
                    className={`fs-18 text-${a.type === 'evaluation' ? 'primary' : 'info'}`}
                  />
                </div>

                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-medium text-truncate">{a.batimentNom}</p>
                  <small className="text-muted">
                    {a.type === 'evaluation' ? 'Évaluation' : 'Recensement'}
                    {' · '}
                    {new Date(a.date).toLocaleDateString('fr-FR')}
                  </small>
                  {a.evaluateur && (
                    <small className="text-muted d-block">{a.evaluateur}</small>
                  )}
                </div>

                <Badge bg="warning" text="dark" className="flex-shrink-0 mt-1">
                  Brouillon
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
