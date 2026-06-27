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
import { isStaffRole, readSession, roleHome } from './lib/auth'

function RequirePatient({ children }) {
  const { token, role, onboarded } = readSession()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (isStaffRole(role)) {
    return <Navigate to={roleHome(role)} replace />
  }
  if (!onboarded) {
    return <Navigate to="/onboarding" replace />
  }
  return children
}

function SkipIfAuthenticated({ children }) {
  const { token, role, onboarded } = readSession()
  if (token) {
    return <Navigate to={roleHome(role, onboarded)} replace />
  }
  return children
}

function RequireOnboarding({ children }) {
  const { token, role, onboarded } = readSession()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  if (isStaffRole(role)) {
    return <Navigate to={roleHome(role)} replace />
  }
  if (onboarded) {
    return <Navigate to="/home" replace />
  }
  return children
}

function RequireStaffRole({ role, children }) {
  const session = readSession()
  if (!session.token) {
    return <Navigate to="/login" replace />
  }
  if (session.role !== role) {
    return <Navigate to={roleHome(session.role, session.onboarded)} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SkipIfAuthenticated>
            <Portal />
          </SkipIfAuthenticated>
        }
      />

      <Route
        path="/login"
        element={
          <SkipIfAuthenticated>
            <Portal />
          </SkipIfAuthenticated>
        }
      />
      <Route
        path="/portal"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="/staff"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/onboarding"
        element={
          <RequireOnboarding>
            <Onboarding />
          </RequireOnboarding>
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
