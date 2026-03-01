/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { redirect } from 'next/navigation'

// L'ancien chemin /batiments/recensement est remplacé par /batiments/recensements/nouveau
export default function RedirectRecensement() {
  redirect('/batiments/recensements/nouveau')
}
