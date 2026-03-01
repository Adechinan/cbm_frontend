/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import error404Img from '@/assets/images/error/error-404.png'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currentYear } from '@/context/constants'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'

const NotFound = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <Link href="/dashboard/entretien-batiment" className="auth-brand mb-3">
              <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              <Image src={logo} alt="logo light" height={24} className="logo-light" />
            </Link>
            <div className="mx-auto text-center">
              <h3 className="fw-semibold mb-2">Ooop&apos;s ! </h3>
              <Image src={error404Img} alt="error 403 img" height={180} className="my-3" />
              <h2 className="fw-bold mt-3 text-primary lh-base">Page introuvable</h2>
              <h4 className="fw-bold mt-2 text-dark lh-base">Il manque quelque chose… ! Cette page n'est pas disponible.</h4>
              <p className="text-muted fs-12 mb-3">Désolé, nous ne trouvons pas la page que vous recherchez. Nous vous suggérons de consulter la page d'accueil.</p>
              <Link href="/dashboard/entretien-batiment" className="btn btn-primary">Retour à l'accueil <IconifyIcon icon='tabler:home' className="ms-1" /></Link>
            </div>
            {/* <p className="mt-3 mb-0">
               {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">Coderthemes</span>
            </p> */}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default NotFound