/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const SalesPage = () => null

const Detached = () => {
  const { changeLayoutMode } = useLayoutContext()
  useEffect(() => {
    changeLayoutMode('detached')
  }, [])
  return <>
    <VerticalLayout>
      <SalesPage />
    </VerticalLayout>
  </>
}

export default Detached