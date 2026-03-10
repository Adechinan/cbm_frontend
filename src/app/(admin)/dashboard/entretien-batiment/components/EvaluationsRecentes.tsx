/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Badge, Card, CardBody, CardHeader, Table } from 'react-bootstrap'
import { BatimentType, EvaluationType } from '@/types/entretien-batiment'

type EvalWithBatiment = EvaluationType & { batiment?: BatimentType }

type Props = {
  evaluations: EvalWithBatiment[]
}

function NoteCell({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-muted">—</span>
  const color = value >= 7 ? 'success' : value >= 5 ? 'warning' : 'danger'
  return <span className={`fw-semibold text-${color}`}>{value.toFixed(1)}</span>
}

export default function EvaluationsRecentes({ evaluations }: Props) {
  return (
    <Card className="h-100">
      <CardHeader className="border-bottom border-dashed d-flex justify-content-between align-items-center">
        <h4 className="header-title mb-0">Évaluations récentes</h4>
        <span className="text-muted small">{evaluations.length} résultat{evaluations.length > 1 ? 's' : ''}</span>
      </CardHeader>
      <CardBody className="p-0">
        <Table hover responsive className="align-middle mb-0 table-sm">
          <thead className="table-light">
            <tr>
              <th>Bâtiment</th>
              <th>Date</th>
              <th>Évaluateur</th>
              <th className="text-center">Phys.</th>
              <th className="text-center">Fonct.</th>
              <th className="text-center">Tech.</th>
              <th className="text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  Aucune évaluation enregistrée
                </td>
              </tr>
            )}
            {evaluations.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <span className="fw-medium">{ev.batiment?.denomination ?? ev.batimentId}</span>
                  {ev.batiment?.commune && (
                    <div className="text-muted small">{ev.batiment.commune}</div>
                  )}
                </td>
                <td className="text-muted text-nowrap">
                  {new Date(ev.date).toLocaleDateString('fr-FR')}
                </td>
                <td className="text-muted">{ev.evaluateur ?? '—'}</td>
                <td className="text-center"><NoteCell value={ev.notePhysique} /></td>
                <td className="text-center"><NoteCell value={ev.noteFonctionnelle} /></td>
                <td className="text-center"><NoteCell value={ev.noteTechnique} /></td>
                <td className="text-center">
                  <Badge bg={ev.statut === 'validé' ? 'success' : 'warning'} text={ev.statut === 'validé' ? undefined : 'dark'}>
                    {ev.statut === 'validé' ? 'Validé' : 'Brouillon'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  )
}
