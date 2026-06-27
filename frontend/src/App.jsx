import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Messages from './pages/Messages'
import Portal from './pages/Portal'
import StaffWorkspace from './pages/StaffWorkspace'
import Community from './pages/Community'
import HealingStation from './pages/HealingStation'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { readSession } from './lib/auth'

function staffHome(role) {
  if (role === 'doctor') return '/doctor'
  if (role === 'healer') return '/healer'
  if (role === 'admin') return '/admin'
  return '/'
}

function RequirePatient({ children }) {
  const { token, role } = readSession()
  if (!token) {
    return <Navigate to="/onboarding" replace />
  }
  if (role === 'doctor' || role === 'healer' || role === 'admin') {
    return <Navigate to={staffHome(role)} replace />
  }
  return children
}

function SkipIfAuthenticated({ children }) {
  const { token, role } = readSession()
  if (token) {
    return <Navigate to={staffHome(role)} replace />
  }
  return children
}

function SkipIfStaffAuthenticated({ children }) {
  const { token, role } = readSession()
  if (token && (role === 'doctor' || role === 'healer' || role === 'admin')) {
    return <Navigate to={staffHome(role)} replace />
  }
  return children
}

function RequireStaffRole({ role, children }) {
  const session = readSession()
  if (!session.token) {
    return <Navigate to="/portal" replace />
  }
  if (session.role !== role) {
    return <Navigate to={staffHome(session.role)} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/onboarding"
        element={
          <SkipIfAuthenticated>
            <Onboarding />
          </SkipIfAuthenticated>
        }
      />

      <Route
        path="/portal"
        element={
          <SkipIfStaffAuthenticated>
            <Portal />
          </SkipIfStaffAuthenticated>
        }
      />
      <Route
        path="/staff"
        element={
          <SkipIfStaffAuthenticated>
            <Portal />
          </SkipIfStaffAuthenticated>
        }
      />

      <Route
        path="/doctor"
        element={
          <RequireStaffRole role="doctor">
            <StaffWorkspace role="doctor" />
          </RequireStaffRole>
        }
      />
      <Route
        path="/healer"
        element={
          <RequireStaffRole role="healer">
            <StaffWorkspace role="healer" />
          </RequireStaffRole>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireStaffRole role="admin">
            <Admin />
          </RequireStaffRole>
        }
      />

      <Route
        element={
          <RequirePatient>
            <MainLayout />
          </RequirePatient>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/trang-chu" element={<Home />} />
        <Route path="/tin-nhan" element={<Messages />} />
        <Route path="/nhan-tin" element={<Messages />} />
        <Route path="/cong-dong" element={<Community />} />
        <Route path="/tram-chua-lanh" element={<HealingStation />} />
        <Route path="/ho-so" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
