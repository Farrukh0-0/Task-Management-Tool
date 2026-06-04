import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskDashboard from './pages/TaskDashboard'
import TaskCreation from './pages/TaskCreation'
import Navigation from './components/Navigation'
import { clearAuth, getAuth, setAuth } from './services/authStorage'
import './App.css'

function App() {
  const [auth, setAuthState] = useState(getAuth())

  useEffect(() => {
    setAuthState(getAuth())
  }, [])

  const handleAuth = (data) => {
    setAuth(data)
    setAuthState(data)
  }

  const handleLogout = () => {
    clearAuth()
    setAuthState(null)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navigation auth={auth} onLogout={handleLogout} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={auth ? <Navigate to="/tasks" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage onAuth={handleAuth} />} />
            <Route path="/register" element={<RegisterPage onAuth={handleAuth} />} />
            <Route path="/tasks" element={auth ? <TaskDashboard auth={auth} /> : <Navigate to="/login" />} />
            <Route path="/create-task" element={auth ? <TaskCreation auth={auth} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
