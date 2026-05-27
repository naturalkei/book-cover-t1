import { Navigate, useParams } from 'react-router-dom'

export function LegacyBookRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/v1/book/${id ?? ''}`} replace />
}
