const pool = require('../../database/database');


// =====================================
// Buscar ciudadano por DNI
// =====================================

const findByDni = async (dni) => {

    const query = `
        SELECT
            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            correo,
            telefono,
            direccion,
            correo_verificado,
            ultimo_acceso,
            fecha_registro
        FROM ciudadanos
        WHERE dni = $1;
    `;


    const result = await pool.query(
        query,
        [dni]
    );


    return result.rows[0];

};



// =====================================
// Buscar ciudadano por correo
// =====================================

const findByEmail = async (correo) => {

    const query = `
        SELECT
            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            correo,
            password_hash,
            telefono,
            direccion,
            correo_verificado,
            ultimo_acceso,
            fecha_registro
        FROM ciudadanos
        WHERE correo = $1;
    `;


    const result = await pool.query(
        query,
        [correo]
    );

    return result.rows[0];

};



// =====================================
// Crear ciudadano
// =====================================

const create = async ({
    dni,
    nombres,
    apellido_paterno,
    apellido_materno,
    telefono,
    correo,
    password_hash,
    direccion
}) => {


    const query = `
        INSERT INTO ciudadanos
        (
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            password_hash,
            direccion
        )

        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)

        RETURNING

            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            direccion,
            correo_verificado,
            fecha_registro;
    `;


    const result = await pool.query(
        query,
        [
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            password_hash,
            direccion
        ]
    );


    return result.rows[0];

};



// =====================================
// Buscar ciudadano por ID
// =====================================

const findById = async (id_ciudadano) => {


    const query = `
        SELECT

            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            direccion,
            correo_verificado,
            ultimo_acceso,
            fecha_registro

        FROM ciudadanos

        WHERE id_ciudadano = $1;
    `;


    const result = await pool.query(
        query,
        [id_ciudadano]
    );


    return result.rows[0];

};



// =====================================
// Listar ciudadanos
// =====================================

const findAll = async () => {


    const query = `
        SELECT

            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            direccion,
            correo_verificado,
            ultimo_acceso,
            fecha_registro

        FROM ciudadanos

        ORDER BY id_ciudadano ASC;
    `;


    const result = await pool.query(
        query
    );


    return result.rows;

};



// =====================================
// Actualizar perfil ciudadano
// =====================================

const update = async (
    id_ciudadano,
    {
        nombres,
        apellido_paterno,
        apellido_materno,
        telefono,
        correo,
        direccion
    }
) => {


    const query = `
        UPDATE ciudadanos

        SET

            nombres=$1,
            apellido_paterno=$2,
            apellido_materno=$3,
            telefono=$4,
            correo=$5,
            direccion=$6

        WHERE id_ciudadano=$7


        RETURNING

            id_ciudadano,
            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            direccion;

    `;


    const result = await pool.query(
        query,
        [
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            direccion,
            id_ciudadano
        ]
    );


    return result.rows[0];

};



// =====================================
// Cambiar contraseña
// =====================================

const changePassword = async (
    id_ciudadano,
    password_hash
) => {


    const query = `
        UPDATE ciudadanos

        SET password_hash=$1

        WHERE id_ciudadano=$2


        RETURNING

            id_ciudadano,
            correo;
    `;


    const result = await pool.query(
        query,
        [
            password_hash,
            id_ciudadano
        ]
    );


    return result.rows[0];

};



// =====================================
// Actualizar último acceso
// =====================================

const updateLastAccess = async (
    id_ciudadano
) => {


    const query = `
        UPDATE ciudadanos

        SET ultimo_acceso = NOW()

        WHERE id_ciudadano=$1


        RETURNING

            id_ciudadano,
            ultimo_acceso;
    `;


    const result = await pool.query(
        query,
        [
            id_ciudadano
        ]
    );


    return result.rows[0];

};



// =====================================
// Verificar correo
// =====================================

const verifyEmail = async (
    id_ciudadano
) => {


    const query = `
        UPDATE ciudadanos

        SET correo_verificado = TRUE

        WHERE id_ciudadano=$1


        RETURNING

            id_ciudadano,
            correo_verificado;
    `;


    const result = await pool.query(
        query,
        [
            id_ciudadano
        ]
    );


    return result.rows[0];

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findByDni,
    findByEmail,

    create,

    findById,
    findAll,

    update,

    changePassword,

    updateLastAccess,

    verifyEmail

};