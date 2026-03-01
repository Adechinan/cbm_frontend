/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const STATUT_COLORS: Record<string, string> = {
  'En rénovation':     '#6ac75a',
  Actif:      '#465dff',
  'En travaux': '#f7c948',
  Fermé:      '#f7577e',
  Inactif:    '#aab8c5',
}

type Props = {
  data: Record<string, number>
}

export default function StatutDonut({ data }: Props) {
  const labels  = Object.keys(data)
  const series  = labels.map((l) => data[l])
  const colors  = labels.map((l) => STATUT_COLORS[l] ?? '#aab8c5')
  const total   = series.reduce((a, b) => a + b, 0)

  const opts: ApexOptions = {
    chart: { type: 'donut', height: 220 },
    series,
    labels,
    colors,
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => String(total),
            },
          },
        },
      },
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: {
      y: { formatter: (v) => `${v} bâtiment${v > 1 ? 's' : ''}` },
    },
  }

  return (
    <Col xxl={4}>
      <Card className="h-100">
        <CardHeader className="border-bottom border-dashed">
          <h4 className="header-title mb-0">Répartition par statut</h4>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            height={220}
            options={opts}
            series={series}
            type="donut"
            className="apex-charts"
          />
          <div className="mt-2">
            {labels.map((l, i) => (
              <div key={l} className="d-flex justify-content-between align-items-center py-1 border-bottom border-dashed">
                <div className="d-flex align-items-center">
                  <IconifyIcon
                    icon="tabler:circle-filled"
                    className="fs-12 align-middle me-2"
                    style={{ color: colors[i] }}
                  />
                  <span className="fw-medium">{l}</span>
                </div>
                <span className="fw-semibold text-muted">{series[i]}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </Col>
  )
}
