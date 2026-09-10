const pool =
    require('../../database/database');


// =====================================
// CREAR COMUNICACIÓN
// =====================================

const create = async (data) => {

    const query = `

        INSERT INTO comunicaciones_ticket
        (
            id_ticket,
            tipo_emisor,
            id_usuario,
            id_ciudadano,
            mensaje
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )

        RETURNING
            id_comunicacion,
            id_ticket,
            tipo_emisor,
            id_usuario,
            id_ciudadano,
            mensaje,
            fecha;

    `;


    const result =
        await pool.query(

            query,

            [

                data.id_ticket,

                data.tipo_emisor,

                data.id_usuario || null,

                data.id_ciudadano || null,

                data.mensaje

            ]

        );


    return result.rows[0];

};



// =====================================
// BUSCAR COMUNICACIÓN POR ID
// =====================================

const findById = async (
    id_comunicacion
) => {

    const query = `

        SELECT

            c.id_comunicacion,

            c.id_ticket,

            c.tipo_emisor,

            c.id_usuario,

            u.nombre AS usuario,

            c.id_ciudadano,

            c.mensaje,

            c.fecha

        FROM comunicaciones_ticket c

        LEFT JOIN usuarios u

            ON c.id_usuario =
               u.id_usuario

        WHERE

            c.id_comunicacion = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_comunicacion
            ]

        );


    return result.rows[0];

};



// =====================================
// LISTAR COMUNICACIONES DE UN TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            c.id_comunicacion,

            c.id_ticket,

            c.tipo_emisor,

            c.id_usuario,

            u.nombre AS usuario,

            c.id_ciudadano,

            c.mensaje,

            c.fecha

        FROM comunicaciones_ticket c

        LEFT JOIN usuarios u

            ON c.id_usuario =
               u.id_usuario

        WHERE

            c.id_ticket = $1

        ORDER BY

            c.fecha ASC;

    `;


    const result =
        await pool.query(

            query,

            [
                id_ticket
            ]

        );


    return result.rows;

};



// =====================================
// LISTAR TODAS LAS COMUNICACIONES
// =====================================

const findAll = async () => {

    const query = `

        SELECT

            c.id_comunicacion,

            c.id_ticket,

            c.tipo_emisor,

            c.id_usuario,

            u.nombre AS usuario,

            c.id_ciudadano,

            c.mensaje,

            c.fecha

        FROM comunicaciones_ticket c

        LEFT JOIN usuarios u

            ON c.id_usuario =
               u.id_usuario

        ORDER BY

            c.fecha DESC;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};



// =====================================
// BUSCAR TICKET
// =====================================

const findTicketById = async (
    id_ticket
) => {

    const query = `

        SELECT

            t.id_ticket,

            t.id_estado,

            ce.nombre AS estado_ticket,

            t.id_incidencia

        FROM tickets t

        INNER JOIN catalogo_estados ce

            ON t.id_estado =
               ce.id_estado

        WHERE

            t.id_ticket = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_ticket
            ]

        );


    return result.rows[0];

};



// =====================================
// BUSCAR USUARIO POR ID
// =====================================

const findUserById = async (
    id_usuario
) => {

    const query = `

        SELECT

            id_usuario,

            nombre,

            estado

        FROM usuarios

        WHERE

            id_usuario = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_usuario
            ]

        );


    return result.rows[0];

};



// =====================================
// BUSCAR CIUDADANO POR ID
// =====================================

const findCitizenById = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            id_ciudadano,

            nombres,

            apellido_paterno,

            apellido_materno

        FROM ciudadanos

        WHERE

            id_ciudadano = $1;

    `;


    const result =
        await pool.query(

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

    create,

    findById,

    findByTicket,

    findAll,

    findTicketById,

    findUserById,

    findCitizenById

};