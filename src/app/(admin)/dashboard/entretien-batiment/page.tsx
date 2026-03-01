/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Col, Row } from 'react-bootstrap'
import { Metadata } from 'next'
import { getBatiments, getEvaluations, getRecensements } from '@/services/batimentService'
import StatCards from './components/StatCards'
import NotesChart from './components/NotesChart'
import StatutDonut from './components/StatutDonut'
import EvaluationsRecentes from './components/EvaluationsRecentes'
import AlertesPanel, { Alerte } from './components/AlertesPanel'
import SyntheseTable from './components/SyntheseTable'
import type { NotesData } from './components/NotesChart'
import PageTitle from '@/components/PageTitle'

export const metadata: Metadata = { title: 'Tableau de bord — Entretien Bâtiment' }

export default async function EntretienBatimentPage() {
  const [batiments, evaluations, recensements] = await Promise.all([
    getBatiments(),
    getEvaluations(),
    getRecensements(),
  ])

  // ── KPI ──────────────────────────────────────────────────────────────────
  const totalSurface = batiments.reduce((s, b) => s + b.surfaceTotale, 0)
  const evaluationsValidees = evaluations.filter((e) => e.statut === 'validé')
  const evaluationsBrouillon = evaluations.filter((e) => e.statut === 'brouillon')
  const recensementsBrouillon = recensements.filter((r) => r.statut === 'brouillon')
  const enAttente = evaluationsBrouillon.length + recensementsBrouillon.length

  // ── Index bâtiments ───────────────────────────────────────────────────────
  const batimentById = Object.fromEntries(batiments.map((b) => [b.id, b]))

  // ── Graphique notes ───────────────────────────────────────────────────────
  const notesChartData: NotesData[] = batiments.map((b) => {
    const ev =
      evaluations.find((e) => e.batimentId === b.id && e.statut === 'validé') ??
      evaluations.find((e) => e.batimentId === b.id)
    const label = b.denomination.length > 22 ? b.denomination.slice(0, 22) + '…' : b.denomination
    return {
      denomination: label,
      notePhysique: ev?.notePhysique ?? 0,
      noteFonctionnelle: ev?.noteFonctionnelle ?? 0,
      noteTechnique: ev?.noteTechnique ?? 0,
    }
  })

  // ── Donut statut ──────────────────────────────────────────────────────────
  const statutCount = batiments.reduce<Record<string, number>>((acc, b) => {
    acc[b.statutConstruction] = (acc[b.statutConstruction] ?? 0) + 1
    return acc
  }, {})

  // ── Évaluations récentes (5 dernières) ────────────────────────────────────
  const recentEvaluations = [...evaluations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((e) => ({ ...e, batiment: batimentById[e.batimentId] }))

  // ── Alertes brouillon ─────────────────────────────────────────────────────
  const alertes: Alerte[] = [
    ...evaluationsBrouillon.map((e) => ({
      id: e.id,
      type: 'evaluation' as const,
      batimentNom: batimentById[e.batimentId]?.denomination ?? e.batimentId,
      date: e.date,
      evaluateur: e.evaluateur,
    })),
    ...recensementsBrouillon.map((r) => ({
      id: r.id,
      type: 'recensement' as const,
      batimentNom: batimentById[r.batimentId]?.denomination ?? r.batimentId,
      date: r.date,
      evaluateur: r.evaluateur,
    })),
  ]

  return (
    <div >
      {/* En-tête */}

      <PageTitle title='Tableau de bord — Entretien des Bâtiments' subTitle="Accueil" />
      <div className="mb-4">
        {/* <h4 className="mb-1 fw-bold">Tableau de bord — Entretien des Bâtiments</h4> */}
        <p className="text-muted mb-0">Vue synthétique du patrimoine immobilier</p>
      </div>

      {/* KPI */}
      <StatCards
        totalBatiments={batiments.length}
        totalSurface={totalSurface}
        evaluationsValidees={evaluationsValidees.length}
        enAttente={enAttente}
      />

      {/* Graphiques */}
      <Row className="g-4 mb-4">
        <NotesChart data={notesChartData} />
        <StatutDonut data={statutCount} />
      </Row>

      {/* Évaluations récentes + Alertes */}
      <Row className="g-4 mb-4">
        <Col xxl={8}>
          <EvaluationsRecentes evaluations={recentEvaluations} />
        </Col>
        <Col xxl={4}>
          <AlertesPanel alertes={alertes} />
        </Col>
      </Row>

      {/* Synthèse globale */}
      <SyntheseTable batiments={batiments} evaluations={evaluations} />
    </div>
  )
}
