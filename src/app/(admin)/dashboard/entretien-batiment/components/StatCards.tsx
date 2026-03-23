/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { fmt } from '@/utils/evaluationCalcul'

type Props = {
  totalBatiments: number
  totalSurface: number
  evaluationsValidees: number
  enAttente: number
}

export default function StatCards({ totalBatiments, totalSurface, evaluationsValidees, enAttente }: Props) {
  const cards = [
    {
      label: 'Bâtiments recensés',
      value: String(totalBatiments),
      icon: 'tabler:building',
      variant: 'primary',
    },
    {
      label: 'Surface totale (m²)',
      value: fmt(totalSurface),
      icon: 'tabler:ruler-measure',
      variant: 'info',
    },
    {
      label: 'Évaluations validées',
      value: String(evaluationsValidees),
      icon: 'tabler:clipboard-check',
      variant: 'success',
    },
    {
      label: 'Documents en attente',
      value: String(enAttente),
      icon: 'tabler:clock-hour-4',
      variant: 'warning',
    },
  ]

  return (
    <Row className="row-cols-xxl-4 row-cols-md-2 row-cols-1 g-4 mb-4">
      {cards.map(({ label, value, icon, variant }) => (
        <Col key={label}>
          <Card className="h-100">
            <CardBody>
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`flex-shrink-0 rounded d-flex align-items-center justify-content-center bg-${variant} bg-opacity-10`}
                  style={{ width: 52, height: 52 }}
                >
                  <IconifyIcon icon={icon} className={`fs-28 text-${variant}`} />
                </div>
                <div>
                  <p
                    className="text-muted text-uppercase fw-semibold mb-1"
                    style={{ fontSize: '0.72rem', letterSpacing: 0.5 }}
                  >
                    {label}
                  </p>
                  <h3 className="mb-0 fw-bold">{value}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
