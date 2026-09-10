-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 07_auditoria.sql
-- Descripción:
-- Auditoría del sistema.
--
-- Contiene:
-- - Auditoría
-- =====================================================



-- =====================================================
-- TABLA: AUDITORIA
-- =====================================================

CREATE TABLE auditoria (

    id_auditoria SERIAL PRIMARY KEY,

    id_usuario INT,

    id_ciudadano INT,

    accion VARCHAR(100) NOT NULL,

    tabla_afectada VARCHAR(100) NOT NULL,

    registro_afectado INT NOT NULL,

    valores_modificados JSONB,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_auditoria_ciudadano
        FOREIGN KEY (id_ciudadano)
        REFERENCES ciudadanos(id_ciudadano)
        ON UPDATE CASCADE
        ON DELETE SET NULL

);



-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_auditoria_usuario
ON auditoria(id_usuario);

CREATE INDEX idx_auditoria_ciudadano
ON auditoria(id_ciudadano);

CREATE INDEX idx_auditoria_tabla
ON auditoria(tabla_afectada);

CREATE INDEX idx_auditoria_fecha
ON auditoria(fecha);

CREATE INDEX idx_auditoria_accion
ON auditoria(accion);