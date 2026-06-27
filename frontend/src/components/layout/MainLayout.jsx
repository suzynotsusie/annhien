import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function MainLayout() {
  return (
    <div className="min-h-dvh bg-cream">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="lg:pl-64 pb-20 lg:pb-0 min-h-dvh">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}
