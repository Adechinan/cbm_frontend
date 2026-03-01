/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { Badge, Form, Table } from 'react-bootstrap'
import EtatSelector, { DEFAULT_ETATS } from './EtatSelector'

type EvalTechRow = {
  critereId: string
  elementId: string
  nature?: string
  constat?: string
  etat: string
}

type EtatOption = { etat: string; note: number }

type Props = {
  groups: Array<{
    critereId: string
    section: string
    rows: EvalTechRow[]
  }>
  mapTech: Map<string, { libelle: string; section: string; etats: EtatOption[] }>
  etatsCouleur: Record<string, string>
  isEdit?: boolean
  onChangeEtat: (critereId: string, elementId: string, value: string) => void
  onChangeNature: (critereId: string, elementId: string, value: string) => void
  onChangeConstat: (critereId: string, elementId: string, value: string) => void
}



export default function TechniqueGroupedForm({
  groups,
  mapTech,
  etatsCouleur,
  isEdit = true,
  onChangeEtat,
  onChangeNature,
  onChangeConstat,
}: Props) {
  return (
    <>
      {groups.map((group) => (
        <Table key={group.critereId} hover responsive className="align-middle table-sm mb-4">
          <thead className="table-light">
            <tr>
              <th colSpan={4} className="text-uppercase small fw-semibold text-muted">
                {group.section}
              </th>
            </tr>
            <tr>
              <th style={{ width: '29%' }}>Élément</th>
              <th style={{ width: isEdit ? '20%' : '10%' }}>État</th>
              <th style={{ width: '20%' }}>Nature</th>
              <th style={{ width: '33%' }}>Constat</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((c) => {
              const info = mapTech.get(c.elementId)
              return (
                <tr key={`${c.critereId}-${c.elementId}`}>
                  <td className="fw-medium small">{info?.libelle ?? c.elementId}</td>
                  <td>
                    {isEdit ? (
                      <EtatSelector
                        etats={info?.etats ?? DEFAULT_ETATS}
                        value={c.etat}
                        onChange={(v) =>
                          onChangeEtat(c.critereId, c.elementId, v)
                        }
                      />
                      // <Form.Select
                      //   size="sm"
                      //   value={c.etat ?? 'Non évalué'}
                      //   className={`border-${etatsCouleur[c.etat] ?? 'secondary'}`}
                      //   onChange={(e) => onChangeEtat(c.critereId, c.elementId, e.target.value)}
                      // >
                      //   {(info?.etats ?? DEFAULT_ETATS).map(({ etat }) => (
                      //     <option key={etat} value={etat}>{etat}</option>
                      //   ))}
                      //   {!(info?.etats ?? []).some((e) => e.etat === 'Non évalué') && (
                      //     <option value="Non évalué">Non évalué</option>
                      //   )}
                      // </Form.Select>
                    ) : (
                      <Badge bg={etatsCouleur[c.etat] ?? 'secondary'} className="fw-normal">
                        {c.etat}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Ex: Béton armé"
                        value={c.nature ?? ''}
                        onChange={(e) => onChangeNature(c.critereId, c.elementId, e.target.value)}
                      />
                    ) : (
                      <span className="small">{c.nature || '—'}</span>
                    )}
                  </td>
                  <td>
                    {isEdit ? (
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Observations..."
                        value={c.constat ?? ''}
                        onChange={(e) => onChangeConstat(c.critereId, c.elementId, e.target.value)}
                      />
                    ) : (
                      <span className="small">{c.constat || '—'}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      ))}
    </>
  )
}

