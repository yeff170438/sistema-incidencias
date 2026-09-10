-- =====================================================
-- SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5
-- Archivo: 02_schema_base.sql
-- Descripción:
-- Esquema base del sistema.
--
-- Contiene:
-- - Oficinas
-- - Usuarios
-- - Ciudadanos
-- - Rolses
-- - Usuario_Role
-- - Permisos
-- - Rol_Permisos
-- =====================================================



-- =====================================================
-- TABLA: OFICINAS
-- =====================================================

CREATE TABLE oficinas (

    id_oficina SERIAL PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    descripcion TEXT,

    estado BOOLEAN NOT NULL DEFAULT TRUE

);



-- =====================================================
-- TABLA: USUARIOS
-- =====================================================

CREATE TABLE usuarios (

    id_usuario SERIAL PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    correo VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    id_oficina INT,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    ultimo_acceso TIMESTAMP,

    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_oficina
        FOREIGN KEY (id_oficina)
        REFERENCES oficinas(id_oficina)
        ON UPDATE CASCADE
        ON DELETE SET NULL

);



-- =====================================================
-- TABLA: CIUDADANOS
-- =====================================================

CREATE TABLE ciudadanos (

    id_ciudadano SERIAL PRIMARY KEY,

    dni VARCHAR(8) NOT NULL UNIQUE,

    nombres VARCHAR(100) NOT NULL,

    apellido_paterno VARCHAR(100) NOT NULL,

    apellido_materno VARCHAR(100) NOT NULL,

    telefono VARCHAR(20),

    correo VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    direccion TEXT,

    correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,

    ultimo_acceso TIMESTAMP,

    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

);



-- =====================================================
-- TABLA: ROLES
-- =====================================================

CREATE TABLE roles (

    id_rol SERIAL PRIMARY KEY,

    nombre VARCHAR(60) NOT NULL UNIQUE,

    descripcion TEXT

);



-- =====================================================
-- TABLA: PERMISOS
-- =====================================================

CREATE TABLE permisos (

    id_permiso SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    modulo VARCHAR(100) NOT NULL,

    descripcion TEXT

);



-- =====================================================
-- TABLA: USUARIO_ROLES
-- =====================================================

CREATE TABLE usuario_roles (

    id_usuario_rol SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_rol INT NOT NULL,

    CONSTRAINT fk_usuario_roles_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_roles_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);



-- =====================================================
-- TABLA: ROL_PERMISOS
-- =====================================================

CREATE TABLE rol_permisos (

    id_rol_permiso SERIAL PRIMARY KEY,

    id_rol INT NOT NULL,

    id_permiso INT NOT NULL,

    CONSTRAINT fk_rol_permiso_rol
        FOREIGN KEY (id_rol)
        REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_rol_permiso_permiso
        FOREIGN KEY (id_permiso)
        REFERENCES permisos(id_permiso)
        ON UPDATE CASCADE
        ON DELETE CASCADE

);