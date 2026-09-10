const pool = require('../../database/database');


// =====================================
// Buscar usuario por correo
// =====================================

const findByEmail = async (correo) => {

    const query = `
        SELECT
            id_usuario,
            nombre,
            correo,
            password_hash,
            estado
        FROM usuarios
        WHERE correo = $1;
    `;

    const result = await pool.query(
        query,
        [correo]
    );

    return result.rows[0];

};




// =====================================
// Buscar correo excepto un usuario
// =====================================

const findByEmailExceptId = async (
    correo,
    id_usuario
) => {

    const query = `
        SELECT
            id_usuario
        FROM usuarios
        WHERE correo = $1
        AND id_usuario <> $2;
    `;

    const result = await pool.query(
        query,
        [
            correo,
            id_usuario
        ]
    );

    return result.rows[0];

};




// =====================================
// Buscar rol
// =====================================

const findRoleById = async (
    id_rol
) => {

    const query = `
        SELECT
            id_rol,
            nombre
        FROM roles
        WHERE id_rol = $1;
    `;

    const result = await pool.query(
        query,
        [id_rol]
    );

    return result.rows[0];

};




// =====================================
// Buscar oficina
// =====================================

const findOfficeById = async (
    id_oficina
) => {

    const query = `
        SELECT
            id_oficina,
            nombre
        FROM oficinas
        WHERE id_oficina = $1;
    `;

    const result = await pool.query(
        query,
        [id_oficina]
    );

    return result.rows[0];

};




// =====================================
// Buscar permisos del rol
// =====================================

const findPermissionsByRole = async (
    id_rol
) => {

    const query = `
        SELECT

            p.nombre

        FROM rol_permisos rp

        INNER JOIN permisos p
            ON rp.id_permiso = p.id_permiso

        WHERE rp.id_rol = $1

        ORDER BY p.nombre;
    `;

    const result = await pool.query(
        query,
        [id_rol]
    );

    return result.rows;

};




// =====================================
// Crear usuario
// =====================================

const create = async (

    {
        nombre,
        correo,
        password_hash,
        id_oficina
    },

    client = pool

) => {

    const query = `
        INSERT INTO usuarios
        (
            nombre,
            correo,
            password_hash,
            id_oficina
        )

        VALUES
        ($1,$2,$3,$4)

        RETURNING

            id_usuario,
            nombre,
            correo,
            id_oficina,
            estado,
            fecha_registro;
    `;

    const result = await client.query(

        query,

        [
            nombre,
            correo,
            password_hash,
            id_oficina
        ]

    );

    return result.rows[0];

};




// =====================================
// Asignar rol
// =====================================

const assignRole = async (

    id_usuario,
    id_rol,

    client = pool

) => {

    const query = `
        INSERT INTO usuario_roles
        (
            id_usuario,
            id_rol
        )

        VALUES
        ($1,$2)

        RETURNING *;
    `;

    const result = await client.query(

        query,

        [
            id_usuario,
            id_rol
        ]

    );

    return result.rows[0];

};




// =====================================
// Listar usuarios
// =====================================

const findAll = async () => {

    const query = `

        SELECT

            u.id_usuario,
            u.nombre,
            u.correo,
            u.estado,
            u.ultimo_acceso,
            u.fecha_registro,

            o.id_oficina,
            o.nombre AS oficina,

            r.id_rol,
            r.nombre AS rol

        FROM usuarios u

        LEFT JOIN oficinas o
            ON u.id_oficina = o.id_oficina

        LEFT JOIN usuario_roles ur
            ON u.id_usuario = ur.id_usuario

        LEFT JOIN roles r
            ON ur.id_rol = r.id_rol

        ORDER BY u.id_usuario;

    `;

    const result = await pool.query(query);

    return result.rows;

};




// =====================================
// Buscar usuario por ID
// =====================================

const findById = async (id) => {

    const query = `

        SELECT

            u.id_usuario,
            u.nombre,
            u.correo,
            u.estado,
            u.ultimo_acceso,
            u.fecha_registro,

            o.id_oficina,
            o.nombre AS oficina,

            r.id_rol,
            r.nombre AS rol

        FROM usuarios u

        LEFT JOIN oficinas o
            ON u.id_oficina = o.id_oficina

        LEFT JOIN usuario_roles ur
            ON u.id_usuario = ur.id_usuario

        LEFT JOIN roles r
            ON ur.id_rol = r.id_rol

        WHERE u.id_usuario = $1;

    `;

    const result = await pool.query(
        query,
        [id]
    );

    return result.rows[0];

};

// =====================================
// Actualizar usuario
// =====================================

const update = async (

    id,

    {
        nombre,
        correo,
        id_oficina
    },

    client = pool

) => {


    const query = `

        UPDATE usuarios

        SET

            nombre = $1,
            correo = $2,
            id_oficina = $3


        WHERE id_usuario = $4


        RETURNING

            id_usuario,
            nombre,
            correo,
            id_oficina,
            estado;

    `;


    const result = await client.query(

        query,

        [
            nombre,
            correo,
            id_oficina,
            id
        ]

    );


    return result.rows[0];

};




// =====================================
// Actualizar rol del usuario
// =====================================

const updateRole = async (

    id_usuario,
    id_rol,

    client = pool

) => {


    const query = `

        UPDATE usuario_roles

        SET

            id_rol = $1


        WHERE id_usuario = $2


        RETURNING *;

    `;


    const result = await client.query(

        query,

        [
            id_rol,
            id_usuario
        ]

    );


    return result.rows[0];

};




// =====================================
// Cambiar contraseña
// =====================================

const changePassword = async (

    id,
    password_hash,

    client = pool

) => {


    const query = `

        UPDATE usuarios

        SET

            password_hash = $1


        WHERE id_usuario = $2


        RETURNING

            id_usuario,
            correo;

    `;


    const result = await client.query(

        query,

        [
            password_hash,
            id
        ]

    );


    return result.rows[0];

};




// =====================================
// Cambiar estado
// =====================================

const changeStatus = async (

    id,
    estado,

    client = pool

) => {


    const query = `

        UPDATE usuarios

        SET

            estado = $1


        WHERE id_usuario = $2


        RETURNING

            id_usuario,
            nombre,
            estado;

    `;


    const result = await client.query(

        query,

        [
            estado,
            id
        ]

    );


    return result.rows[0];

};




// =====================================
// Eliminar roles del usuario
// =====================================

const deleteRoles = async (

    id_usuario,

    client = pool

) => {


    const query = `

        DELETE FROM usuario_roles

        WHERE id_usuario = $1;

    `;


    await client.query(

        query,

        [
            id_usuario
        ]

    );

};




// =====================================
// Eliminación lógica
// =====================================

const remove = async (

    id,

    client = pool

) => {


    const query = `

        UPDATE usuarios

        SET

            estado = FALSE


        WHERE id_usuario = $1


        RETURNING

            id_usuario,
            nombre,
            estado;

    `;


    const result = await client.query(

        query,

        [
            id
        ]

    );


    return result.rows[0];

};




// =====================================
// Obtener conexión para transacciones
// =====================================

const getClient = async () => {

    return await pool.connect();

};




// =====================================
// EXPORTAR
// =====================================

module.exports = {


    // Consultas

    findByEmail,
    findByEmailExceptId,

    findRoleById,
    findOfficeById,

    findPermissionsByRole,


    // Crear

    create,
    assignRole,


    // Consultas usuarios

    findAll,
    findById,


    // Actualizar

    update,
    updateRole,


    // Seguridad

    changePassword,
    changeStatus,


    // Roles

    deleteRoles,


    // Estado

    remove,


    // Transacciones

    getClient

};