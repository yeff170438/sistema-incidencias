const express = require('express');

const router = express.Router();


// =====================================
// Inicio de la API
// =====================================

router.get('/', (req, res) => {

    res.json({
        mensaje: 'Sistema de Gestión de Incidencias Urbanas V5',
        estado: 'API funcionando correctamente',
        version: '1.0.0'
    });

});


router.get('/health', (req, res) => {

    res.json({
        estado: 'OK',
        uptime: process.uptime()
    });

});


// =====================================
// Rutas
// =====================================

const authRoutes =
    require('../modules/auth/auth.routes');

const usuariosRoutes =
    require('../modules/usuarios/usuarios.routes');

const ciudadanosRoutes =
    require('../modules/ciudadanos/ciudadanos.routes');

const incidenciasRoutes =
    require('../modules/incidencias/incidencias.routes');

const ticketsRoutes =
    require('../modules/tickets/tickets.routes');

const asignacionesRoutes =
    require('../modules/asignaciones/asignaciones.routes');

const derivacionesRoutes =
    require('../modules/derivaciones/derivaciones.routes');

const atencionesRoutes =
    require('../modules/atenciones/atenciones.routes');

const encuestasRoutes =
    require('../modules/encuestas/encuestas.routes');

const seguimientoRoutes =
    require('../modules/seguimiento_ticket/seguimiento.routes');

const auditoriaRoutes =
    require('../modules/auditoria/auditoria.routes');

const notificacionesRoutes =
    require('../modules/notificaciones/notificaciones.routes');

const archivosRoutes =
    require('../modules/archivos/archivos.routes');

const solicitudesIncidenciasRoutes =
    require('../modules/solicitudes_incidencias/solicitudes_incidencias.routes');

const adminRoutes =
    require('../modules/admin/admin.routes');
// =====================================
// Autenticación
// =====================================

router.use(
    '/auth',
    authRoutes
);


// =====================================
// Usuarios
// =====================================

router.use(
    '/usuarios',
    usuariosRoutes
);


// =====================================
// Ciudadanos
// =====================================

router.use(
    '/ciudadanos',
    ciudadanosRoutes
);


// =====================================
// Incidencias
// =====================================

router.use(
    '/incidencias',
    incidenciasRoutes
);


// =====================================
// Tickets
// =====================================

router.use(
    '/tickets',
    ticketsRoutes
);


// =====================================
// Asignaciones
// =====================================

router.use(
    '/asignaciones',
    asignacionesRoutes
);


// =====================================
// Derivaciones
// =====================================

router.use(
    '/derivaciones',
    derivacionesRoutes
);


// =====================================
// Atenciones
// =====================================

router.use(
    '/atenciones',
    atencionesRoutes
);


// =====================================
// Encuestas
// =====================================

router.use(
    '/encuestas',
    encuestasRoutes
);


// =====================================
// Seguimiento
// =====================================

router.use(
    '/seguimiento',
    seguimientoRoutes
);


// =====================================
// Auditoría
// =====================================

router.use(
    '/auditoria',
    auditoriaRoutes
);


// =====================================
// Notificaciones
// =====================================

router.use(
    '/notificaciones',
    notificacionesRoutes
);


// =====================================
// Archivos
// =====================================

router.use(
    '/archivos',
    archivosRoutes
);


// =====================================
// Solicitudes de incidencias
// =====================================

router.use(
    '/solicitudes-incidencias',
    solicitudesIncidenciasRoutes
);

router.use(
    '/admin',
    adminRoutes
);
// =====================================
// Exportar router
// =====================================

module.exports = router;