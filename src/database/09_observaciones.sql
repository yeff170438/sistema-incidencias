-- =====================================================
-- TABLA: motivos_observacion
-- Catálogo de motivos por los cuales una incidencia
-- puede ser observada por el operador
-- =====================================================


CREATE TABLE motivos_observacion (

    id_motivo SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE

);



-- =====================================================
-- TABLA: observaciones_incidencia
-- Registra las observaciones realizadas por operadores
-- =====================================================


CREATE TABLE observaciones_incidencia (

    id_observacion SERIAL PRIMARY KEY,


    id_incidencia INTEGER NOT NULL,


    id_usuario INTEGER NOT NULL,


    id_motivo INTEGER NOT NULL,


    comentario TEXT,


    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_observacion_incidencia

        FOREIGN KEY (id_incidencia)

        REFERENCES incidencias(id_incidencia)

        ON DELETE CASCADE,



    CONSTRAINT fk_observacion_usuario

        FOREIGN KEY (id_usuario)

        REFERENCES usuarios(id_usuario),



    CONSTRAINT fk_observacion_motivo

        FOREIGN KEY (id_motivo)

        REFERENCES motivos_observacion(id_motivo)

);



-- =====================================================
-- TABLA: seguimiento_incidencia
-- Historial completo del ciclo de vida de la incidencia
-- antes de convertirse en ticket
-- =====================================================


CREATE TABLE seguimiento_incidencia (

    id_seguimiento SERIAL PRIMARY KEY,


    id_incidencia INTEGER NOT NULL,


    id_usuario INTEGER,


    id_ciudadano INTEGER,


    id_estado_anterior INTEGER,


    id_estado_nuevo INTEGER,


    origen VARCHAR(50) NOT NULL,


    accion VARCHAR(100) NOT NULL,


    comentario TEXT,


    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,



    CONSTRAINT fk_seguimiento_incidencia

        FOREIGN KEY(id_incidencia)

        REFERENCES incidencias(id_incidencia)

        ON DELETE CASCADE,



    CONSTRAINT fk_seguimiento_usuario

        FOREIGN KEY(id_usuario)

        REFERENCES usuarios(id_usuario),



    CONSTRAINT fk_seguimiento_ciudadano

        FOREIGN KEY(id_ciudadano)

        REFERENCES ciudadanos(id_ciudadano),



    CONSTRAINT fk_estado_anterior_incidencia

        FOREIGN KEY(id_estado_anterior)

        REFERENCES catalogo_estados(id_estado),



    CONSTRAINT fk_estado_nuevo_incidencia

        FOREIGN KEY(id_estado_nuevo)

        REFERENCES catalogo_estados(id_estado)

);



-- =====================================================
-- ÍNDICES
-- =====================================================


CREATE INDEX idx_observaciones_incidencia

ON observaciones_incidencia(id_incidencia);



CREATE INDEX idx_seguimiento_incidencia

ON seguimiento_incidencia(id_incidencia);