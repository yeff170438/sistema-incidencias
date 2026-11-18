import { useState, type ReactNode } from 'react'

import Sidebar from '../components/layout/Sidebar.tsx'
import Topbar from '../components/layout/Topbar.tsx'
import './layout.css';
interface InternalLayoutProps {
  children: ReactNode
}

function InternalLayout({ children }: InternalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="app-main">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default InternalLayout