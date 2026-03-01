/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Badge, Card, CardBody, CardHeader, Table } from 'react-bootstrap'
import { BatimentType, EvaluationType } from '@/types/entretien-batiment'

type Props = {
  batiments: BatimentType[]
  evaluations: EvaluationType[]
}

function NoteCell({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-muted">—</span>
  const color = value >= 7 ? 'success' : value >= 5 ? 'warning' : 'danger'
  return <span className={`fw-semibold text-${color}`}>{value.toFixed(1)}</span>
}

export default function SyntheseTable({ batiments, evaluations }: Props) {
  return (
    <Card>
      <CardHeader className="border-bottom border-dashed">
        <h4 className="header-title mb-0">Synthèse du patrimoine</h4>
      </CardHeader>
      <CardBody className="p-0">
        <Table hover responsive className="align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Bâtiment</th>
              <th>Organisme</th>
              <th>Département</th>
              <th className="text-end">Surface (m²)</th>
              <th className="text-center">Évals.</th>
              <th className="text-center">Phys.</th>
              <th className="text-center">Fonct.</th>
              <th className="text-center">Tech.</th>
              <th className="text-end">Coût global (FCFA)</th>
              <th className="text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {batiments.map((b) => {
              const evs = evaluations.filter((e) => e.batimentId === b.id)
              const latest = [...evs].sort(
                (a, c) => new Date(c.date).getTime() - new Date(a.date).getTime()
              )[0]

              return (
                <tr key={b.id}>
                  <td>
                    <span className="fw-medium">{b.denomination}</span>
                    <div className="text-muted small font-monospace">{b.code}</div>
                  </td>
                  <td className="text-muted">{b.organisme}</td>
                  <td className="text-muted">{b.departement}</td>
                  <td className="text-end">{b.surfaceTotale.toLocaleString('fr-FR')}</td>
                  <td className="text-center text-muted">{evs.length}</td>
                  <td className="text-center"><NoteCell value={latest?.notePhysique} /></td>
                  <td className="text-center"><NoteCell value={latest?.noteFonctionnelle} /></td>
                  <td className="text-center"><NoteCell value={latest?.noteTechnique} /></td>
                  <td className="text-end">
                    {latest?.coutGlobal !== undefined
                      ? <span className="text-nowrap fw-medium">{latest.coutGlobal.toLocaleString('fr-FR')}</span>
                      : <span className="text-muted">—</span>
                    }
                  </td>
                  <td className="text-center">
                    <Badge
                      bg={
                        b.statutConstruction === 'En rénovation' || b.statutConstruction === 'Actif'
                          ? 'success'
                          : b.statutConstruction === 'En travaux'
                          ? 'warning'
                          : 'secondary'
                      }
                      text={b.statutConstruction === 'En travaux' ? 'dark' : undefined}
                    >
                      {b.statutConstruction}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  )
}
