import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user?.isLoggedIn) return <Navigate to="/signin" replace />
  return children
}
