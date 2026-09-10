-- =====================================================
-- DATOS DE PRUEBA DEL SISTEMA
-- =====================================================


-- =====================================================
-- CIUDADANO DE PRUEBA
-- =====================================================

INSERT INTO ciudadanos
(
    dni, 
    nombres,
    apellido_paterno,
    apellido_materno,
    correo,
    telefono,
    password_hash
)

VALUES

(
    '70000001',
    'Juan',
    'Perez',
    'Quispe',
    'juan.test@gmail.com',
    '999111222',
    '$2b$10$r3Xx8c2PKEyL6.k.NAa6Duz4bSXQjA.cS6IrSJ3KI/p14gAqxeMpi'
);





-- =====================================================
-- USUARIO OPERADOR MUNICIPAL
-- =====================================================

INSERT INTO usuarios
(
    nombre,
    correo,
    password_hash,
    estado
)

VALUES

(
    'Operador Municipal',
    'operador@test.com',
    '$2b$10$r3Xx8c2PKEyL6.k.NAa6Duz4bSXQjA.cS6IrSJ3KI/p14gAqxeMpi',
    TRUE
);





-- =====================================================
-- USUARIO RESPONSABLE DE OFICINA
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
    'Responsable Infraestructura',
    'responsable@test.com',

    '$2b$10$r3Xx8c2PKEyL6.k.NAa6Duz4bSXQjA.cS6IrSJ3KI/p14gAqxeMpi',

    (
        SELECT id_oficina
        FROM oficinas
        WHERE nombre =
        'Sub Gerencia de Mantenimiento de Infraestructura'
    ),

    TRUE
);





-- =====================================================
-- ASIGNAR ROLES
-- =====================================================


-- OPERADOR

INSERT INTO usuario_roles
(
    id_usuario,
    id_rol
)

SELECT

    u.id_usuario,

    r.id_rol

FROM usuarios u,
roles r

WHERE

u.correo='operador@test.com'

AND

r.nombre='OPERADOR';





-- ENCARGADO DE OFICINA

INSERT INTO usuario_roles
(
    id_usuario,
    id_rol
)

SELECT

    u.id_usuario,

    r.id_rol

FROM usuarios u,
roles r

WHERE

u.correo='responsable@test.com'

AND

r.nombre='RESPONSABLE';





-- =====================================================
-- INCIDENCIA DE PRUEBA
-- =====================================================


INSERT INTO incidencias
(
    codigo_incidencia,

    id_ciudadano,

    id_categoria,

    id_sector,

    id_estado,

    titulo,

    descripcion,

    direccion_texto,

    referencia,

    ubicacion

)

VALUES

(

    'INC-TEST-001',


    (
        SELECT id_ciudadano
        FROM ciudadanos
        WHERE dni='70000001'
    ),



    (
        SELECT id_categoria
        FROM categorias
        WHERE nombre='Baches y deterioro de vías'
    ),



    NULL,



    (
        SELECT id_estado
        FROM catalogo_estados
        WHERE tipo_estado='INCIDENCIA'
        AND nombre='Pendiente'
    ),



    'Bache en vía principal',



    'Existe un bache de gran tamaño que dificulta la circulación vehicular y representa riesgo para los ciudadanos.',



    'Av. Principal del distrito de Santiago',



    'Cerca al parque principal',



    ST_SetSRID(

        ST_MakePoint(

            -71.9675,

            -13.5319

        ),

        4326

    )

);