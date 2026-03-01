/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { EtatDisponible } from '@/types/entretien-batiment'
import { ETATS_COULEUR } from '../../evaluations/nouveau/components/EvaluationForm'

type EtatOption = { etat: string; note: number }

export const DEFAULT_ETATS: EtatOption[] = [
  { etat: 'Bon', note: 3 },
  { etat: 'Passable', note: 2 },
  { etat: 'Mauvais', note: 1 },
]


/** Boutons-onglets pour sélectionner un état */
export default function EtatSelector({
  etats,
  value,
  onChange,
}: {
  etats: EtatDisponible[]
  value: string
  onChange: (v: string) => void
}) {
  const hasNonEvalue = etats.some((e) => e.etat === 'Non évalué')
  const allEtats: EtatDisponible[] = hasNonEvalue
    ? etats
    : [...etats, { etat: 'Non évalué', note: 0 }]

  return (
    <div className="d-flex flex-wrap gap-1">
      {allEtats.map(({ etat }) => {
        const bg = ETATS_COULEUR[etat] ?? 'secondary'
        const active = value === etat
        return (
          <button
            key={etat}
            type="button"
            onClick={() => onChange(etat)}
            className={`btn btn-sm ${active ? `btn-${bg}` : `btn-outline-${bg}`}`}
            style={{ fontSize: '0.72rem', fontWeight: active ? 600 : 400, padding: '0.18rem 0.5rem' }}
          >
            {etat}
          </button>
        )
      })}
    </div>
  )
}

