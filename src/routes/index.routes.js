const express = require('express');

const router = express.Router();

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
// Auditoria
// =====================================

router.use(
    '/auditoria',
    auditoriaRoutes
);

router.use(
    '/notificaciones',
    notificacionesRoutes
);


router.use(
    '/archivos',
    archivosRoutes
);
module.exports = router;


router.use(
    '/solicitudes-incidencias',
    solicitudesIncidenciasRoutes
);