const pool =
    require('../../database/database');


// =====================================
// SOLICITUDES DE INCIDENCIA REPOSITORY
// =====================================


// =====================================
// BUSCAR TICKET
// =====================================

const findTicketById = async (
    id_ticket
) => {

    const query = `

        SELECT

            t.id_ticket,

            t.id_incidencia,
            t.modalidad_atencion,
        

            t.id_estado,

            ce.nombre AS estado_ticket,

            i.id_ciudadano,

            i.descripcion,

            i.ubicacion

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


// =====================================
// BUSCAR ESTADO SAIU POR NOMBRE
// =====================================

const findStateByName = async (
    nombre
) => {

    const query = `

        SELECT

            id_estado_saiu,

            nombre,

            descripcion

        FROM estados_saiu

        WHERE

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
// BUSCAR ESTADO SAIU POR ID
// =====================================

const findStateById = async (
    id_estado_saiu
) => {

    const query = `

        SELECT

            id_estado_saiu,

            nombre,

            descripcion

        FROM estados_saiu

        WHERE

            id_estado_saiu = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_estado_saiu
            ]

        );


    return result.rows[0];

};


// =====================================
// VERIFICAR SI EL TICKET YA TIENE SAIU
// =====================================

const existsByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            1

        FROM solicitudes_incidencia

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


    return result.rowCount > 0;

};


// =====================================
// CREAR SAIU
// =====================================

const create = async (
    data
) => {

    const query = `

        INSERT INTO solicitudes_incidencia
        (
            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            id_estado_saiu,

            observacion
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

        RETURNING

            id_saiu,

            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            fecha_generacion,

            numero_expediente,

            fecha_expediente,

            id_estado_saiu,

            fecha_vinculacion,

            observacion;

    `;


    const result =
        await pool.query(

            query,

            [

                data.id_ticket,

                data.codigo_saiu,

                data.id_usuario,

                data.id_oficina,

                data.id_estado_saiu,

                data.observacion || null

            ]

        );


    return result.rows[0];

};


// =====================================
// BUSCAR SAIU POR ID
// =====================================

const findById = async (
    id_saiu
) => {

    const query = `

        SELECT

            s.id_saiu,

            s.id_ticket,

            s.codigo_saiu,

            s.id_usuario,

            u.nombre AS usuario,

            s.id_oficina,

            o.nombre AS oficina,

            s.fecha_generacion,

            s.numero_expediente,

            s.fecha_expediente,

            s.id_estado_saiu,

            es.nombre AS estado_saiu,

            es.descripcion AS descripcion_estado,

            s.fecha_vinculacion,

            s.observacion

        FROM solicitudes_incidencia s

        INNER JOIN usuarios u

            ON s.id_usuario =
               u.id_usuario

        LEFT JOIN oficinas o

            ON s.id_oficina =
               o.id_oficina

        INNER JOIN estados_saiu es

            ON s.id_estado_saiu =
               es.id_estado_saiu

        WHERE

            s.id_saiu = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                id_saiu
            ]

        );


    return result.rows[0];

};


// =====================================
// BUSCAR SAIU POR TICKET
// =====================================

const findByTicket = async (
    id_ticket
) => {

    const query = `

        SELECT

            s.id_saiu,

            s.id_ticket,

            s.codigo_saiu,

            s.id_usuario,

            s.id_oficina,

            s.fecha_generacion,

            s.numero_expediente,

            s.fecha_expediente,

            s.id_estado_saiu,

            es.nombre AS estado_saiu,

            es.descripcion AS descripcion_estado,

            s.fecha_vinculacion,

            s.observacion

        FROM solicitudes_incidencia s

        INNER JOIN estados_saiu es

            ON s.id_estado_saiu =
               es.id_estado_saiu

        WHERE

            s.id_ticket = $1;

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
// REGISTRAR EXPEDIENTE
// =====================================

const registerExpediente = async (
    id_saiu,
    numero_expediente,
    fecha_expediente,
    id_estado_saiu
) => {

    const query = `

        UPDATE solicitudes_incidencia

        SET

            numero_expediente = $2,

            fecha_expediente = $3,

            id_estado_saiu = $4

        WHERE

            id_saiu = $1

        RETURNING

            id_saiu,

            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            fecha_generacion,

            numero_expediente,

            fecha_expediente,

            id_estado_saiu,

            fecha_vinculacion,

            observacion;

    `;


    const result =
        await pool.query(

            query,

            [

                id_saiu,

                numero_expediente,

                fecha_expediente,

                id_estado_saiu

            ]

        );


    return result.rows[0];

};




// =====================================
// ACTUALIZAR OBSERVACIÓN
// =====================================

const updateObservation = async (
    id_saiu,
    observacion
) => {

    const query = `

        UPDATE solicitudes_incidencia

        SET

            observacion = $2

        WHERE

            id_saiu = $1

        RETURNING

            id_saiu,

            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            fecha_generacion,

            numero_expediente,

            fecha_expediente,

            id_estado_saiu,

            fecha_vinculacion,

            observacion;

    `;


    const result =
        await pool.query(

            query,

            [

                id_saiu,

                observacion

            ]

        );


    return result.rows[0];

};


// =====================================
// LISTAR SAIU
// =====================================

const findAll = async () => {

    const query = `

        SELECT

            s.id_saiu,

            s.id_ticket,

            s.codigo_saiu,

            s.id_usuario,

            u.nombre AS usuario,

            s.id_oficina,

            o.nombre AS oficina,

            s.fecha_generacion,

            s.numero_expediente,

            s.fecha_expediente,

            s.id_estado_saiu,

            es.nombre AS estado_saiu,

            es.descripcion AS descripcion_estado,

            s.fecha_vinculacion,

            s.observacion

        FROM solicitudes_incidencia s

        INNER JOIN usuarios u

            ON s.id_usuario =
               u.id_usuario

        LEFT JOIN oficinas o

            ON s.id_oficina =
               o.id_oficina

        INNER JOIN estados_saiu es

            ON s.id_estado_saiu =
               es.id_estado_saiu

        ORDER BY

            s.fecha_generacion DESC;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};


// =====================================
// BUSCAR POR CÓDIGO SAIU
// =====================================

const findByCodigo = async (
    codigo_saiu
) => {

    const query = `

        SELECT

            s.id_saiu,

            s.id_ticket,

            s.codigo_saiu,

            s.id_usuario,

            s.id_oficina,

            s.fecha_generacion,

            s.numero_expediente,

            s.fecha_expediente,

            s.id_estado_saiu,

            es.nombre AS estado_saiu,

            s.fecha_vinculacion,

            s.observacion

        FROM solicitudes_incidencia s

        INNER JOIN estados_saiu es

            ON s.id_estado_saiu =
               es.id_estado_saiu

        WHERE

            s.codigo_saiu = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                codigo_saiu
            ]

        );


    return result.rows[0];

};


// =====================================
// BUSCAR POR NÚMERO DE EXPEDIENTE
// =====================================

const findByExpediente = async (
    numero_expediente
) => {

    const query = `

        SELECT

            s.id_saiu,

            s.id_ticket,

            s.codigo_saiu,

            s.id_usuario,

            s.id_oficina,

            s.fecha_generacion,

            s.numero_expediente,

            s.fecha_expediente,

            s.id_estado_saiu,

            es.nombre AS estado_saiu,

            s.fecha_vinculacion,

            s.observacion

        FROM solicitudes_incidencia s

        INNER JOIN estados_saiu es

            ON s.id_estado_saiu =
               es.id_estado_saiu

        WHERE

            s.numero_expediente = $1;

    `;


    const result =
        await pool.query(

            query,

            [
                numero_expediente
            ]

        );


    return result.rows[0];

};


// =====================================
// OBTENER SOLICITUD ADMINISTRATIVA COMPLETA
// =====================================

const findAdministrativeRequestBySAIU = async (id_saiu) => {
    const query = `
        SELECT
            -- =========================
            -- SAIU
            -- =========================
            s.id_saiu,
            s.codigo_saiu,
            s.id_ticket,
            s.id_usuario AS id_usuario_saiu,
            s.id_oficina,
            s.fecha_generacion,
            s.numero_expediente,
            s.fecha_expediente,
            s.id_estado_saiu,
            es.nombre AS estado_saiu,

            -- =========================
            -- TICKET
            -- =========================
            t.codigo_ticket,
            t.modalidad_atencion,
            t.id_prioridad,
            t.fecha_creacion,
            t.fecha_limite,

            -- =========================
            -- INCIDENCIA
            -- =========================
            i.id_incidencia,
            i.titulo,
            i.descripcion,
            i.ubicacion,
            i.direccion_texto,
            i.referencia,
            ST_Y(i.ubicacion) AS latitud,
            ST_X(i.ubicacion) AS longitud,
            cat.nombre AS categoria,

            -- =========================
            -- CIUDADANO
            -- =========================
            c.id_ciudadano,
            c.dni,
            c.nombres,
            c.apellido_paterno,
            c.apellido_materno,
            c.telefono,
            c.correo,
            c.direccion,

            -- =========================
            -- OFICINA
            -- =========================
            o.nombre AS oficina_nombre

        FROM solicitudes_incidencia s

        INNER JOIN tickets t
            ON s.id_ticket = t.id_ticket

        INNER JOIN incidencias i
            ON t.id_incidencia = i.id_incidencia

        INNER JOIN ciudadanos c
            ON i.id_ciudadano = c.id_ciudadano

        LEFT JOIN categorias cat
            ON i.id_categoria = cat.id_categoria

        LEFT JOIN oficinas o
            ON s.id_oficina = o.id_oficina

        INNER JOIN estados_saiu es
            ON s.id_estado_saiu = es.id_estado_saiu

        WHERE s.id_saiu = $1;
    `;

    const result = await pool.query(query, [id_saiu]);

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

            u.id_usuario,

            u.nombre,

            u.id_oficina,

            u.estado

        FROM usuarios u

        WHERE

            u.id_usuario = $1;

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
// RECIBIR / VINCULAR SAIU
// =====================================

const receiveSAIU = async (
    id_saiu,
    id_estado_saiu,
    fecha_vinculacion
) => {

    const query = `

        UPDATE solicitudes_incidencia

        SET

            id_estado_saiu = $2,

            fecha_vinculacion = $3

        WHERE

            id_saiu = $1

        RETURNING

            id_saiu,

            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            fecha_generacion,

            numero_expediente,

            fecha_expediente,

            id_estado_saiu,

            fecha_vinculacion,

            observacion;

    `;


    const result =
        await pool.query(

            query,

            [

                id_saiu,

                id_estado_saiu,

                fecha_vinculacion

            ]

        );


    return result.rows[0];

};



// =====================================
// ACTUALIZAR NÚMERO DE EXPEDIENTE
// =====================================

const updateExpediente = async (
    id_saiu,
    numero_expediente
) => {

    const query = `

        UPDATE solicitudes_incidencia

        SET
            numero_expediente = $2

        WHERE
            id_saiu = $1

        RETURNING

            id_saiu,

            id_ticket,

            codigo_saiu,

            id_usuario,

            id_oficina,

            fecha_generacion,

            numero_expediente,

            fecha_expediente,

            id_estado_saiu,

            fecha_vinculacion,

            observacion;

    `;


    const result =
        await pool.query(

            query,

            [

                id_saiu,

                numero_expediente

            ]

        );


    return result.rows[0];

};

// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findTicketById,

    findStateByName,

    findStateById,

    existsByTicket,

    create,

    findById,

    findByTicket,

    registerExpediente,

    updateObservation,

    findAll,

    findByCodigo,

    findByExpediente,

    findAdministrativeRequestBySAIU,

    findUserById,
    
    receiveSAIU,

    updateExpediente
};