/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { BatimentType, ZoneClimatiqueType } from '@/types/entretien-batiment'

// Couleurs par zone climatique (même ordre que zonesClimatiques triées par ordre)
const ZONE_COLORS = ['#198754', '#fd7e14', '#dc3545']

function getZoneIndex(departement: string, zones: ZoneClimatiqueType[]): number {
  return zones.findIndex((z) => z.departements.some((d) => d.nom === departement))
}

type Props = {
  batiments: BatimentType[]
  zonesClimatiques: ZoneClimatiqueType[]
}

export default function BatimentsMap({ batiments, zonesClimatiques }: Props) {
  return (
    <MapContainer
      center={[9.3, 2.3]}
      zoom={7}
      style={{ height: 520, width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {batiments.map((b) => {
        const idx   = getZoneIndex(b.departement, zonesClimatiques)
        const color = idx >= 0 ? ZONE_COLORS[idx % ZONE_COLORS.length] : '#6c757d'
        return (
          <CircleMarker
            key={b.id}
            center={[b.latitude!, b.longitude!]}
            radius={9}
            pathOptions={{ fillColor: color, color: '#fff', weight: 1.5, fillOpacity: 0.85 }}
          >
            <Popup>
              <div style={{ minWidth: 190 }}>
                <div className="fw-semibold">{b.codeBatiment || b.code || '—'}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{b.organisme || b.denomination || '—'}</div>
                <hr style={{ margin: '4px 0' }} />
                <div style={{ fontSize: 12 }}>
                  <span className="text-muted">Commune : </span>{b.commune}<br />
                  <span className="text-muted">Dép. : </span>{b.departement}<br />
                  {b.arrondissement && (
                    <><span className="text-muted">Arr. : </span>{b.arrondissement}<br /></>
                  )}
                  <span className="text-muted">Usage(s) : </span>
                  {b.usages?.length ? b.usages.join(', ') : '—'}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
