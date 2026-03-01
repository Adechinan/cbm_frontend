/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import React, { Suspense, useEffect } from 'react'
import TopNavigationBarPage from './TopNavigationBar/page'
import FallbackLoading from '../FallbackLoading'
import HorizontalNavBar from './HorizontalNav/page'
import Footer from './Footer'
import { getHorizontalMenuItems } from '@/helpers/Manu'
import { ChildrenType } from '@/types/component-props'
import { toggleDocumentAttribute } from '@/utils/layout'
import { useLayoutContext } from '@/context/useLayoutContext'

const HorizontalLayout = ({ children }: ChildrenType) => {

  const menuItems = getHorizontalMenuItems()

  const { layoutOrientation } = useLayoutContext()

  useEffect(() => {
    toggleDocumentAttribute('data-layout', layoutOrientation === 'vertical' ? '' : 'topnav')
    
    return() => {
      toggleDocumentAttribute('data-layout', layoutOrientation === 'vertical' ? '' : 'topnav', true)
    }
  }, [])

  return (
    <div className="wrapper">
      <Suspense>
        <TopNavigationBarPage />
      </Suspense>

      <Suspense fallback={<FallbackLoading />}>
        <HorizontalNavBar menuItems={menuItems} />
      </Suspense>

      <div className="page-content">
        <div className="page-container">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default HorizontalLayout