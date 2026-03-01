/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { EtatDisponible } from '@/types/entretien-batiment'
import { Badge, Form, Table } from 'react-bootstrap'
import { ETATS_COULEUR } from '../../evaluations/nouveau/components/EvaluationForm'
import EtatSelector, { DEFAULT_ETATS } from './EtatSelector'

type EvalFoncRow = {
  critereId: string
  elementId: string
  etat: string
  commentaire?: string
}

type EtatOption = { etat: string; note: number }

type Props = {
  groups: Array<{
    critereId: string
    section: string
    rows: EvalFoncRow[]
  }>
  mapFonc: Map<string, { libelle: string; section: string; etats: EtatOption[] }>
  etatsCouleur: Record<string, string>
  isEdit?: boolean
  onChangeEtat: (critereId: string, elementId: string, value: string) => void
  onChangeCommentaire: (critereId: string, elementId: string, value: string) => void
}


export default function FonctionnelGroupedForm({
  groups,
  mapFonc,
  etatsCouleur,
  isEdit = true,
  onChangeEtat,
  onChangeCommentaire,
}: Props) {
  return (
    <>
      {groups.map((group) => (
        <Table key={group.critereId} hover responsive className="align-middle table-sm mb-4">
          <thead className="table-light">
            <tr>
              <th colSpan={3} className="text-uppercase small fw-semibold text-muted">
                {group.section}
              </th>
            </tr>
            <tr>
              <th>Élément</th>
              <th style={{ width: isEdit ? '18%' : '12%' }}>État</th>
              <th style={{ width: isEdit ? '28%' : '25%' }}>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map((c) => {
              const info = mapFonc.get(c.elementId)
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
                      //   value={c.etat}
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
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Commentaire (facultatif)"
                        value={c.commentaire ?? ''}
                        onChange={(e) => onChangeCommentaire(c.critereId, c.elementId, e.target.value)}
                      />
                    ) : (
                      <span className="small text-muted">{c.commentaire || '—'}</span>
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
