/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const SalesPage = () => null

const HoverMenu = () => {
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('sm-hover')
  }, [])
  return (
    <>
      <VerticalLayout>
        <SalesPage />
      </VerticalLayout>
    </>
  )
}

export default HoverMenu
