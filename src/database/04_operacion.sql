-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 04_operacion.sql
-- Descripción:
-- Núcleo operativo del sistema.
--
-- Contiene:
-- - Incidencias
-- - Tickets
-- - Asignaciones
-- - Derivaciones
-- - Atenciones
-- =====================================================



-- =====================================================
-- TABLA: INCIDENCIAS
-- =====================================================

CREATE TABLE incidencias (

    id_incidencia SERIAL PRIMARY KEY,

    codigo_incidencia VARCHAR(30) NOT NULL UNIQUE,

    id_ciudadano INT NOT NULL,

    id_categoria INT NOT NULL,

    id_sector INT,

    id_estado INT NOT NULL,

    titulo VARCHAR(200) NOT NULL,

    descripcion TEXT NOT NULL,

    direccion_texto TEXT NOT NULL,

    referencia TEXT,

    ubicacion geometry(Point,4326) NOT NULL,

    fecha_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_incidencia_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_incidencia_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_incidencia_sector
        FOREIGN KEY (id_sector)
        REFERENCES sectores(id_sector)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_incidencia_estado
        FOREIGN KEY (id_estado)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- TABLA: TICKETS
-- =====================================================

CREATE TABLE tickets (

    id_ticket SERIAL PRIMARY KEY,

    codigo_ticket VARCHAR(30) NOT NULL UNIQUE,

    id_incidencia INT NOT NULL UNIQUE,

    id_estado INT NOT NULL,

    id_prioridad INT NOT NULL,

    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_limite TIMESTAMP NOT NULL,

    fecha_resolucion TIMESTAMP,

    fecha_cierre TIMESTAMP,

    observacion_cierre TEXT,

    CONSTRAINT fk_ticket_incidencia
        FOREIGN KEY (id_incidencia)
        REFERENCES incidencias(id_incidencia)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ticket_estado
        FOREIGN KEY (id_estado)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_ticket_prioridad
        FOREIGN KEY (id_prioridad)
        REFERENCES prioridades(id_prioridad)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);

-- =====================================================
-- MODALIDAD DE ATENCIÓN DEL TICKET
-- =====================================================

ALTER TABLE tickets
ADD COLUMN modalidad_atencion VARCHAR(30);

ALTER TABLE tickets
ADD CONSTRAINT chk_ticket_modalidad_atencion
CHECK (
    modalidad_atencion IN (
        'ATENCION_DIRECTA',
        'SOLICITUD_ADMINISTRATIVA'
    )
);

-- =====================================================
-- TABLA: ASIGNACIONES
-- =====================================================

CREATE TABLE asignaciones (

    id_asignacion SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL,

    id_oficina INT NOT NULL,

    id_usuario INT,

    usuario_receptor INT,

    id_estado INT NOT NULL,

    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_recepcion TIMESTAMP,

    fecha_fin TIMESTAMP,

    observacion TEXT,

    CONSTRAINT fk_asignacion_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_asignacion_oficina
        FOREIGN KEY (id_oficina)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_asignacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_asignacion_receptor
        FOREIGN KEY (usuario_receptor)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_asignacion_estado
        FOREIGN KEY (id_estado)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- TABLA: DERIVACIONES
-- =====================================================

CREATE TABLE derivaciones (

    id_derivacion SERIAL PRIMARY KEY,


    id_ticket INT NOT NULL,


    oficina_origen INT NOT NULL,


    oficina_destino INT NOT NULL,


    id_usuario INT NOT NULL,


    id_motivo INT NOT NULL,


    comentario TEXT,


    fecha_derivacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_derivacion_ticket

        FOREIGN KEY (id_ticket)

        REFERENCES tickets(id_ticket)

        ON UPDATE CASCADE

        ON DELETE CASCADE,



    CONSTRAINT fk_derivacion_origen

        FOREIGN KEY (oficina_origen)

        REFERENCES oficinas(id_oficina)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,



    CONSTRAINT fk_derivacion_destino

        FOREIGN KEY (oficina_destino)

        REFERENCES oficinas(id_oficina)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,



    CONSTRAINT fk_derivacion_usuario

        FOREIGN KEY (id_usuario)

        REFERENCES usuarios(id_usuario)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,



    CONSTRAINT fk_derivacion_motivo

        FOREIGN KEY (id_motivo)

        REFERENCES motivos_derivacion(id_motivo)

        ON UPDATE CASCADE

        ON DELETE RESTRICT

);

-- ==========================================
-- TABLA: motivos_derivacion
-- Catálogo de motivos para transferir tickets
-- ==========================================

CREATE TABLE motivos_derivacion (

    id_motivo SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE

);

-- =====================================================
-- TABLA: ATENCIONES
-- =====================================================

CREATE TABLE atenciones (

    id_atencion SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL,

    id_asignacion INT NOT NULL,

    id_oficina INT NOT NULL,

    id_usuario INT NOT NULL,

    descripcion_atencion TEXT NOT NULL,

    resultado TEXT,

    conclusion TEXT,

    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_inicio TIMESTAMP NOT NULL,

    fecha_fin TIMESTAMP,

    fecha_actualizacion TIMESTAMP,

    CONSTRAINT fk_atencion_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_atencion_asignacion
        FOREIGN KEY (id_asignacion)
        REFERENCES asignaciones(id_asignacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_oficina
        FOREIGN KEY (id_oficina)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_atencion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_incidencias_ciudadano
ON incidencias(id_ciudadano);

CREATE INDEX idx_incidencias_categoria
ON incidencias(id_categoria);

CREATE INDEX idx_incidencias_sector
ON incidencias(id_sector);

CREATE INDEX idx_tickets_estado
ON tickets(id_estado);

CREATE INDEX idx_tickets_prioridad
ON tickets(id_prioridad);

CREATE INDEX idx_asignaciones_ticket
ON asignaciones(id_ticket);

CREATE INDEX idx_derivaciones_ticket
ON derivaciones(id_ticket);

CREATE INDEX idx_atenciones_ticket
ON atenciones(id_ticket);

CREATE INDEX idx_incidencias_ubicacion
ON incidencias
USING GIST (ubicacion);


-- =====================================================
-- TABLA: SOLICITUDES DE ATENCIÓN DE INCIDENCIA URBANA
-- =====================================================

CREATE TABLE solicitudes_incidencia (

    id_saiu SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL UNIQUE,

    codigo_saiu VARCHAR(30) NOT NULL UNIQUE,

    id_usuario INT NOT NULL,

    id_oficina INT,

    fecha_generacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    numero_expediente VARCHAR(60) UNIQUE,

    fecha_expediente TIMESTAMP,

    estado VARCHAR(30) NOT NULL
        DEFAULT 'PENDIENTE_EXPEDIENTE',

    fecha_vinculacion TIMESTAMP,

    observacion TEXT,

    CONSTRAINT fk_saiu_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_saiu_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_saiu_oficina
        FOREIGN KEY (id_oficina)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_saiu_estado
        CHECK (
            estado IN (
                'PENDIENTE_EXPEDIENTE',
                'EXPEDIENTE_REGISTRADO',
                'VINCULADO',
                'EN_ATENCION',
                'RESUELTO',
                'CERRADO'
            )
        )

);

-- =====================================================
-- TABLA: SOLICITUDES DE ATENCIÓN DE INCIDENCIA URBANA
-- SAIU
-- =====================================================

CREATE TABLE solicitudes_incidencia (

    id_saiu SERIAL PRIMARY KEY,

    -- =====================================
    -- TICKET ASOCIADO
    -- Un ticket solamente puede tener un SAIU
    -- =====================================

    id_ticket INT NOT NULL UNIQUE,


    -- =====================================
    -- CÓDIGO SAIU
    -- Generado por el sistema
    -- =====================================

    codigo_saiu VARCHAR(30) NOT NULL UNIQUE,


    -- =====================================
    -- USUARIO QUE GENERA EL SAIU
    -- =====================================

    id_usuario INT NOT NULL,


    -- =====================================
    -- OFICINA COMPETENTE
    -- Puede definirse posteriormente
    -- =====================================

    id_oficina INT,


    -- =====================================
    -- FECHA DE GENERACIÓN
    -- =====================================

    fecha_generacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,


    -- =====================================
    -- EXPEDIENTE DE MESA DE PARTES
    -- Se registra posteriormente
    -- =====================================

    numero_expediente VARCHAR(60) UNIQUE,

    fecha_expediente TIMESTAMP,


    -- =====================================
    -- ESTADO PROPIO DEL SAIU
    -- =====================================

    id_estado_saiu INT NOT NULL,


    -- =====================================
    -- FECHA DE VINCULACIÓN
    -- =====================================

    fecha_vinculacion TIMESTAMP,


    -- =====================================
    -- OBSERVACIONES
    -- =====================================

    observacion TEXT,


    -- =====================================
    -- RELACIONES
    -- =====================================

    CONSTRAINT fk_saiu_ticket

        FOREIGN KEY (id_ticket)

        REFERENCES tickets(id_ticket)

        ON UPDATE CASCADE

        ON DELETE CASCADE,


    CONSTRAINT fk_saiu_usuario

        FOREIGN KEY (id_usuario)

        REFERENCES usuarios(id_usuario)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,


    CONSTRAINT fk_saiu_oficina

        FOREIGN KEY (id_oficina)

        REFERENCES oficinas(id_oficina)

        ON UPDATE CASCADE

        ON DELETE RESTRICT,


    CONSTRAINT fk_saiu_estado

        FOREIGN KEY (id_estado_saiu)

        REFERENCES estados_saiu(id_estado_saiu)

        ON UPDATE CASCADE

        ON DELETE RESTRICT

);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_saiu_usuario
ON solicitudes_incidencia(id_usuario);

CREATE INDEX idx_saiu_oficina
ON solicitudes_incidencia(id_oficina);

CREATE INDEX idx_saiu_estado
ON solicitudes_incidencia(id_estado_saiu);

CREATE INDEX idx_saiu_fecha_generacion
ON solicitudes_incidencia(fecha_generacion);