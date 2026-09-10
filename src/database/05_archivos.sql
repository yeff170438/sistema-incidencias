-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 05_archivos.sql
-- Descripción:
-- Gestión documental y almacenamiento de archivos.
--
-- Contiene:
-- - Archivos
-- - Documentos
-- - Archivo_Incidencia
-- - Archivo_Atencion
-- - Archivo_Documento
-- =====================================================



-- =====================================================
-- TABLA: ARCHIVOS
-- =====================================================

CREATE TABLE archivos (

    id_archivo SERIAL PRIMARY KEY,

    id_tipo_archivo INT NOT NULL,

    nombre_original VARCHAR(255) NOT NULL,

    nombre_servidor VARCHAR(255) NOT NULL,

    ruta TEXT NOT NULL,

    extension VARCHAR(20),

    mime_type VARCHAR(100),

    tamanio BIGINT,

    hash VARCHAR(255),

    fecha_subida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_archivo_tipo
        FOREIGN KEY (id_tipo_archivo)
        REFERENCES tipos_archivo(id_tipo_archivo)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- TABLA: DOCUMENTOS
-- =====================================================

CREATE TABLE documentos (

    id_documento SERIAL PRIMARY KEY,

    id_ticket INT NOT NULL,

    id_tipo_documento INT NOT NULL,

    id_usuario INT NOT NULL,

    id_oficina INT NOT NULL,

    numero_documento VARCHAR(60) UNIQUE,

    asunto VARCHAR(255) NOT NULL,

    descripcion TEXT,

    fecha_documento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documento_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets(id_ticket)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_documento_tipo
        FOREIGN KEY (id_tipo_documento)
        REFERENCES tipos_documento(id_tipo_documento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_documento_oficina
        FOREIGN KEY (id_oficina)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- TABLA: ARCHIVO_INCIDENCIA
-- =====================================================

CREATE TABLE archivo_incidencia (

    id_archivo_incidencia SERIAL PRIMARY KEY,

    id_incidencia INT NOT NULL,

    id_archivo INT NOT NULL,

    CONSTRAINT fk_ai_incidencia
        FOREIGN KEY (id_incidencia)
        REFERENCES incidencias(id_incidencia)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ai_archivo
        FOREIGN KEY (id_archivo)
        REFERENCES archivos(id_archivo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_archivo_incidencia
        UNIQUE (id_incidencia, id_archivo)

);



-- =====================================================
-- TABLA: ARCHIVO_ATENCION
-- =====================================================

CREATE TABLE archivo_atencion (

    id_archivo_atencion SERIAL PRIMARY KEY,

    id_atencion INT NOT NULL,

    id_archivo INT NOT NULL,

    CONSTRAINT fk_aa_atencion
        FOREIGN KEY (id_atencion)
        REFERENCES atenciones(id_atencion)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_aa_archivo
        FOREIGN KEY (id_archivo)
        REFERENCES archivos(id_archivo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_archivo_atencion
        UNIQUE (id_atencion, id_archivo)

);



-- =====================================================
-- TABLA: ARCHIVO_DOCUMENTO
-- =====================================================

CREATE TABLE archivo_documento (

    id_archivo_documento SERIAL PRIMARY KEY,

    id_documento INT NOT NULL,

    id_archivo INT NOT NULL,

    CONSTRAINT fk_ad_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos(id_documento)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_ad_archivo
        FOREIGN KEY (id_archivo)
        REFERENCES archivos(id_archivo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_archivo_documento
        UNIQUE (id_documento, id_archivo)

);



-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_documentos_ticket
ON documentos(id_ticket);

CREATE INDEX idx_documentos_usuario
ON documentos(id_usuario);

CREATE INDEX idx_documentos_oficina
ON documentos(id_oficina);

CREATE INDEX idx_archivos_tipo
ON archivos(id_tipo_archivo);

CREATE INDEX idx_archivo_incidencia
ON archivo_incidencia(id_incidencia);

CREATE INDEX idx_archivo_atencion
ON archivo_atencion(id_atencion);

CREATE INDEX idx_archivo_documento
ON archivo_documento(id_documento);