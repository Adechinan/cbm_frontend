/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import React from 'react'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import Image from 'next/image'
import error401Img from '@/assets/images/error/error-401.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { Metadata } from 'next'
import { currentYear, developedBy } from '@/context/constants'

export const metadata: Metadata = { title: 'Error 401' }

const Error401Page = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xxl={4} xl={4} lg={5} md={6}>
            <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
              <Link href="/dashboard/sales" className="auth-brand mb-3">
                <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
                <Image src={logo} alt="logo light" height={24} className="logo-light" />
              </Link>
              <div className="mx-auto text-center">
                <h3 className="fw-semibold mb-2">Hold Up ! </h3>
                <Image src={error401Img} alt='error-401' className="mt-3 mb-2" height={230} />
                <h2 className="fw-bold mt-3 text-primary lh-base">Error Unauthorized ! </h2>
                <h4 className="fw-bold mt-2 text-dark lh-base">Access To Allowed Only For Registered User</h4>
                <p className="text-muted fs-15 mb-3">Sorry, but you are not authorized to view this page.</p>
                <Link href="/dashboard/sales" className="btn btn-primary">Back To Home <IconifyIcon icon='tabler:home' className="ms-1" /></Link>
              </div>
              <p className="mt-3 mb-0">
                 {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
              </p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default Error401Page