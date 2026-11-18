import { NavLink } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import './sidebar.css';


// =====================================================
// PROPS
// =====================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}


// =====================================================
// ELEMENTOS DEL MENÚ
// =====================================================

interface MenuItem {
  label: string;
  icon: string;
  section: string;
  to: string;
}


// =====================================================
// MENÚS POR ROL
// =====================================================

const menusPorRol: Record<string, MenuItem[]> = {

  // ===================================================
  // ADMIN
  // ===================================================

  ADMIN: [
    {
      section: 'PRINCIPAL',
      label: 'Dashboard',
      icon: 'bi bi-grid-1x2-fill',
      to: '/admin',
    },
    {
      section: 'GESTIÓN',
      label: 'Incidencias',
      icon: 'bi bi-geo-alt-fill',
      to: '/admin/incidencias',
    },
    {
      section: 'GESTIÓN',
      label: 'Tickets',
      icon: 'bi bi-ticket-perforated-fill',
      to: '/admin/tickets',
    },
    {
      section: 'GESTIÓN',
      label: 'SAIU',
      icon: 'bi bi-file-earmark-text-fill',
      to: '/admin/saiu',
    },
    {
      section: 'GESTIÓN',
      label: 'Notificaciones',
      icon: 'bi bi-bell-fill',
      to: '/admin/notificaciones',
    },
    {
      section: 'ATENCIÓN',
      label: 'Asignaciones',
      icon: 'bi bi-inboxes-fill',
      to: '/admin/asignaciones',
    },
    {
      section: 'ATENCIÓN',
      label: 'Atenciones',
      icon: 'bi bi-tools',
      to: '/admin/atenciones',
    },
    {
      section: 'ADMINISTRACIÓN',
      label: 'Usuarios',
      icon: 'bi bi-people-fill',
      to: '/admin/usuarios',
    },
    {
      section: 'ADMINISTRACIÓN',
      label: 'Ciudadanos',
      icon: 'bi bi-person-vcard-fill',
      to: '/admin/ciudadanos',
    },
    {
      section: 'ADMINISTRACIÓN',
      label: 'Configuración',
      icon: 'bi bi-gear-fill',
      to: '/admin/configuracion',
    },
  ],


  // ===================================================
  // OPERADOR
  // ===================================================

  OPERADOR: [
    {
      section: 'PRINCIPAL',
      label: 'Dashboard',
      icon: 'bi bi-grid-1x2-fill',
      to: '/operador',
    },
    {
      section: 'GESTIÓN',
      label: 'Incidencias',
      icon: 'bi bi-geo-alt-fill',
      to: '/operador/incidencias',
    },
    {
      section: 'GESTIÓN',
      label: 'Tickets',
      icon: 'bi bi-ticket-perforated-fill',
      to: '/operador/tickets',
    },
    {
      section: 'GESTIÓN',
      label: 'SAIU',
      icon: 'bi bi-file-earmark-text-fill',
      to: '/operador/saiu',
    },
    {
      section: 'GESTIÓN',
      label: 'Notificaciones',
      icon: 'bi bi-bell-fill',
      to: '/operador/notificaciones',
    },
  ],


  // ===================================================
  // RESPONSABLE
  // ===================================================

  RESPONSABLE: [
    {
      section: 'PRINCIPAL',
      label: 'Dashboard',
      icon: 'bi bi-grid-1x2-fill',
      to: '/responsable',
    },
    {
      section: 'GESTIÓN',
      label: 'Notificaciones',
      icon: 'bi bi-bell-fill',
      to: '/responsable/notificaciones',
    },
    {
      section: 'ATENCIÓN',
      label: 'SAIU',
      icon: 'bi bi-file-earmark-text-fill',
      to: '/responsable/saiu',
    },
    {
      section: 'ATENCIÓN',
      label: 'Asignaciones',
      icon: 'bi bi-inboxes-fill',
      to: '/responsable/asignaciones',
    },
    {
      section: 'ATENCIÓN',
      label: 'Atenciones',
      icon: 'bi bi-tools',
      to: '/responsable/atenciones',
    },
  ],
};


// =====================================================
// SIDEBAR
// =====================================================

function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {

  const { usuario } = useAuth();

  const rol = usuario?.rol?.toUpperCase() ?? '';

  const menuActual = menusPorRol[rol] ?? [];

  let ultimaSeccion = '';

  return (
    <>
      {/* Capa de fondo para el menú móvil */}

      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />

      <aside
        className={`app-sidebar ${isOpen ? 'mobile-open' : ''}`}
      >

        {/* =================================================
            MARCA
        ================================================= */}

        <div className="sidebar-brand">

          <div className="brand-icon">
            <i className="bi bi-buildings-fill" />
          </div>

          <div className="brand-text">

            <div className="brand-title">
              Incidencias
            </div>

            <div className="brand-subtitle">
              Municipalidad
            </div>

          </div>

        </div>


        {/* =================================================
            NAVEGACIÓN
        ================================================= */}

        <nav className="sidebar-menu">

          {menuActual.map((item) => {

            const mostrarSeccion =
              item.section !== ultimaSeccion;

            ultimaSeccion = item.section;

            const esDashboard =
              item.label === 'Dashboard';

            return (
              <div key={`${item.section}-${item.label}`}>

                {mostrarSeccion && (
                  <div className="menu-section">
                    {item.section}
                  </div>
                )}

                <NavLink
                  to={item.to}
                  end={esDashboard}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >

                  <i className={item.icon} />

                  <span>
                    {item.label}
                  </span>

                </NavLink>

              </div>
            );

          })}

        </nav>

      </aside>
    </>
  );
}

export default Sidebar;