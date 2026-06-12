import { Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()
  
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}

export default App
