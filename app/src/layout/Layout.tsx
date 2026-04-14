import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

export function Layout() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">Transacciones</div>
        <nav className="nav" aria-label="Secciones">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/manage"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Manage
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
