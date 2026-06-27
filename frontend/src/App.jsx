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

export default function App() {
  return (
    <Routes>
      {/* Patient onboarding - no traditional login/signup */}
      <Route path="/onboarding" element={
        <SkipIfAuthenticated>
          <Onboarding />
        </SkipIfAuthenticated>
      } />

      {/* Hidden staff portal */}
      <Route path="/portal" element={
        <SkipIfStaffAuthenticated>
          <Portal />
        </SkipIfStaffAuthenticated>
      } />

      {/* Staff workspaces */}
      <Route path="/doctor" element={
        <RequireStaffRole role="doctor">
          <StaffWorkspace role="doctor" />
        </RequireStaffRole>
      } />
      <Route path="/healer" element={
        <RequireStaffRole role="healer">
          <StaffWorkspace role="healer" />
        </RequireStaffRole>
      } />

      {/* Patient app */}
      <Route element={
        <RequirePatient>
          <MainLayout />
        </RequirePatient>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tin-nhan" element={<Messages />} />
        <Route path="/cong-dong" element={
          <div className="flex min-h-dvh items-center justify-center bg-cream p-4">
            <div className="max-w-md text-center glass-card rounded-3xl p-10">
              <p className="text-4xl mb-3">🌍</p>
              <h2 className="text-lg font-semibold text-bark mb-1">Cộng đồng</h2>
              <p className="text-sm text-bark-light/50 font-light">Sắp ra mắt...</p>
            </div>
          </div>
        } />
        <Route path="/tram-chua-lanh" element={
          <div className="flex min-h-dvh items-center justify-center bg-cream p-4">
            <div className="max-w-md text-center glass-card rounded-3xl p-10">
              <p className="text-4xl mb-3">🌿</p>
              <h2 className="text-lg font-semibold text-bark mb-1">Trạm chữa lành</h2>
              <p className="text-sm text-bark-light/50 font-light">Sắp ra mắt...</p>
            </div>
          </div>
        } />
        <Route path="/ho-so" element={
          <div className="flex min-h-dvh items-center justify-center bg-cream p-4">
            <div className="max-w-md text-center glass-card rounded-3xl p-10">
              <p className="text-4xl mb-3">👤</p>
              <h2 className="text-lg font-semibold text-bark mb-1">Hồ sơ</h2>
              <p className="text-sm text-bark-light/50 font-light">Sắp ra mắt...</p>
            </div>
          </div>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
