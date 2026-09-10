-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 06_comunicacion.sql
-- Descripción:
-- Seguimiento y comunicación del sistema.
--
-- Contiene:
-- - Seguimiento de Tickets
-- - Comunicaciones
-- - Notificaciones
-- - Encuestas
-- =====================================================



-- =====================================================
-- TABLA: SEGUIMIENTO_TICKET
-- =====================================================

CREATE TABLE seguimiento_ticket (

    id_seguimiento SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL,

    id_usuario INT,

    id_ciudadano INT,


    -- =====================================
    -- Control de origen y acción
    -- =====================================

    origen VARCHAR(20) NOT NULL,

    accion VARCHAR(100) NOT NULL,


    -- =====================================
    -- Estados del flujo
    -- =====================================

    id_estado_anterior INT NOT NULL,

    id_estado_nuevo INT NOT NULL,


    comentario TEXT,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,


    -- =====================================
    -- Relaciones
    -- =====================================

    CONSTRAINT fk_seguimiento_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,


    CONSTRAINT fk_seguimiento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,


    CONSTRAINT fk_seguimiento_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE SET NULL,


    CONSTRAINT fk_seguimiento_estado_anterior
        FOREIGN KEY (id_estado_anterior)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    CONSTRAINT fk_seguimiento_estado_nuevo
        FOREIGN KEY (id_estado_nuevo)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,


    -- =====================================
    -- Validaciones
    -- =====================================

    CONSTRAINT chk_origen_seguimiento
        CHECK
        (
            origen IN
            (
                'CIUDADANO',
                'USUARIO',
                'SISTEMA'
            )
        )

);



-- =====================================================
-- TABLA: COMUNICACIONES_TICKET
-- =====================================================

CREATE TABLE comunicaciones_ticket (

    id_comunicacion SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL,

    tipo_emisor VARCHAR(30) NOT NULL,

    id_usuario INT,

    id_ciudadano INT,

    mensaje TEXT NOT NULL,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comunicacion_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_comunicacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_comunicacion_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE SET NULL

);



-- =====================================================
-- TABLA: NOTIFICACIONES
-- =====================================================

CREATE TABLE notificaciones (

    id_notificacion SERIAL PRIMARY KEY,

    id_ticket INT NULL,

    id_tipo_notificacion INT NOT NULL,

    id_usuario INT,

    id_incidencia INTEGER,

    id_ciudadano INT,

    mensaje TEXT NOT NULL,

    leido BOOLEAN NOT NULL DEFAULT FALSE,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacion_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_notificacion_tipo
        FOREIGN KEY (id_tipo_notificacion)
        REFERENCES tipos_notificacion(id_tipo_notificacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_notificacion_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_notificacion_incidencia
        FOREIGN KEY (id_incidencia)
        REFERENCES incidencias(id_incidencia)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_notificacion_referencia
        CHECK (
            id_incidencia IS NOT NULL
            OR id_ticket IS NOT NULL
        )

);


-- =====================================================
-- TABLA: ENCUESTAS
-- =====================================================

CREATE TABLE encuestas (

    id_encuesta SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL UNIQUE,

    id_ciudadano INT NOT NULL,

    id_estado INT NOT NULL,

    fecha_creacion TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    fecha_respuesta TIMESTAMP,

    CONSTRAINT fk_encuesta_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_encuesta_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_encuesta_estado
        FOREIGN KEY (id_estado)
        REFERENCES catalogo_estados(id_estado)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);


-- =====================================================
-- TABLA: PREGUNTAS_ENCUESTA
-- =====================================================

CREATE TABLE preguntas_encuesta (

    id_pregunta SERIAL PRIMARY KEY,

    pregunta TEXT NOT NULL,

    tipo_respuesta VARCHAR(30) NOT NULL,

    obligatoria BOOLEAN NOT NULL DEFAULT TRUE,

    orden INT NOT NULL,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_tipo_respuesta
        CHECK (
            tipo_respuesta IN (
                'CALIFICACION',
                'TEXTO'
            )
        ),

    CONSTRAINT uq_pregunta_orden
        UNIQUE (orden)

);


-- =====================================================
-- TABLA: RESPUESTAS_ENCUESTA
-- =====================================================

CREATE TABLE respuestas_encuesta (

    id_respuesta SERIAL PRIMARY KEY,

    id_encuesta INT NOT NULL,

    id_pregunta INT NOT NULL,

    respuesta_valor INT,

    respuesta_texto TEXT,

    fecha_respuesta TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_respuesta_encuesta
        FOREIGN KEY (id_encuesta)
        REFERENCES encuestas(id_encuesta)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_respuesta_pregunta
        FOREIGN KEY (id_pregunta)
        REFERENCES preguntas_encuesta(id_pregunta)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT uq_respuesta_encuesta_pregunta
        UNIQUE (
            id_encuesta,
            id_pregunta
        ),

    CONSTRAINT chk_respuesta_valor
        CHECK (
            respuesta_valor IS NULL
            OR respuesta_valor BETWEEN 1 AND 5
        ),

    CONSTRAINT chk_respuesta_contenido
        CHECK (
            respuesta_valor IS NOT NULL
            OR respuesta_texto IS NOT NULL
        )

);


-- =====================================================
-- ÍNDICES DE SEGUIMIENTO
-- =====================================================

CREATE INDEX idx_seguimiento_ticket
ON seguimiento_ticket(id_ticket);

CREATE INDEX idx_seguimiento_usuario
ON seguimiento_ticket(id_usuario);


-- =====================================================
-- ÍNDICES DE COMUNICACIONES
-- =====================================================

CREATE INDEX idx_comunicaciones_ticket
ON comunicaciones_ticket(id_ticket);


-- =====================================================
-- ÍNDICES DE NOTIFICACIONES
-- =====================================================

CREATE INDEX idx_notificaciones_ticket
ON notificaciones(id_ticket);

CREATE INDEX idx_notificaciones_usuario
ON notificaciones(id_usuario);

CREATE INDEX idx_notificaciones_ciudadano
ON notificaciones(id_ciudadano);


-- =====================================================
-- ÍNDICES DE ENCUESTAS
-- =====================================================

CREATE INDEX idx_encuestas_ciudadano
ON encuestas(id_ciudadano);

CREATE INDEX idx_encuestas_estado
ON encuestas(id_estado);


-- =====================================================
-- ÍNDICES DE RESPUESTAS
-- =====================================================

CREATE INDEX idx_respuestas_encuesta
ON respuestas_encuesta(id_encuesta);

CREATE INDEX idx_respuestas_pregunta
ON respuestas_encuesta(id_pregunta);

