-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 08_seed.sql
-- Descripción:
-- Datos iniciales del sistema
-- =====================================================



-- =====================================================
-- OFICINAS
-- =====================================================

INSERT INTO oficinas (nombre, descripcion) VALUES

('Mesa de Partes',
'Recepción, validación y derivación inicial de incidencias'),

('Sub Gerencia de Obras',
'Ejecución y supervisión de obras públicas'),

('Sub Gerencia de Mantenimiento de Infraestructura',
'Mantenimiento de vías, puentes y espacios públicos'),

('Sub Gerencia de Administración y Control Urbano-Rural',
'Fiscalización urbana y control territorial'),

('Sub Gerencia de Ordenamiento Territorial y Catastro',
'Gestión catastral y ordenamiento territorial'),

('Sub Gerencia de Seguridad Ciudadana y Monitoreo',
'Seguridad ciudadana y monitoreo municipal'),

('Sub Gerencia de Tránsito',
'Gestión del tránsito y señalización vial'),

('Sub Gerencia de Gestión de Residuos Sólidos',
'Limpieza pública y residuos sólidos'),

('Sub Gerencia de Gestión, Fiscalización y Saneamiento Ambiental',
'Fiscalización ambiental y saneamiento'),

('Sub Gerencia de Gestión de Recursos Naturales y Zoonosis',
'Control de zoonosis y recursos naturales'),

('Sub Gerencia de Comercio, Policía Municipal y Control',
'Fiscalización del comercio y policía municipal'),

('Sub Gerencia de Salud, Programas Sociales y Bienestar de la Persona',
'Atención social y programas municipales'),

('Sub Gerencia de Administración de Locales',
'Administración de mercados y locales municipales'),

('Oficina de Gestión de Riesgos de Desastres',
'Prevención y atención de emergencias');



-- =====================================================
-- ROLES
-- =====================================================

INSERT INTO roles
(
    nombre,
    descripcion
)

VALUES

(
'ADMIN',
'Administrador general del sistema'
),

(
'OPERADOR',
'Valida incidencias, genera el FUT y asigna tickets'
),

(
'RESPONSABLE',
'Responsable de la atención de tickets de su oficina'
);



-- =====================================================
-- PERMISOS DEL SISTEMA
-- =====================================================

INSERT INTO permisos
(
    nombre,
    modulo,
    descripcion
)

VALUES

-- USUARIOS

('usuarios.crear','usuarios','Permite crear usuarios'),
('usuarios.listar','usuarios','Permite listar usuarios'),
('usuarios.ver','usuarios','Permite visualizar usuarios'),
('usuarios.editar','usuarios','Permite editar usuarios'),
('usuarios.eliminar','usuarios','Permite eliminar usuarios'),
('usuarios.cambiar_estado','usuarios','Permite activar o desactivar usuarios'),

-- INCIDENCIAS

('incidencias.listar','incidencias','Permite listar incidencias'),
('incidencias.ver','incidencias','Permite visualizar incidencias'),
('incidencias.validar','incidencias','Permite validar incidencias'),
('incidencias.rechazar','incidencias','Permite rechazar incidencias'),

-- TICKETS

('tickets.crear','tickets','Permite generar tickets'),
('tickets.ver','tickets','Permite visualizar tickets'),
('tickets.asignar','tickets','Permite asignar tickets'),
('tickets.derivar','tickets','Permite derivar tickets'),
('tickets.atender','tickets','Permite registrar atención'),
('tickets.resolver','tickets','Permite resolver tickets'),
('tickets.cerrar','tickets','Permite cerrar tickets'),

-- DOCUMENTOS

('documentos.generar','documentos','Permite generar documentos'),
('documentos.ver','documentos','Permite visualizar documentos'),

-- ATENCIONES

(
'atenciones.iniciar',
'atenciones',
'Permite iniciar la atención de un ticket asignado'
),

(
'atenciones.actualizar',
'atenciones',
'Permite registrar avances durante la atención'
),

(
'atenciones.finalizar',
'atenciones',
'Permite finalizar una atención y resolver el ticket'
),

(
'atenciones.ver',
'atenciones',
'Permite consultar atenciones realizadas'
),

(
'atenciones.derivar',
'atenciones',
'Permite derivar una atención hacia otra oficina responsable'
),
-- COMUNICACIONES

('comunicaciones.enviar','comunicaciones','Permite enviar comunicaciones'),

-- NOTIFICACIONES

('notificaciones.generar','notificaciones','Permite generar notificaciones');

-- AUDITORÍA

(
    'auditoria.listar',
    'auditoria',
    'Permite consultar el listado de registros de auditoría'
),

(
    'auditoria.ver',
    'auditoria',
    'Permite consultar el detalle de un registro de auditoría'
);

-- =====================================================
-- PERMISOS ENCUESTAS
-- =====================================================

INSERT INTO permisos
(
    nombre,
    modulo,
    descripcion
)

VALUES

(
    'encuestas.ver',
    'encuestas',
    'Permite visualizar encuestas registradas'
),

(
    'encuestas.estadisticas',
    'encuestas',
    'Permite consultar estadísticas de satisfacción ciudadana'
),

(
    'encuestas.responder',
    'encuestas',
    'Permite al ciudadano responder una encuesta de satisfacción'
);


-- =====================================================
-- PREGUNTAS ENCUESTA BETA
-- =====================================================

INSERT INTO preguntas_encuesta
(
    pregunta,
    tipo_respuesta,
    obligatoria,
    orden
)

VALUES

(
    '¿Qué tan fácil le resultó utilizar la aplicación para registrar y dar seguimiento a su incidencia?',
    'CALIFICACION',
    TRUE,
    1
),

(
    '¿Qué tan útil considera la aplicación para realizar y dar seguimiento a su trámite?',
    'CALIFICACION',
    TRUE,
    2
),

(
    '¿Qué tan satisfecho está con la información que recibió sobre el estado y avance de su incidencia?',
    'CALIFICACION',
    TRUE,
    3
),

(
    '¿Qué tan satisfecho está con la atención y solución brindada a su incidencia?',
    'CALIFICACION',
    TRUE,
    4
),

(
    '¿Qué mejoraría de la aplicación o del proceso de atención de incidencias?',
    'TEXTO',
    FALSE,
    5
);
-- =====================================================
-- PERMISOS PARA ADMIN
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT

    r.id_rol,
    p.id_permiso

FROM roles r

CROSS JOIN permisos p

WHERE

    r.nombre='ADMIN';



-- =====================================================
-- PERMISOS PARA OPERADOR
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT

    r.id_rol,
    p.id_permiso

FROM roles r

INNER JOIN permisos p
ON TRUE

WHERE

    r.nombre='OPERADOR'

AND p.nombre IN
(

'incidencias.listar',
'incidencias.ver',
'incidencias.validar',
'incidencias.rechazar',

'tickets.crear',
'tickets.ver',
'tickets.asignar',
'tickets.derivar',

'documentos.generar',
'documentos.ver'

);
-- =====================================================
-- PERMISOS PARA RESPONSABLE
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT

    r.id_rol,
    p.id_permiso

FROM roles r

INNER JOIN permisos p
ON TRUE

WHERE

    r.nombre = 'RESPONSABLE'

AND p.nombre IN
(

    'tickets.ver',

    'atenciones.iniciar',

    'atenciones.actualizar',

    'atenciones.finalizar',

    'atenciones.ver',

    'atenciones.derivar',

    'comunicaciones.enviar',

    'notificaciones.generar',

    'documentos.ver'

);


-- =====================================================
-- USUARIO ADMINISTRADOR
-- =====================================================

INSERT INTO usuarios
(
    nombre,
    correo,
    password_hash,
    id_oficina,
    estado
)

VALUES
(
'Administrador Sistema',
'admin@sistema.com',
'$2b$10$r3Xx8c2PKEyL6.k.NAa6Duz4bSXQjA.cS6IrSJ3KI/p14gAqxeMpi',
NULL,
TRUE
);



-- =====================================================
-- ASIGNAR ROL AL ADMINISTRADOR
-- =====================================================

INSERT INTO usuario_roles
(
    id_usuario,
    id_rol
)

VALUES
(
1,
1
);
-- =====================================================
-- PRIORIDADES
-- =====================================================

INSERT INTO prioridades
(
    nombre,
    descripcion,
    tiempo_maximo_horas
)

VALUES

(
'Baja',
'Incidencia de baja prioridad',
72
),

(
'Media',
'Incidencia de prioridad media',
48
),

(
'Alta',
'Incidencia urgente',
24
),

(
'Crítica',
'Emergencia',
4

);



-- =====================================================
-- ESTADOS DE INCIDENCIAS
-- =====================================================

INSERT INTO catalogo_estados
(
    tipo_estado,
    nombre,
    descripcion
)
VALUES

(
'INCIDENCIA',
'Pendiente',
'Incidencia registrada por el ciudadano.'
),
(
'INCIDENCIA',
'Observada',
'Incidencia registrada por el operador.'
),

(
'INCIDENCIA',
'Validada',
'Incidencia validada por el operador.'
),

(
'INCIDENCIA',
'Rechazada',
'Incidencia rechazada por el operador.'
);

-- =====================================================
-- MOTIVOS OBSERVACION
-- =====================================================
INSERT INTO motivos_observacion
(nombre, descripcion)
VALUES

(
'Categoría incorrecta',
'La categoría seleccionada no corresponde con el problema reportado.'
),

(
'Fotografía insuficiente',
'Las imágenes no permiten identificar claramente la incidencia.'
),

(
'Ubicación incorrecta',
'La ubicación registrada no coincide con el lugar descrito.'
),

(
'Descripción insuficiente',
'La información proporcionada no permite evaluar la incidencia.'
),

(
'Incidencia duplicada',
'Ya existe una incidencia registrada para el mismo problema.'
);
-- =====================================================
-- ESTADOS DE TICKETS
-- =====================================================

INSERT INTO catalogo_estados
(
    tipo_estado,
    nombre,
    descripcion
)
VALUES
(
'TICKET',
'Pendiente de asignación',
'Ticket creado esperando asignación a una oficina responsable.'
),

(
'TICKET',
'Asignado',
'Ticket asignado a la oficina responsable.'
),

(
'TICKET',
'En Atención',
'La oficina inició la atención.'
),

(
'TICKET',
'Derivado',
'El ticket fue derivado a otra oficina.'
),

(
'TICKET',
'Resuelto',
'La incidencia fue solucionada.'
),

(
'TICKET',
'Cerrado',
'Proceso concluido.'
);
-- =====================================================
-- ESTADOS DE ASIGNACIONES
-- =====================================================

INSERT INTO catalogo_estados
(
    tipo_estado,
    nombre,
    descripcion
)

VALUES

(
'ASIGNACION',
'Pendiente de recepción',
'La asignación fue creada y está pendiente de ser recibida por la oficina responsable.'
),

(
'ASIGNACION',
'Recibida',
'La oficina responsable aceptó la asignación.'
),

(
'ASIGNACION',
'En proceso',
'La oficina responsable está trabajando en la atención de la incidencia.'
),

(
'ASIGNACION',
'Finalizada',
'La oficina culminó las acciones correspondientes a la incidencia.'
),

(
'ASIGNACION',
'Rechazada',
'La oficina rechazó la asignación indicando una observación.'
);

-- =====================================================
-- ESTADOS DE ENCUESTA
-- =====================================================

INSERT INTO catalogo_estados
(
    tipo_estado,
    nombre,
    descripcion
)
VALUES

(
    'ENCUESTA',
    'Pendiente',
    'Encuesta disponible para que el ciudadano evalúe su experiencia con la aplicación y el proceso de atención de su incidencia.'
),

(
    'ENCUESTA',
    'Respondida',
    'Encuesta completada por el ciudadano con las respuestas de satisfacción correspondientes.'
),

(
    'ENCUESTA',
    'Expirada',
    'Encuesta que no fue respondida por el ciudadano dentro del periodo establecido para su participación.'
);

-- =====================================================
-- TIPOS DE DOCUMENTO
-- =====================================================

INSERT INTO tipos_documento
(
    nombre,
    descripcion
)

VALUES

(
'FUT',
'Formato Único de Trámite generado automáticamente'
);


-- ==========================================
-- MOTIVOS DE DERIVACION
-- ==========================================

INSERT INTO motivos_derivacion
(
    nombre,
    descripcion
)

VALUES

(
    'Competencia de otra oficina',
    'La incidencia corresponde a otra dependencia municipal.'
),

(
    'Error de clasificación',
    'La categoría seleccionada inicialmente no corresponde al problema real.'
),

(
    'Requiere evaluación especializada',
    'La incidencia necesita atención de personal especializado.'
);
-- =====================================================
-- TIPOS DE ARCHIVO
-- =====================================================

INSERT INTO tipos_archivo
(
    nombre,
    descripcion
)

VALUES

(
'Imagen',
'Fotografía utilizada como evidencia de una incidencia o durante la atención de una incidencia.'
);



-- =====================================================
-- TIPOS DE NOTIFICACIÓN
-- =====================================================

INSERT INTO tipos_notificacion
(
    nombre,
    descripcion
)

VALUES

(
'Sistema',
'Notificación interna'
),

(
'Correo',
'Notificación enviada por correo electrónico'
);
ON CONFLICT (nombre) DO NOTHING;
-- =====================================================
-- RELACIÓN ROLES - PERMISOS
-- =====================================================


-- =====================================================
-- ADMIN
-- Acceso completo al sistema
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT
    r.id_rol,
    p.id_permiso

FROM roles r,
     permisos p

WHERE r.nombre = 'ADMIN';



-- =====================================================
-- OPERADOR
-- Gestión inicial de incidencias y tickets
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT
    r.id_rol,
    p.id_permiso

FROM roles r,
     permisos p

WHERE r.nombre = 'OPERADOR'

AND p.nombre IN
(
    'incidencias.listar',
    'incidencias.ver',
    'incidencias.validar',
    'incidencias.rechazar',

    'tickets.crear',
    'tickets.ver',
    'tickets.asignar',

    'documentos.generar',
    'documentos.ver',

    'comunicaciones.enviar',
    'notificaciones.generar'
);



-- =====================================================
-- RESPONSABLE
-- Atención operativa de tickets
-- =====================================================

INSERT INTO rol_permisos
(
    id_rol,
    id_permiso
)

SELECT
    r.id_rol,
    p.id_permiso

FROM roles r,
     permisos p

WHERE r.nombre = 'RESPONSABLE'

AND p.nombre IN
(
    'tickets.ver',
    'tickets.derivar',
    'tickets.atender',
    'tickets.resolver',
    'tickets.cerrar',

    'documentos.ver',

    'atenciones.crear',
    'atenciones.editar',

    'comunicaciones.enviar',
    'notificaciones.generar'
);

-- ==========================================
-- CATEGORIAS DE INCIDENCIAS MUNICIPALES
-- ==========================================


INSERT INTO categorias
(
    nombre,
    descripcion,
    id_oficina_predeterminada
)
VALUES


-- ==========================================
-- INFRAESTRUCTURA
-- Sub Gerencia de Mantenimiento de Infraestructura
-- ==========================================

(
'Baches y deterioro de vías',
'Daños en pistas, calles y vías públicas que afectan la circulación.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Mantenimiento de Infraestructura'
)
),

(
'Veredas deterioradas',
'Daños en veredas, rampas y zonas peatonales municipales.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Mantenimiento de Infraestructura'
)
),

(
'Deterioro de espacios públicos',
'Problemas en parques, plazas y áreas recreativas municipales.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Mantenimiento de Infraestructura'
)
),

(
'Daños en infraestructura urbana',
'Daños en mobiliario urbano, escaleras, barandas u otros elementos públicos.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Mantenimiento de Infraestructura'
)
),


-- ==========================================
-- RESIDUOS SOLIDOS
-- Sub Gerencia de Gestión de Residuos Sólidos
-- ==========================================

(
'Acumulación de residuos sólidos',
'Presencia de basura acumulada en calles, parques o espacios públicos.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Residuos Sólidos'
)
),

(
'Punto crítico de residuos',
'Zona donde existe acumulación frecuente de residuos.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Residuos Sólidos'
)
),

(
'Recojo deficiente de residuos',
'Incumplimiento o problemas con el servicio municipal de limpieza pública.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Residuos Sólidos'
)
),

(
'Botadero informal',
'Disposición ilegal de residuos en espacios no autorizados.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Residuos Sólidos'
)
),


-- ==========================================
-- CONTROL URBANO
-- Sub Gerencia de Administración y Control Urbano-Rural
-- ==========================================

(
'Construcción sin autorización',
'Obras realizadas sin licencia o autorización municipal.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Administración y Control Urbano-Rural'
)
),

(
'Ocupación indebida de espacio público',
'Uso no autorizado de calles, veredas o áreas públicas.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Administración y Control Urbano-Rural'
)
),

(
'Invasión de áreas municipales',
'Ocupación irregular de terrenos o espacios municipales.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Administración y Control Urbano-Rural'
)
),

(
'Publicidad no autorizada',
'Paneles, anuncios o elementos publicitarios sin permiso municipal.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Administración y Control Urbano-Rural'
)
),


-- ==========================================
-- CATASTRO
-- Sub Gerencia de Ordenamiento Territorial y Catastro
-- ==========================================

(
'Problemas de numeración urbana',
'Errores o ausencia de numeración predial.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Ordenamiento Territorial y Catastro'
)
),

(
'Problemas de información catastral',
'Actualización o corrección de información territorial.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Ordenamiento Territorial y Catastro'
)
),

(
'Conflicto de ubicación predial',
'Problemas relacionados con ubicación o delimitación de predios.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Ordenamiento Territorial y Catastro'
)
),


-- ==========================================
-- SEGURIDAD CIUDADANA
-- Sub Gerencia de Seguridad Ciudadana y Monitoreo
-- ==========================================

(
'Zona insegura',
'Reporte ciudadano sobre zonas con riesgo para la seguridad.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Seguridad Ciudadana y Monitoreo'
)
),

(
'Alteración del orden público',
'Situaciones que afectan la tranquilidad vecinal.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Seguridad Ciudadana y Monitoreo'
)
),

(
'Consumo de alcohol en vía pública',
'Personas consumiendo alcohol generando molestias o riesgos.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Seguridad Ciudadana y Monitoreo'
)
),

(
'Solicitud de intervención de serenazgo',
'Solicitud de apoyo por emergencia o incidente ciudadano.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Seguridad Ciudadana y Monitoreo'
)
),


-- ==========================================
-- TRANSITO
-- Sub Gerencia de Tránsito
-- ==========================================

(
'Señalización vial deteriorada',
'Daños o ausencia de señalización vial municipal.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Tránsito'
)
),

(
'Problemas de tránsito',
'Situaciones que afectan la circulación vehicular.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Tránsito'
)
),

(
'Estacionamiento indebido',
'Vehículos ocupando zonas restringidas.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Tránsito'
)
),


-- ==========================================
-- AMBIENTE
-- Sub Gerencia de Gestión, Fiscalización y Saneamiento Ambiental
-- ==========================================

(
'Contaminación ambiental',
'Actividades que generan contaminación dentro del distrito.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión, Fiscalización y Saneamiento Ambiental'
)
),

(
'Problemas ambientales urbanos',
'Incidencias relacionadas con afectación ambiental.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión, Fiscalización y Saneamiento Ambiental'
)
),


-- ==========================================
-- ZOONOSIS
-- Sub Gerencia de Gestión de Recursos Naturales y Zoonosis
-- ==========================================

(
'Animal abandonado',
'Reporte de animales domésticos abandonados.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Recursos Naturales y Zoonosis'
)
),

(
'Riesgo por animales peligrosos',
'Presencia de animales que representan riesgo sanitario.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Gestión de Recursos Naturales y Zoonosis'
)
),


-- ==========================================
-- RIESGOS
-- Oficina de Gestión de Riesgos de Desastres
-- ==========================================

(
'Riesgo de deslizamiento',
'Zonas con peligro de deslizamientos o movimientos de tierra.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Oficina de Gestión de Riesgos de Desastres'
)
),

(
'Inundación o acumulación de agua por lluvias',
'Problemas ocasionados por lluvias intensas.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Oficina de Gestión de Riesgos de Desastres'
)
),

(
'Infraestructura en riesgo',
'Elementos o estructuras con peligro de colapso.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Oficina de Gestión de Riesgos de Desastres'
)
),


-- ==========================================
-- COMERCIO
-- Sub Gerencia de Comercio, Policía Municipal y Control
-- ==========================================

(
'Comercio informal',
'Actividad comercial sin autorización municipal.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Comercio, Policía Municipal y Control'
)
),

(
'Ocupación comercial de vía pública',
'Comercio que invade calles o espacios públicos.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Comercio, Policía Municipal y Control'
)
),

(
'Comercio sin condiciones adecuadas',
'Actividad comercial que incumple condiciones municipales.',
(
SELECT id_oficina 
FROM oficinas 
WHERE nombre='Sub Gerencia de Comercio, Policía Municipal y Control'
)
);

-- =====================================================
-- PERMISOS ENCUESTAS
-- =====================================================

INSERT INTO permisos
(
    nombre,
    modulo,
    descripcion
)

VALUES

(
    'encuestas.ver',
    'encuestas',
    'Permite visualizar encuestas registradas'
),

(
    'encuestas.estadisticas',
    'encuestas',
    'Permite consultar estadísticas de satisfacción ciudadana'
);

-- =====================================================
-- TIPO DE DOCUMENTO: SAIU
-- =====================================================

INSERT INTO tipos_documento
(
    nombre,
    descripcion
)
VALUES
(
    'SAIU',
    'Solicitud de Atención de Incidencia Urbana generada por el sistema para su presentación ante Mesa de Partes.'
);

-- =====================================================
-- ESTADOS SAIU
-- =====================================================

INSERT INTO estados_saiu
(
    nombre,
    descripcion
)
VALUES

(
    'PENDIENTE_EXPEDIENTE',
    'SAIU generado pendiente de registrar el número de expediente emitido por Mesa de Partes.'
),

(
    'EXPEDIENTE_REGISTRADO',
    'SAIU con número de expediente registrado, pendiente de vinculación con la oficina responsable.'
),

(
    'VINCULADO',
    'SAIU validado y vinculado con el expediente y la oficina responsable para continuar la atención de la incidencia.'
);

-- ==================================================
-- SECTORES - BETA
-- ==================================================

INSERT INTO sectores
(
    nombre,
    geometria,
    descripcion
)
VALUES

(
    'Sector Beta 1',

    ST_GeomFromText(
        'POLYGON((
            -71.98 -13.54,
            -71.96 -13.54,
            -71.96 -13.52,
            -71.98 -13.52,
            -71.98 -13.54
        ))',
        4326
    ),

    'Sector provisional utilizado para pruebas beta del sistema.'
),

(
    'Sector Beta 2',

    ST_GeomFromText(
        'POLYGON((
            -71.96 -13.54,
            -71.94 -13.54,
            -71.94 -13.52,
            -71.96 -13.52,
            -71.96 -13.54
        ))',
        4326
    ),

    'Sector provisional utilizado para pruebas beta del sistema.'
),

(
    'Sector Beta 3',

    ST_GeomFromText(
        'POLYGON((
            -71.98 -13.52,
            -71.96 -13.52,
            -71.96 -13.50,
            -71.98 -13.50,
            -71.98 -13.52
        ))',
        4326
    ),

    'Sector provisional utilizado para pruebas beta del sistema.'
);