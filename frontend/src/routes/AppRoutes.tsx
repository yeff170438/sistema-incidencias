import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

import InternalLayout from '../layouts/InternalLayout.tsx';

import LoginPage from '../features/auth/pages/LoginPage.tsx';
import AdminDashboard from '../features/admin/pages/AdminDashboard.tsx';

import IncidenciasPage from '../features/incidencias/pages/IncidenciasPage';

import TicketsPage from '../features/tickets/pages/TicketsPage'

import SAIUPage from '../features/saiu/pages/SAIUPage'
import SAIUDocumentPage from '../features/saiu/pages/SAIUDocumentPage'
import AtencionesAdminPage from '../features/atenciones/pages/AtencionesAdminPage'

import UsuariosPage from '../features/usuarios/pages/UsuariosPage'
import CiudadanosPage from '../features/ciudadanos/pages/CiudadanosPage'
// =====================================================
// ACCESO DENEGADO
// =====================================================

function AccesoDenegado() {
  return (
    <div className="container py-5">
      <div className="alert alert-danger">
        <h1 className="h4">Acceso denegado</h1>
        <p className="mb-0">
          No tienes permisos para acceder a este módulo.
        </p>
      </div>
    </div>
  );
}


// =====================================================
// MÓDULO TEMPORAL
// Se reemplazará cuando conectemos cada módulo
// con su backend.
// =====================================================

function ModuloEnConstruccion({
  nombre,
}: {
  nombre: string;
}) {
  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h1 className="h4 mb-2">{nombre}</h1>

          <p className="text-muted mb-0">
            Este módulo se implementará en la siguiente etapa.
          </p>
        </div>
      </div>
    </div>
  );
}


// =====================================================
// REDIRECCIÓN INICIAL SEGÚN EL ROL
// =====================================================

function RutaInicial() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  switch (usuario.rol.toUpperCase()) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;

    case 'OPERADOR':
      return <Navigate to="/operador" replace />;

    case 'RESPONSABLE':
      return <Navigate to="/responsable" replace />;

    case 'CIUDADANO':
      return <Navigate to="/ciudadano" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}


// =====================================================
// RUTAS
// =====================================================

function AppRoutes() {
  return (
    <Routes>

      {/* =================================================
          RUTAS PÚBLICAS
      ================================================= */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/"
        element={<RutaInicial />}
      />

      {/* =================================================
          ADMIN
          InternalLayout se monta una sola vez.
      ================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <InternalLayout>
              <Outlet />
            </InternalLayout>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<AdminDashboard />}
        />

        <Route
          path="dashboard"
          element={<Navigate to="/admin" replace />}
        />

        <Route
          path="incidencias"
          element={<IncidenciasPage />}
        />
        <Route
          path="tickets"
          element={<TicketsPage />}
        />
        <Route
          path="saiu/:id_saiu/documento"
          element={<SAIUDocumentPage />}
        />

        <Route
          path="saiu"
          element={<SAIUPage />}
        />

        <Route
          path="notificaciones"
          element={<ModuloEnConstruccion nombre="Notificaciones" />}
        />

        <Route
          path="asignaciones"
          element={<ModuloEnConstruccion nombre="Asignaciones" />}
        />

        <Route
          path="atenciones"
          element={<AtencionesAdminPage />}
        />

        <Route
          path="usuarios"
          element={<UsuariosPage />}
        />

        <Route
          path="ciudadanos"
          element={<CiudadanosPage />}
        />

        <Route
          path="configuracion"
          element={<ModuloEnConstruccion nombre="Configuración" />}
        />
      </Route>


      {/* =================================================
          OPERADOR
      ================================================= */}

      <Route
        path="/operador"
        element={
          <ProtectedRoute roles={['OPERADOR']}>
            <InternalLayout>
              <Outlet />
            </InternalLayout>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<ModuloEnConstruccion nombre="Dashboard del Operador" />}
        />

        <Route
          path="dashboard"
          element={<Navigate to="/operador" replace />}
        />

        <Route
          path="incidencias"
          element={<ModuloEnConstruccion nombre="Incidencias" />}
        />

        <Route
          path="tickets"
          element={<ModuloEnConstruccion nombre="Tickets" />}
        />

        <Route
          path="saiu"
          element={<Navigate to="/operador/tickets" replace />}
        />

        <Route
          path="notificaciones"
          element={<ModuloEnConstruccion nombre="Notificaciones" />}
        />
      </Route>


      {/* =================================================
          RESPONSABLE
      ================================================= */}

      <Route
        path="/responsable"
        element={
          <ProtectedRoute roles={['RESPONSABLE']}>
            <InternalLayout>
              <Outlet />
            </InternalLayout>
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={<ModuloEnConstruccion nombre="Dashboard del Responsable" />}
        />

        <Route
          path="dashboard"
          element={<Navigate to="/responsable" replace />}
        />

        <Route
          path="notificaciones"
          element={<ModuloEnConstruccion nombre="Notificaciones" />}
        />

        <Route
          path="saiu"
          element={<Navigate to="/responsable/atenciones" replace />}
        />

        <Route
          path="asignaciones"
          element={<ModuloEnConstruccion nombre="Asignaciones" />}
        />

        <Route
          path="atenciones"
          element={<ModuloEnConstruccion nombre="Atenciones" />}
        />
      </Route>


      {/* =================================================
          CIUDADANO
      ================================================= */}

      <Route
        path="/ciudadano"
        element={
          <ProtectedRoute roles={['CIUDADANO']}>
            <ModuloEnConstruccion nombre="Dashboard del Ciudadano" />
          </ProtectedRoute>
        }
      />


      {/* =================================================
          ACCESO DENEGADO
      ================================================= */}

      <Route
        path="/acceso-denegado"
        element={<AccesoDenegado />}
      />


      {/* =================================================
          RUTA INEXISTENTE
      ================================================= */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;