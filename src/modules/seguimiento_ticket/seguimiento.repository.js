const pool =
    require('../../database/database');



// =====================================
// Crear seguimiento
// =====================================

const createTracking = async (
    data
) => {

    const {

        id_ticket,
        id_usuario,
        id_ciudadano,

        origen,
        accion,

        id_estado_anterior,
        id_estado_nuevo,

        comentario

    } = data;


    const query = `

        INSERT INTO seguimiento_ticket
        (

            id_ticket,

            id_usuario,

            id_ciudadano,

            origen,

            accion,

            id_estado_anterior,

            id_estado_nuevo,

            comentario

        )

        VALUES

        (

            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8

        )

        RETURNING *;

    `;


    const result =
        await pool.query(

            query,

            [

                id_ticket,

                id_usuario,

                id_ciudadano || null,

                origen,

                accion,

                id_estado_anterior || null,

                id_estado_nuevo || null,

                comentario || null

            ]

        );


    return result.rows[0];

};



// =====================================
// Obtener historial de ticket
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            s.id_seguimiento,

            s.id_ticket,

            s.origen,

            s.accion,

            s.comentario,

            s.fecha,

            ea.nombre AS estado_anterior,

            en.nombre AS estado_nuevo,

            u.nombre AS usuario,

            c.nombres AS ciudadano


        FROM seguimiento_ticket s


        LEFT JOIN catalogo_estados ea

            ON s.id_estado_anterior =
               ea.id_estado


        LEFT JOIN catalogo_estados en

            ON s.id_estado_nuevo =
               en.id_estado


        LEFT JOIN usuarios u

            ON s.id_usuario =
               u.id_usuario


        LEFT JOIN ciudadanos c

            ON s.id_ciudadano =
               c.id_ciudadano


        WHERE

            s.id_ticket = $1


        ORDER BY

            s.fecha ASC;

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
// EXPORTAR
// =====================================

module.exports = {

    createTracking,

    findByTicket

};