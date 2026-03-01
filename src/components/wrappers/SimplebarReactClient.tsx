/* Konrad Ahodan : konrad.ahodan@approbations.ca */
"use client"
import SimpleBar, { type Props } from 'simplebar-react'
import { ChildrenType } from '../../types/component-props'

type SimplebarReactClientProps = Props & ChildrenType

const SimplebarReactClient = ({ children, ...options }: SimplebarReactClientProps) => {
  return <SimpleBar {...options}>{children}</SimpleBar>
}

export default SimplebarReactClient
