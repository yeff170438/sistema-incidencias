const pool =
    require('../../database/database');



// =====================================
// Buscar ticket con asignación activa
// =====================================

const findTicketForDerivation = async (
    id_ticket
) => {

    const query = `

        SELECT

            -- =====================================
            -- TICKET
            -- =====================================

            t.id_ticket,

            t.codigo_ticket,

            t.id_estado AS id_estado_ticket,

            ce.nombre AS estado_ticket,


            -- =====================================
            -- ASIGNACIÓN ACTUAL
            -- =====================================

            a.id_asignacion,

            a.id_oficina,

            a.id_estado AS id_estado_asignacion,


            -- =====================================
            -- OFICINA ACTUAL
            -- =====================================

            o.nombre AS oficina_actual,


            -- =====================================
            -- INCIDENCIA
            -- =====================================

            i.id_incidencia,

            i.titulo,

            i.id_ciudadano


        FROM tickets t


        INNER JOIN catalogo_estados ce

            ON t.id_estado =
               ce.id_estado


        INNER JOIN asignaciones a

            ON t.id_ticket =
               a.id_ticket


        INNER JOIN oficinas o

            ON a.id_oficina =
               o.id_oficina


        INNER JOIN incidencias i

            ON t.id_incidencia =
               i.id_incidencia


        WHERE

            t.id_ticket = $1


        AND a.id_estado IN (

            SELECT id_estado

            FROM catalogo_estados

            WHERE

                tipo_estado =
                'ASIGNACION'

            AND nombre IN (

                'Pendiente de recepción',

                'Recibida',

                'En proceso'

            )

        )


        ORDER BY

            a.id_asignacion DESC


        LIMIT 1;

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
// Buscar oficina destino
// =====================================

const findOfficeById = async (
    id_oficina
) => {

    const query = `

        SELECT

            id_oficina,

            nombre

        FROM oficinas

        WHERE

            id_oficina = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_oficina
            ]

        );


    return result.rows[0];

};



// =====================================
// Buscar motivo de derivación
// =====================================

const findMotivoById = async (
    id_motivo
) => {

    const query = `

        SELECT

            id_motivo,

            nombre,

            descripcion

        FROM motivos_derivacion

        WHERE

            id_motivo = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_motivo
            ]

        );


    return result.rows[0];

};



// =====================================
// Crear derivación
// =====================================

const create = async (
    data
) => {

    const query = `

        INSERT INTO derivaciones

        (

            id_ticket,

            oficina_origen,

            oficina_destino,

            id_usuario,

            id_motivo,

            comentario

        )

        VALUES

        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6

        )

        RETURNING *;

    `;


    const result =
        await pool.query(

            query,

            [

                data.id_ticket,

                data.oficina_origen,

                data.oficina_destino,

                data.id_usuario,

                data.id_motivo,

                data.comentario

            ]

        );


    return result.rows[0];

};



// =====================================
// Actualizar estado del ticket
// =====================================

const updateTicketStatus = async (

    id_ticket,

    id_estado

) => {

    const query = `

        UPDATE tickets

        SET

            id_estado = $1

        WHERE

            id_ticket = $2

        RETURNING *;

    `;


    const result =
        await pool.query(

            query,

            [

                id_estado,

                id_ticket

            ]

        );


    return result.rows[0];

};



// =====================================
// Buscar estado del catálogo
// =====================================

const findStateByName = async (

    tipo_estado,

    nombre

) => {

    const query = `

        SELECT

            id_estado,

            nombre

        FROM catalogo_estados

        WHERE

            tipo_estado = $1

        AND

            nombre = $2;

    `;


    const result =
        await pool.query(

            query,

            [

                tipo_estado,

                nombre

            ]

        );


    return result.rows[0];

};



// =====================================
// Exportar
// =====================================

module.exports = {

    findTicketForDerivation,

    findOfficeById,

    findMotivoById,

    create,

    updateTicketStatus,

    findStateByName

};