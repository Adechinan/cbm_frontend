/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AdminError]', error)
  }, [error])

  const isApiError = error.message?.startsWith('API error') || error.message?.includes('fetch')

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center" style={{ maxWidth: 480 }}>
        <div
          className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center bg-danger bg-opacity-10"
          style={{ width: 80, height: 80 }}
        >
          <IconifyIcon icon="tabler:server-off" className="fs-36 text-danger" />
        </div>

        <h4 className="fw-bold mb-2">Service indisponible</h4>

        <p className="text-muted mb-4">
          {isApiError
            ? 'Impossible d\'afficher la page demandée. Le serveur ne répond pas.'
            : error.message || 'Une erreur inattendue s\'est produite.'}
          <br />
          <span className="fw-semibold">Veuillez contacter votre administrateur.</span>
        </p>

        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-primary btn-sm" onClick={reset}>
            <IconifyIcon icon="tabler:refresh" className="me-1" />
            Réessayer
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => window.location.href = '/dashboard/entretien-batiment'}
          >
            <IconifyIcon icon="tabler:home" className="me-1" />
            Accueil
          </button>
        </div>

        {error.digest && (
          <p className="text-muted mt-3" style={{ fontSize: '0.7rem' }}>
            Référence : {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
