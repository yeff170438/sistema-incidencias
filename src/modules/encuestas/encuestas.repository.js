const pool =
    require('../../database/database');


// =====================================
// Crear encuesta
// =====================================

const create = async (
    data,
    client = pool
) => {

    const {

        id_ticket,

        id_ciudadano,

        id_estado

    } = data;


    const query = `

        INSERT INTO encuestas
        (
            id_ticket,
            id_ciudadano,
            id_estado
        )

        VALUES
        (
            $1,
            $2,
            $3
        )

        RETURNING
            id_encuesta,
            id_ticket,
            id_ciudadano,
            id_estado,
            fecha_creacion,
            fecha_respuesta;

    `;


    const result =
        await client.query(

            query,

            [
                id_ticket,
                id_ciudadano,
                id_estado
            ]

        );


    return result.rows[0];

};


// =====================================
// Buscar encuesta por ID
// =====================================

const findById = async (
    id_encuesta
) => {

    const query = `

        SELECT

            e.id_encuesta,

            e.id_ticket,

            t.codigo_ticket,

            e.id_ciudadano,

            c.nombres,

            c.apellido_paterno,

            c.apellido_materno,

            e.id_estado,

            ce.nombre AS estado,

            e.fecha_creacion,

            e.fecha_respuesta

        FROM encuestas e


        INNER JOIN tickets t

            ON e.id_ticket =
               t.id_ticket


        INNER JOIN ciudadanos c

            ON e.id_ciudadano =
               c.id_ciudadano


        INNER JOIN catalogo_estados ce

            ON e.id_estado =
               ce.id_estado


        WHERE

            e.id_encuesta = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_encuesta
            ]

        );


    return result.rows[0];

};


// =====================================
// Buscar encuesta por ticket
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            e.id_encuesta,

            e.id_ticket,

            e.id_ciudadano,

            e.id_estado,

            ce.nombre AS estado,

            e.fecha_creacion,

            e.fecha_respuesta

        FROM encuestas e


        INNER JOIN catalogo_estados ce

            ON e.id_estado =
               ce.id_estado


        WHERE

            e.id_ticket = $1;

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
// Buscar encuestas del ciudadano
// =====================================

const findByCitizen = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            e.id_encuesta,

            e.id_ticket,

            t.codigo_ticket,

            e.id_estado,

            ce.nombre AS estado,

            e.fecha_creacion,

            e.fecha_respuesta

        FROM encuestas e


        INNER JOIN tickets t

            ON e.id_ticket =
               t.id_ticket


        INNER JOIN catalogo_estados ce

            ON e.id_estado =
               ce.id_estado


        WHERE

            e.id_ciudadano = $1


        ORDER BY

            e.fecha_creacion DESC;

    `;


    const result =
        await pool.query(

            query,

            [
                id_ciudadano
            ]

        );


    return result.rows;

};


// =====================================
// Buscar encuesta pendiente del ciudadano
// =====================================

const findPendingByCitizen = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            e.id_encuesta,

            e.id_ticket,

            t.codigo_ticket,

            e.id_ciudadano,

            e.id_estado,

            ce.nombre AS estado,

            e.fecha_creacion

        FROM encuestas e


        INNER JOIN tickets t

            ON e.id_ticket =
               t.id_ticket


        INNER JOIN catalogo_estados ce

            ON e.id_estado =
               ce.id_estado


        WHERE

            e.id_ciudadano = $1


        AND

            ce.tipo_estado = 'ENCUESTA'


        AND

            ce.nombre = 'Pendiente'


        ORDER BY

            e.fecha_creacion ASC;


    `;


    const result =
        await pool.query(

            query,

            [
                id_ciudadano
            ]

        );


    return result.rows;

};


// =====================================
// Buscar estado de encuesta
// =====================================

const findStateByName = async (
    nombre
) => {

    const query = `

        SELECT

            id_estado,

            nombre

        FROM catalogo_estados

        WHERE

            tipo_estado = 'ENCUESTA'

        AND

            nombre = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                nombre
            ]

        );


    return result.rows[0];

};


// =====================================
// Obtener preguntas activas
// =====================================

const findQuestions = async () => {

    const query = `

        SELECT

            id_pregunta,

            pregunta,

            tipo_respuesta,

            obligatoria,

            orden

        FROM preguntas_encuesta

        WHERE

            estado = TRUE

        ORDER BY

            orden ASC;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};


// =====================================
// Buscar pregunta por ID
// =====================================

const findQuestionById = async (
    id_pregunta
) => {

    const query = `

        SELECT

            id_pregunta,

            pregunta,

            tipo_respuesta,

            obligatoria,

            orden,

            estado

        FROM preguntas_encuesta

        WHERE

            id_pregunta = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_pregunta
            ]

        );


    return result.rows[0];

};


// =====================================
// Crear respuesta
// =====================================

const createAnswer = async (
    data,
    client = pool
) => {

    const {

        id_encuesta,

        id_pregunta,

        respuesta_valor,

        respuesta_texto

    } = data;


    const query = `

        INSERT INTO respuestas_encuesta
        (
            id_encuesta,
            id_pregunta,
            respuesta_valor,
            respuesta_texto
        )

        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )

        RETURNING

            id_respuesta,

            id_encuesta,

            id_pregunta,

            respuesta_valor,

            respuesta_texto,

            fecha_respuesta;

    `;


    const result =
        await client.query(

            query,

            [
                id_encuesta,
                id_pregunta,
                respuesta_valor || null,
                respuesta_texto || null
            ]

        );


    return result.rows[0];

};


// =====================================
// Buscar respuestas de encuesta
// =====================================

const findAnswersBySurvey = async (
    id_encuesta
) => {

    const query = `

        SELECT

            r.id_respuesta,

            r.id_encuesta,

            r.id_pregunta,

            p.pregunta,

            p.tipo_respuesta,

            p.orden,

            r.respuesta_valor,

            r.respuesta_texto,

            r.fecha_respuesta

        FROM respuestas_encuesta r


        INNER JOIN preguntas_encuesta p

            ON r.id_pregunta =
               p.id_pregunta


        WHERE

            r.id_encuesta = $1


        ORDER BY

            p.orden ASC;

    `;


    const result =
        await pool.query(

            query,

            [
                id_encuesta
            ]

        );


    return result.rows;

};


// =====================================
// Actualizar estado de encuesta
// =====================================

const updateStatus = async (
    id_encuesta,
    id_estado,
    client = pool
) => {

    const query = `

        UPDATE encuestas

        SET

            id_estado = $1,

            fecha_respuesta =

                CASE

                    WHEN (

                        SELECT nombre

                        FROM catalogo_estados

                        WHERE id_estado = $1

                    ) = 'Respondida'

                    THEN CURRENT_TIMESTAMP

                    ELSE fecha_respuesta

                END

        WHERE

            id_encuesta = $2


        RETURNING

            id_encuesta,

            id_ticket,

            id_ciudadano,

            id_estado,

            fecha_creacion,

            fecha_respuesta;

    `;


    const result =
        await client.query(

            query,

            [
                id_estado,
                id_encuesta
            ]

        );


    return result.rows[0];

};


// =====================================
// Obtener encuesta con respuestas
// =====================================

const findCompleteById = async (
    id_encuesta
) => {

    const encuesta =
        await findById(
            id_encuesta
        );


    if (!encuesta) {

        return null;

    }


    const respuestas =
        await findAnswersBySurvey(
            id_encuesta
        );


    return {

        ...encuesta,

        respuestas

    };

};


// =====================================
// Verificar si existe encuesta
// =====================================

const existsByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            id_encuesta

        FROM encuestas

        WHERE

            id_ticket = $1

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
// Estadísticas
// =====================================

const getStatistics = async () => {

    const query = `

        SELECT

            COUNT(*) AS total_encuestas,

            COUNT(*) FILTER (

                WHERE ce.nombre =
                'Respondida'

            ) AS respondidas,

            COUNT(*) FILTER (

                WHERE ce.nombre =
                'Pendiente'

            ) AS pendientes,

            COUNT(*) FILTER (

                WHERE ce.nombre =
                'Expirada'

            ) AS expiradas,

            ROUND(

                AVG(r.respuesta_valor)

            , 2) AS promedio_satisfaccion

        FROM encuestas e


        INNER JOIN catalogo_estados ce

            ON e.id_estado =
               ce.id_estado


        LEFT JOIN respuestas_encuesta r

            ON e.id_encuesta =
               r.id_encuesta

            AND r.respuesta_valor IS NOT NULL;

    `;


    const result =
        await pool.query(query);


    return result.rows[0];

};

// =====================================
// Obtener ticket para crear encuesta
// =====================================

const findTicketForSurvey = async (
    id_ticket
) => {

    const query = `

        SELECT

            t.id_ticket,

            t.codigo_ticket,

            t.id_incidencia,

            t.id_estado AS id_estado_ticket,

            ce.nombre AS estado_ticket,

            i.id_ciudadano

        FROM tickets t

        INNER JOIN catalogo_estados ce

            ON t.id_estado =
               ce.id_estado

        INNER JOIN incidencias i

            ON t.id_incidencia =
               i.id_incidencia

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
module.exports = {

    create,

    findById,

    findByTicket,

    findByCitizen,

    findPendingByCitizen,

    findStateByName,

    findQuestions,

    findQuestionById,

    createAnswer,

    findAnswersBySurvey,

    updateStatus,

    findCompleteById,

    existsByTicket,

    getStatistics,

    findTicketForSurvey

};