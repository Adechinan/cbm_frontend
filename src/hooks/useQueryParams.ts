/* Konrad Ahodan : konrad.ahodan@approbations.ca */
const useQueryParams = () => {
  if (typeof window === 'undefined') return {} as Record<string, string>
  const urlSearchParams = new URLSearchParams(window.location.search)
  return Object.fromEntries(urlSearchParams.entries()) as Record<string, string>
}

export default useQueryParams
