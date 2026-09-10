-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 03_catalogos.sql
-- Descripción:
-- Catálogos maestros del sistema.
--
-- Contiene:
-- - Sectores
-- - Categorías
-- - Prioridades
-- - Catálogo de Estados
-- - Tipos de Documento
-- - Tipos de Notificación
-- - Tipos de Archivo
-- -CAtegoria oficina
-- =====================================================



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
-- =====================================================

CREATE TABLE prioridades (

    id_prioridad SERIAL PRIMARY KEY,

    nombre VARCHAR(50) NOT NULL UNIQUE,

    descripcion TEXT,

    tiempo_maximo_horas INT NOT NULL

);



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