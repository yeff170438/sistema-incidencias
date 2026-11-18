import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import './topbar.css';


// =====================================================
// PROPS
// =====================================================

interface TopbarProps {
  onMenuClick: () => void;
}


// =====================================================
// INICIALES DEL USUARIO
// =====================================================

function obtenerIniciales(nombre: string): string {
  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) {
    return 'US';
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase();
}


// =====================================================
// NOMBRE DEL ROL
// =====================================================

function obtenerNombreRol(rol: string): string {
  switch (rol.toUpperCase()) {
    case 'ADMIN':
      return 'Administrador';

    case 'OPERADOR':
      return 'Operador';

    case 'RESPONSABLE':
      return 'Responsable';

    case 'CIUDADANO':
      return 'Ciudadano';

    default:
      return rol || 'Usuario';
  }
}


// =====================================================
// RUTAS DE NOTIFICACIONES
// =====================================================

const rutasNotificaciones: Record<string, string> = {
  ADMIN: '/admin/notificaciones',
  OPERADOR: '/operador/notificaciones',
  RESPONSABLE: '/responsable/notificaciones',
};


// =====================================================
// TOPBAR
// =====================================================

function Topbar({
  onMenuClick,
}: TopbarProps) {

  const { usuario, logout } = useAuth();

  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const nombre = usuario?.nombre ?? 'Usuario';
  const rol = usuario?.rol?.toUpperCase() ?? '';

  const iniciales = obtenerIniciales(nombre);
  const nombreRol = obtenerNombreRol(rol);


  // ===================================================
  // CERRAR EL MENÚ AL PULSAR FUERA O ESCAPE
  // ===================================================

  useEffect(() => {

    if (!menuAbierto) {
      return;
    }

    const manejarClickExterior = (event: PointerEvent) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuAbierto(false);
      }
    };

    const manejarEscape = (event: KeyboardEvent) => {

      if (event.key === 'Escape') {
        setMenuAbierto(false);
      }
    };

    document.addEventListener(
      'pointerdown',
      manejarClickExterior
    );

    document.addEventListener(
      'keydown',
      manejarEscape
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        manejarClickExterior
      );

      document.removeEventListener(
        'keydown',
        manejarEscape
      );
    };

  }, [menuAbierto]);


  // ===================================================
  // ABRIR NOTIFICACIONES
  // ===================================================

  const abrirNotificaciones = () => {

    const ruta = rutasNotificaciones[rol];

    if (!ruta) {
      return;
    }

    setMenuAbierto(false);

    navigate(ruta);
  };


  // ===================================================
  // CERRAR SESIÓN
  // ===================================================

  const cerrarSesion = () => {

    setMenuAbierto(false);

    logout();

    navigate('/login', {
      replace: true,
    });
  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <header className="app-topbar">

      {/* IZQUIERDA */}

      <div className="topbar-left">

        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <i className="bi bi-list" />
        </button>

        <div className="topbar-page-context">
          Sistema de Gestión de Incidencias
        </div>

      </div>


      {/* DERECHA */}

      <div className="topbar-right">

        {/* NOTIFICACIONES */}

        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Abrir notificaciones"
          title="Notificaciones"
          onClick={abrirNotificaciones}
          disabled={!rutasNotificaciones[rol]}
        >
          <i className="bi bi-bell" />
        </button>


        {/* MENÚ DE USUARIO */}

        <div
          className="topbar-user-menu"
          ref={menuRef}
        >

          <button
            type="button"
            className="topbar-user topbar-user-trigger"
            onClick={() => {
              setMenuAbierto(abierto => !abierto);
            }}
            aria-label="Opciones del usuario"
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
          >

            <div className="user-avatar">
              {iniciales}
            </div>

            <div className="user-details">

              <div className="user-name">
                {nombre}
              </div>

              <div className="user-role">
                {nombreRol}
              </div>

            </div>

            <i
              className={`bi ${
                menuAbierto
                  ? 'bi-chevron-up'
                  : 'bi-chevron-down'
              } user-arrow`}
            />

          </button>


          {/* CONTENIDO DESPLEGABLE */}

          {menuAbierto && (

            <div
              className="topbar-user-dropdown"
              role="menu"
            >

              <div className="topbar-dropdown-header">

                <div className="topbar-dropdown-name">
                  {nombre}
                </div>

                <div className="topbar-dropdown-role">
                  {nombreRol}
                </div>

              </div>

              <div className="topbar-dropdown-divider" />

              <button
                type="button"
                className="topbar-dropdown-item logout"
                role="menuitem"
                onClick={cerrarSesion}
              >

                <i className="bi bi-box-arrow-right" />

                <span>
                  Cerrar sesión
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>

  );
}

export default Topbar;