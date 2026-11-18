-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 03_catalogos.sql
-- Descripción:
-- Catálogos maestros y referencias territoriales
-- del sistema.
--
-- Contiene:
-- - Distrito de referencia
-- - Sectores
-- - Categorías
-- - Prioridades
-- - Catálogo de Estados
-- - Tipos de Documento
-- - Tipos de Notificación
-- - Tipos de Archivo
-- - Estados SAIU
-- =====================================================


-- =====================================================
-- TABLA: DISTRITO_REFERENCIA
-- Caso de estudio: Distrito de Santiago - Cusco
-- UBIGEO: 080106
-- =====================================================

CREATE TABLE distrito_referencia (

    id_distrito SMALLSERIAL PRIMARY KEY,

    ubigeo VARCHAR(6) NOT NULL UNIQUE,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    geometria geometry(MultiPolygon,4326) NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE

);


-- =====================================================
-- ÍNDICE ESPACIAL: DISTRITO
-- =====================================================

CREATE INDEX idx_distrito_referencia_geometria
ON distrito_referencia
USING GIST (geometria);



-- =====================================================
-- TABLA: SECTORES
-- =====================================================

CREATE TABLE sectores (

    id_sector SERIAL PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    geometria geometry(Polygon,4326) NOT NULL,

    descripcion TEXT

);



-- =====================================================
-- TABLA: CATEGORIAS
-- =====================================================

CREATE TABLE categorias (

    id_categoria SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    id_oficina_predeterminada INT NOT NULL,

    CONSTRAINT fk_categoria_oficina
        FOREIGN KEY (id_oficina_predeterminada)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE RESTRICT

);



-- =====================================================
-- TABLA: PRIORIDADES
-- Clasificación para preferencia de atención
-- =====================================================

CREATE TABLE prioridades (
    id_prioridad SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    orden_atencion INT NOT NULL UNIQUE,
    CONSTRAINT chk_prioridades_orden
        CHECK (orden_atencion BETWEEN 1 AND 4)
);

-- =====================================================
-- RELACIÓN CATEGORÍA - PRIORIDAD PREDETERMINADA
-- =====================================================

ALTER TABLE categorias
ADD COLUMN id_prioridad_predeterminada INTEGER;

ALTER TABLE categorias
ADD CONSTRAINT fk_categoria_prioridad
FOREIGN KEY (id_prioridad_predeterminada)
REFERENCES prioridades(id_prioridad)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- =====================================================
-- TABLA: CATALOGO_ESTADOS
-- =====================================================

CREATE TABLE catalogo_estados (

    id_estado SERIAL PRIMARY KEY,

    tipo_estado VARCHAR(50) NOT NULL,

    nombre VARCHAR(50) NOT NULL,

    descripcion TEXT

);



-- =====================================================
-- TABLA: TIPOS_DOCUMENTO
-- =====================================================

CREATE TABLE tipos_documento (

    id_tipo_documento SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion TEXT

);



-- =====================================================
-- TABLA: TIPOS_NOTIFICACION
-- =====================================================

CREATE TABLE tipos_notificacion (

    id_tipo_notificacion SERIAL PRIMARY KEY,

    nombre VARCHAR(80) NOT NULL UNIQUE,

    descripcion TEXT

);



-- =====================================================
-- TABLA: TIPOS_ARCHIVO
-- =====================================================

CREATE TABLE tipos_archivo (

    id_tipo_archivo SERIAL PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion TEXT

);



-- =====================================================
-- ÍNDICES ESPACIALES
-- =====================================================

CREATE INDEX idx_sectores_geometria
ON sectores
USING GIST (geometria);



-- =====================================================
-- TABLA: ESTADOS_SAIU
-- Catálogo de estados propios del SAIU
-- =====================================================

CREATE TABLE estados_saiu (

    id_estado_saiu SERIAL PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL,

    descripcion TEXT NOT NULL,

    CONSTRAINT uq_estado_saiu_nombre
        UNIQUE (nombre)

);



-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_estados_saiu_nombre
ON estados_saiu(nombre);