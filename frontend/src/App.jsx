import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Messages from './pages/Messages'
import Portal from './pages/Portal'
import StaffWorkspace from './pages/StaffWorkspace'
import { readSession } from './lib/auth'

function staffHome(role) {
  if (role === 'doctor') return '/doctor'
  if (role === 'healer') return '/healer'
  return '/'
}

function RequirePatient({ children }) {
  const { token, role } = readSession()
  if (!token) {
    return <Navigate to="/onboarding" replace />
  }
  if (role === 'doctor' || role === 'healer') {
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
  if (token && (role === 'doctor' || role === 'healer')) {
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

function ComingSoon({ icon, title, description }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream p-4">
      <div className="glass-card max-w-md rounded-3xl p-10 text-center">
        <p className="mb-3 text-4xl">{icon}</p>
        <h2 className="mb-1 text-lg font-semibold text-bark">{title}</h2>
        <p className="text-sm font-light text-bark-light/50">{description}</p>
      </div>
    </div>
  )
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
        <Route
          path="/cong-dong"
          element={<ComingSoon icon="🌍" title="Cộng đồng" description="Sắp ra mắt..." />}
        />
        <Route
          path="/tram-chua-lanh"
          element={<ComingSoon icon="🌿" title="Trạm chữa lành" description="Sắp ra mắt..." />}
        />
        <Route
          path="/ho-so"
          element={<ComingSoon icon="👤" title="Hồ sơ" description="Sắp ra mắt..." />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
