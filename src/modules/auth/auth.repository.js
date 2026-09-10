const pool = require('../../database/database');



// =====================================================
// BUSCAR USUARIO MUNICIPAL POR CORREO
// =====================================================

const findUserByEmail = async (correo) => {


    const query = `

        SELECT

            u.id_usuario,

            u.nombre,

            u.correo,

            u.password_hash,

            u.estado,

            r.nombre AS rol


        FROM usuarios u


        LEFT JOIN usuario_roles ur

            ON u.id_usuario = ur.id_usuario


        LEFT JOIN roles r

            ON ur.id_rol = r.id_rol


        WHERE

            u.correo = $1;

    `;


    const result = await pool.query(

        query,

        [
            correo
        ]

    );


    return result.rows[0];

};





// =====================================================
// OBTENER PERMISOS DEL USUARIO MUNICIPAL
// =====================================================

const getUserPermissions = async (id_usuario) => {


    const query = `

        SELECT

            p.nombre AS permiso


        FROM usuario_roles ur


        INNER JOIN rol_permisos rp

            ON ur.id_rol = rp.id_rol


        INNER JOIN permisos p

            ON rp.id_permiso = p.id_permiso


        WHERE

            ur.id_usuario = $1


        ORDER BY

            p.nombre;

    `;



    const result = await pool.query(

        query,

        [
            id_usuario
        ]

    );



    return result.rows.map(

        permiso => permiso.permiso

    );

};





// =====================================================
// BUSCAR CIUDADANO POR CORREO
// =====================================================

const findCitizenByEmail = async (correo) => {


    const query = `

        SELECT

            id_ciudadano,

            nombres,

            apellido_paterno,

            apellido_materno,

            correo,

            password_hash


        FROM ciudadanos


        WHERE

            correo = $1;

    `;



    const result = await pool.query(

        query,

        [
            correo
        ]

    );



    return result.rows[0];

};





// =====================================================
// CREAR USUARIO MUNICIPAL
// =====================================================

const createUser = async (

    nombre,

    correo,

    password_hash

) => {


    const query = `

        INSERT INTO usuarios

        (

            nombre,

            correo,

            password_hash

        )


        VALUES

        (

            $1,

            $2,

            $3

        )


        RETURNING

            id_usuario,

            nombre,

            correo;

    `;



    const result = await pool.query(

        query,

        [

            nombre,

            correo,

            password_hash

        ]

    );



    return result.rows[0];

};





// =====================================================
// CREAR CIUDADANO
// =====================================================

const createCitizen = async (data) => {


    const {

        dni,

        nombres,

        apellido_paterno,

        apellido_materno,

        correo,

        telefono,

        password_hash


    } = data;



    const query = `

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

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7

        )


        RETURNING

            id_ciudadano,

            nombres,

            apellido_paterno,

            correo;

    `;



    const result = await pool.query(

        query,

        [

            dni,

            nombres,

            apellido_paterno,

            apellido_materno,

            correo,

            telefono,

            password_hash

        ]

    );



    return result.rows[0];

};





// =====================================================
// EXPORTAR
// =====================================================

module.exports = {


    // Usuarios municipales

    findUserByEmail,

    getUserPermissions,

    createUser,


    // Ciudadanos

    findCitizenByEmail,

    createCitizen

};