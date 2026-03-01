/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import FallbackLoading from '@/components/FallbackLoading'
import LogoBox from '@/components/LogoBox'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { getMenuItems } from '@/helpers/Manu'
import Image from 'next/image'
import { lazy, Suspense } from 'react'
import coffeeImg from '@/assets/images/coffee-cup.svg'
import { useLayoutContext } from '@/context/useLayoutContext'
import HoverMenuToggle from './components/HoverMenuToggle'
import { Button } from 'react-bootstrap'

const AppMenu = lazy(() => import('./components/AppMenu'))

const VerticalNavigationBar = () => {

  const { toggleBackdrop } = useLayoutContext()
  const menuItems = getMenuItems()
  return (
    <div className="sidenav-menu" id="leftside-menu-container">
      <LogoBox />
      <HoverMenuToggle />
      <button onClick={toggleBackdrop} className="button-close-fullsidebar">
        <span>
          <IconifyIcon icon='tabler:x' className="align-middle" />
        </span>
      </button>
      <SimplebarReactClient>

        <Suspense fallback={<FallbackLoading />}>
          <AppMenu menuItems={menuItems} />

          {/* <div className="help-box text-center">
            <Image src={coffeeImg} height={90} alt="Helper Icon Image" />
            <h5 className="mt-3 fw-semibold fs-16">Unlimited Access</h5>
            <p className="mb-3 text-muted">Upgrade to plan to get access to unlimited reports</p>
            <Button variant='danger' size='sm'>Upgrade</Button>
          </div> */}
          <div className="clearfix" />
        </Suspense>
      </SimplebarReactClient>
    </div>

  )
}

export default VerticalNavigationBar