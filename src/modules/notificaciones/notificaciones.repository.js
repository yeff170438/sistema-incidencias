const pool =
    require('../../database/database');


// =====================================
// CREAR NOTIFICACIÓN
// =====================================

// =====================================
// CREAR NOTIFICACIÓN
// =====================================

const create = async (data) => {

    const {

        id_ticket,

        id_tipo_notificacion,

        id_incidencia,

        id_usuario,

        id_ciudadano,

        mensaje

    } = data;


    const query = `

        INSERT INTO notificaciones
        (
            id_ticket,
            id_tipo_notificacion,
            id_incidencia,
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
            $5,
            $6
        )

        RETURNING *;

    `;


    const values = [

        id_ticket || null,

        id_tipo_notificacion,

        id_incidencia || null,

        id_usuario || null,

        id_ciudadano || null,

        mensaje

    ];


    const result =
        await pool.query(
            query,
            values
        );


    return result.rows[0];

};


// =====================================
// BUSCAR NOTIFICACIÓN POR ID
// =====================================

const findById = async (
    id_notificacion
) => {

    const query = `

        SELECT

            n.*,

            tn.nombre AS tipo_notificacion,

            c.nombres,

            c.apellido_paterno,

            c.apellido_materno,

            c.correo AS correo_ciudadano

        FROM notificaciones n

        INNER JOIN tipos_notificacion tn
            ON tn.id_tipo_notificacion =
               n.id_tipo_notificacion

        LEFT JOIN ciudadanos c
            ON c.id_ciudadano =
               n.id_ciudadano

        WHERE
            n.id_notificacion = $1;

    `;


    const result =
        await pool.query(
            query,
            [id_notificacion]
        );


    return result.rows[0];

};


// =====================================
// LISTAR NOTIFICACIONES DEL CIUDADANO
// =====================================

const findByCitizen = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            n.*,

            tn.nombre AS tipo_notificacion

        FROM notificaciones n

        INNER JOIN tipos_notificacion tn
            ON tn.id_tipo_notificacion =
               n.id_tipo_notificacion

        WHERE
            n.id_ciudadano = $1

        ORDER BY
            n.fecha DESC;

    `;


    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );


    return result.rows;

};


// =====================================
// NOTIFICACIONES NO LEÍDAS
// =====================================

const findUnreadByCitizen = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            n.*,

            tn.nombre AS tipo_notificacion

        FROM notificaciones n

        INNER JOIN tipos_notificacion tn
            ON tn.id_tipo_notificacion =
               n.id_tipo_notificacion

        WHERE
            n.id_ciudadano = $1

            AND n.leido = FALSE

        ORDER BY
            n.fecha DESC;

    `;


    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );


    return result.rows;

};


// =====================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// =====================================

const countUnreadByCitizen = async (
    id_ciudadano
) => {

    const query = `

        SELECT

            COUNT(*)::INTEGER AS total

        FROM notificaciones

        WHERE
            id_ciudadano = $1

            AND leido = FALSE;

    `;


    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );


    return result.rows[0].total;

};


// =====================================
// NOTIFICACIONES DE UNA INCIDENCIA
// =====================================

const findByIncident = async (
    id_incidencia
) => {

    const query = `

        SELECT

            n.*,

            tn.nombre AS tipo_notificacion

        FROM notificaciones n

        INNER JOIN tipos_notificacion tn
            ON tn.id_tipo_notificacion =
               n.id_tipo_notificacion

        WHERE
            n.id_incidencia = $1

        ORDER BY
            n.fecha DESC;

    `;


    const result =
        await pool.query(
            query,
            [id_incidencia]
        );


    return result.rows;

};


// =====================================
// NOTIFICACIONES DE UN TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            n.*,

            tn.nombre AS tipo_notificacion

        FROM notificaciones n

        INNER JOIN tipos_notificacion tn
            ON tn.id_tipo_notificacion =
               n.id_tipo_notificacion

        WHERE
            n.id_ticket = $1

        ORDER BY
            n.fecha DESC;

    `;


    const result =
        await pool.query(
            query,
            [id_ticket]
        );


    return result.rows;

};


// =====================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// =====================================

const markAsRead = async (
    id_notificacion
) => {

    const query = `

        UPDATE notificaciones

        SET
            leido = TRUE

        WHERE
            id_notificacion = $1

        RETURNING *;

    `;


    const result =
        await pool.query(
            query,
            [id_notificacion]
        );


    return result.rows[0];

};


// =====================================
// MARCAR TODAS COMO LEÍDAS
// =====================================

const markAllAsReadByCitizen = async (
    id_ciudadano
) => {

    const query = `

        UPDATE notificaciones

        SET
            leido = TRUE

        WHERE
            id_ciudadano = $1

            AND leido = FALSE

        RETURNING *;

    `;


    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );


    return result.rows;

};


// =====================================
// BUSCAR TIPO DE NOTIFICACIÓN
// =====================================

const findTypeByName = async (
    nombre
) => {

    const query = `

        SELECT

            id_tipo_notificacion

        FROM tipos_notificacion

        WHERE
            nombre = $1;

    `;


    const result =
        await pool.query(
            query,
            [nombre]
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

            apellido_materno,

            correo

        FROM ciudadanos

        WHERE
            id_ciudadano = $1;

    `;


    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );


    return result.rows[0];

};


// =====================================
// BUSCAR TICKET POR ID
// =====================================

const findTicketById = async (
    id_ticket
) => {

    const query = `

        SELECT

            t.id_ticket,

            t.codigo_ticket,

            t.id_incidencia,

            t.id_estado

        FROM tickets t

        WHERE
            t.id_ticket = $1;

    `;


    const result =
        await pool.query(
            query,
            [id_ticket]
        );


    return result.rows[0];

};


// =====================================
// BUSCAR INCIDENCIA POR ID
// =====================================

const findIncidentById = async (
    id_incidencia
) => {

    const query = `

        SELECT

            i.id_incidencia,

            i.codigo_incidencia,

            i.id_ciudadano,

            i.id_categoria,

            i.id_sector,

            i.id_estado,

            i.titulo

        FROM incidencias i

        WHERE
            i.id_incidencia = $1;

    `;


    const result =
        await pool.query(
            query,
            [id_incidencia]
        );


    return result.rows[0];

};

// =====================================
// BUSCAR USUARIO POR ID
// =====================================

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

            correo,

            id_oficina,

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
// BUSCAR RESPONSABLES DE UNA OFICINA
// =====================================

const findResponsibleUsersByOffice = async (
    id_oficina
) => {

    const query = `

        SELECT

            u.id_usuario,

            u.nombre,

            u.correo,

            u.id_oficina

        FROM usuarios u

        INNER JOIN usuario_roles ur

            ON u.id_usuario =
               ur.id_usuario

        INNER JOIN roles r

            ON ur.id_rol =
               r.id_rol

        WHERE

            u.id_oficina = $1

        AND

            u.estado = TRUE

        AND

            r.nombre = 'RESPONSABLE'

        ORDER BY

            u.id_usuario;

    `;


    const result =
        await pool.query(

            query,

            [
                id_oficina
            ]

        );


    return result.rows;

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    create,

    findById,

    findByCitizen,

    findUnreadByCitizen,

    countUnreadByCitizen,

    findByIncident,

    findByTicket,

    markAsRead,

    markAllAsReadByCitizen,

    findTypeByName,

    findCitizenById,

    findTicketById,

    findIncidentById,

    findUserById,

    findResponsibleUsersByOffice

};