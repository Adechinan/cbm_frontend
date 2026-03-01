/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const SalesPage = () => null

const Compact = () => {
  const router = useRouter()
  const { changeMenu } = useLayoutContext()
  useEffect(() => {
    changeMenu.size('compact')
  }, [])
  return (
    <>
      <VerticalLayout>
        <SalesPage />
      </VerticalLayout>
    </>
  )
}

export default Compact
