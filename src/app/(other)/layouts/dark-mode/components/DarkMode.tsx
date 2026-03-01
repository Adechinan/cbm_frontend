/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import VerticalLayout from '@/components/layout/VerticalLayout'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useEffect } from 'react'

const SalesPage = () => null

const DarkMode = () => {
  const { changeTheme } = useLayoutContext()
  useEffect(() => {
    changeTheme('dark')
  }, [])
  return (
    <VerticalLayout>
      <SalesPage />
    </VerticalLayout>
  )
}

export default DarkMode
