import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'

// Pages
import CareersPage   from './pages/CareersPage'
import AdminLogin    from './pages/AdminLogin'
import AdminLayout   from './pages/admin/AdminLayout'
import Dashboard     from './pages/admin/Dashboard'
import Candidates    from './pages/admin/Candidates'
import Subscribers   from './pages/admin/Subscribers'
import JobPostings   from './pages/admin/JobPostings'
import Analytics     from './pages/admin/Analytics'
import Settings      from './pages/admin/Settings'

function RequireAuth({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div className="spinner" /></div>
  return admin ? children : <Navigate to="/admin/login" replace />
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<CareersPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="candidates"  element={<Candidates />} />
          <Route path="subscribers" element={<Subscribers />} />
          <Route path="jobs"        element={<JobPostings />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="settings"    element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
