/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap'

export type NotesData = {
  denomination: string
  notePhysique: number
  noteFonctionnelle: number
  noteTechnique: number
}

type Props = {
  data: NotesData[]
}

export default function NotesChart({ data }: Props) {
  const opts: ApexOptions = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
    },
    series: [
      { name: 'État physique',    data: data.map((d) => d.notePhysique) },
      { name: 'État fonctionnel', data: data.map((d) => d.noteFonctionnelle) },
      { name: 'État technique',   data: data.map((d) => d.noteTechnique) },
    ],
    xaxis: {
      categories: data.map((d) => d.denomination),
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 5,
      labels: {
        formatter: (v) => v.toFixed(0),
        offsetX: -10,
      },
    },
    colors: ['#465dff', '#6ac75a', '#f7c948'],
    plotOptions: {
      bar: {
        columnWidth: '65%',
        borderRadius: 3,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      offsetY: -5,
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: -10 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (v) => v.toFixed(2) + ' / 10' },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
  }

  return (
    <Col xxl={8}>
      <Card className="h-100">
        <CardHeader className="border-bottom border-dashed">
          <h4 className="header-title mb-0">Notes par bâtiment</h4>
        </CardHeader>
        <CardBody>
          <ReactApexChart
            height={280}
            options={opts}
            series={opts.series}
            type="bar"
            className="apex-charts"
          />
          {data.length === 0 && (
            <p className="text-center text-muted py-4 mb-0">Aucune évaluation disponible</p>
          )}
        </CardBody>
      </Card>
    </Col>
  )
}
