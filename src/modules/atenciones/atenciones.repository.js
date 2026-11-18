const pool =
    require('../../database/database');


// =====================================
// CREAR ATENCIÓN
// =====================================

const create = async (data) => {

    const query = `

        INSERT INTO atenciones
        (
            id_ticket,
            id_asignacion,
            id_oficina,
            id_usuario,
            descripcion_atencion,
            fecha_inicio
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            CURRENT_TIMESTAMP
        )

        RETURNING *;

    `;

    const result =
        await pool.query(

            query,

            [
                data.id_ticket,
                data.id_asignacion,
                data.id_oficina,
                data.id_usuario,
                data.descripcion_atencion
            ]

        );

    return result.rows[0];

};


// =====================================
// BUSCAR ATENCIÓN POR ID
// =====================================

const findById = async (id_atencion) => {

    const query = `

        SELECT

            a.id_atencion,
            a.id_ticket,
            a.id_asignacion,
            a.id_oficina,
            a.id_usuario,

            a.descripcion_atencion,
            a.resultado,
            a.conclusion,

            a.fecha_inicio,
            a.fecha_actualizacion,
            a.fecha_fin,

            -- ==============================
            -- TICKET
            -- ==============================

            t.codigo_ticket,
            t.id_estado AS id_estado_ticket,

            cet.nombre AS estado_ticket,

            -- ==============================
            -- INCIDENCIA
            -- ==============================

            i.id_incidencia,
            i.codigo_incidencia,
            i.id_ciudadano,

            -- ==============================
            -- OFICINA
            -- ==============================

            o.nombre AS oficina,

            -- ==============================
            -- USUARIO
            -- ==============================

            u.nombre AS usuario

        FROM atenciones a

        INNER JOIN tickets t
            ON a.id_ticket = t.id_ticket

        INNER JOIN catalogo_estados cet
            ON t.id_estado = cet.id_estado

        INNER JOIN incidencias i
            ON t.id_incidencia = i.id_incidencia

        INNER JOIN oficinas o
            ON a.id_oficina = o.id_oficina

        INNER JOIN usuarios u
            ON a.id_usuario = u.id_usuario

        WHERE
            a.id_atencion = $1;

    `;

    const result =
        await pool.query(
            query,
            [id_atencion]
        );

    return result.rows[0];

};


// =====================================
// BUSCAR ATENCIONES DEL TICKET
// =====================================

const findByTicket = async (id_ticket) => {

    const query = `

        SELECT

            a.id_atencion,
            a.id_ticket,
            a.id_asignacion,
            a.id_oficina,
            a.id_usuario,

            a.descripcion_atencion,
            a.resultado,
            a.conclusion,

            a.fecha_inicio,
            a.fecha_actualizacion,
            a.fecha_fin,

            t.codigo_ticket,

            cet.nombre AS estado_ticket,

            o.nombre AS oficina,

            u.nombre AS usuario

        FROM atenciones a

        INNER JOIN tickets t
            ON a.id_ticket = t.id_ticket

        INNER JOIN catalogo_estados cet
            ON t.id_estado = cet.id_estado

        INNER JOIN oficinas o
            ON a.id_oficina = o.id_oficina

        INNER JOIN usuarios u
            ON a.id_usuario = u.id_usuario

        WHERE
            a.id_ticket = $1

        ORDER BY
            a.fecha_inicio DESC;

    `;

    const result =
        await pool.query(
            query,
            [id_ticket]
        );

    return result.rows;

};


// =====================================
// BUSCAR ATENCIÓN ACTIVA
// =====================================

const findActiveByTicket = async (id_ticket) => {

    const query = `

        SELECT

            *

        FROM atenciones

        WHERE
            id_ticket = $1

        AND
            fecha_fin IS NULL

        ORDER BY
            fecha_inicio DESC

        LIMIT 1;

    `;

    const result =
        await pool.query(
            query,
            [id_ticket]
        );

    return result.rows[0];

};


// =====================================
// ACTUALIZAR AVANCE
// =====================================

const updateProgress = async (data) => {

    const campos = [];
    const valores = [];

    let contador = 1;


    if (data.descripcion_atencion) {

        campos.push(
            `descripcion_atencion = $${contador}`
        );

        valores.push(
            data.descripcion_atencion
        );

        contador++;

    }


    if (data.resultado) {

        campos.push(
            `resultado = $${contador}`
        );

        valores.push(
            data.resultado
        );

        contador++;

    }


    if (data.conclusion) {

        campos.push(
            `conclusion = $${contador}`
        );

        valores.push(
            data.conclusion
        );

        contador++;

    }


    campos.push(
        'fecha_actualizacion = CURRENT_TIMESTAMP'
    );


    valores.push(
        data.id_atencion
    );


    const query = `

        UPDATE atenciones

        SET
            ${campos.join(', ')}

        WHERE
            id_atencion = $${contador}

        AND
            fecha_fin IS NULL

        RETURNING *;

    `;


    const result =
        await pool.query(
            query,
            valores
        );


    return result.rows[0];

};


// =====================================
// FINALIZAR ATENCIÓN
// =====================================

const finishAttention = async (data) => {

    const query = `

        UPDATE atenciones

        SET

            resultado = $1,

            conclusion = $2,

            fecha_fin = CURRENT_TIMESTAMP,

            fecha_actualizacion = CURRENT_TIMESTAMP

        WHERE

            id_atencion = $3

        AND

            fecha_fin IS NULL

        RETURNING *;

    `;


    const result =
        await pool.query(

            query,

            [
                data.resultado,
                data.conclusion,
                data.id_atencion
            ]

        );


    return result.rows[0];

};


// =====================================
// BUSCAR ASIGNACIÓN PARA ATENCIÓN
// =====================================

const findAssignmentForAttention =
    async (id_asignacion) => {

        const query = `

            SELECT

                a.id_asignacion,
                a.id_ticket,
                a.id_oficina,
                a.id_usuario,

                a.id_estado,
                a.usuario_receptor,

                a.fecha_asignacion,
                a.fecha_recepcion,
                a.fecha_fin,

                ce.nombre AS estado_asignacion,

                -- ==========================
                -- TICKET
                -- ==========================

                t.id_estado AS id_estado_ticket,
                cet.nombre AS estado_ticket,

                t.codigo_ticket,

                -- ==========================
                -- INCIDENCIA
                -- ==========================

                i.id_incidencia,
                i.id_ciudadano

            FROM asignaciones a

            INNER JOIN catalogo_estados ce
                ON a.id_estado = ce.id_estado

            INNER JOIN tickets t
                ON a.id_ticket = t.id_ticket

            INNER JOIN catalogo_estados cet
                ON t.id_estado = cet.id_estado

            INNER JOIN incidencias i
                ON t.id_incidencia = i.id_incidencia

            WHERE
                a.id_asignacion = $1;

        `;


        const result =
            await pool.query(
                query,
                [id_asignacion]
            );


        return result.rows[0];

    };


// =====================================
// BUSCAR ESTADO
// =====================================

const findStateByName =
    async (tipo_estado, nombre) => {

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
// ACTUALIZAR ESTADO TICKET
// =====================================

const updateTicketStatus =
    async (id_ticket, id_estado) => {

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
// ÚLTIMA ATENCIÓN DEL TICKET
// =====================================

const findLastAttentionByTicket =
    async (id_ticket) => {

        const query = `

            SELECT *

            FROM atenciones

            WHERE
                id_ticket = $1

            ORDER BY
                fecha_inicio DESC

            LIMIT 1;

        `;


        const result =
            await pool.query(

                query,

                [id_ticket]

            );


        return result.rows[0];

    };


// =====================================
// ATENCIÓN POR ASIGNACIÓN
// =====================================

const findByAssignment =
    async (id_asignacion) => {

        const query = `

            SELECT *

            FROM atenciones

            WHERE
                id_asignacion = $1

            ORDER BY
                fecha_inicio DESC

            LIMIT 1;

        `;


        const result =
            await pool.query(

                query,

                [id_asignacion]

            );


        return result.rows[0];

    };


// =====================================
// FINALIZAR ATENCIÓN POR DERIVACIÓN
// =====================================

const finishAttentionByDerivation =
    async (data) => {

        const query = `

            UPDATE atenciones

            SET

                resultado = $1,

                conclusion = $2,

                fecha_fin = CURRENT_TIMESTAMP,

                fecha_actualizacion = CURRENT_TIMESTAMP

            WHERE

                id_atencion = $3

            AND

                fecha_fin IS NULL

            RETURNING *;

        `;


        const result =
            await pool.query(

                query,

                [
                    data.resultado,
                    data.conclusion,
                    data.id_atencion
                ]

            );


        return result.rows[0];

    };
// =====================================
// LISTAR TODAS LAS ATENCIONES
// =====================================
const findAll = async () => {

    const query = `
        SELECT
            a.id_atencion,
            a.id_ticket,
            a.id_asignacion,
            a.id_oficina,
            a.id_usuario,
            a.descripcion_atencion,
            a.resultado,
            a.conclusion,
            a.fecha_inicio,
            a.fecha_actualizacion,
            a.fecha_fin,

            t.codigo_ticket,
            t.id_estado AS id_estado_ticket,
            cet.nombre AS estado_ticket,

            i.id_incidencia,
            i.codigo_incidencia,
            i.id_ciudadano,

            o.nombre AS oficina,
            u.nombre AS usuario

        FROM atenciones a

        INNER JOIN tickets t
            ON a.id_ticket = t.id_ticket

        INNER JOIN catalogo_estados cet
            ON t.id_estado = cet.id_estado

        INNER JOIN incidencias i
            ON t.id_incidencia = i.id_incidencia

        INNER JOIN oficinas o
            ON a.id_oficina = o.id_oficina

        INNER JOIN usuarios u
            ON a.id_usuario = u.id_usuario

        ORDER BY
            a.fecha_inicio DESC,
            a.id_atencion DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
};

module.exports = {

    create,

    findById,

    findAll,

    findByTicket,

    findActiveByTicket,

    findByAssignment,

    findLastAttentionByTicket,

    updateProgress,

    finishAttention,

    findAssignmentForAttention,

    findStateByName,

    updateTicketStatus,

    finishAttentionByDerivation

};