const pool = require('../../database/database');



// =====================================
// Crear ticket
// =====================================

const create = async(data)=>{


    const {

        codigo_ticket,

        id_incidencia,

        id_estado,

        id_prioridad,

        fecha_limite

    } = data;



    const query = `

        INSERT INTO tickets
        (
            codigo_ticket,
            id_incidencia,
            id_estado,
            id_prioridad,
            fecha_limite
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

            id_ticket,
            codigo_ticket,
            id_incidencia,
            id_estado,
            id_prioridad,
            fecha_creacion,
            fecha_limite;

    `;



    const result =

        await pool.query(

            query,

            [

                codigo_ticket,

                id_incidencia,

                id_estado,

                id_prioridad,

                fecha_limite

            ]

        );



    return result.rows[0];


};




// =====================================
// Buscar ticket por ID
// =====================================

const findById = async(id_ticket)=>{


    const query = `

        SELECT

            t.id_ticket,

            t.codigo_ticket,

            t.fecha_creacion,

            t.fecha_limite,

            t.fecha_resolucion,

            t.fecha_cierre,

            t.observacion_cierre,

            t.modalidad_atencion,


            ce.id_estado,

            ce.nombre AS estado,


            p.id_prioridad,

            p.nombre AS prioridad,


            i.id_incidencia,

            i.id_ciudadano,

            i.codigo_incidencia,

            i.titulo,

            i.descripcion,

            i.direccion_texto,


            c.id_categoria,

            c.nombre AS categoria,


            o.id_oficina,

            o.nombre AS oficina



        FROM tickets t



        INNER JOIN catalogo_estados ce

        ON t.id_estado = ce.id_estado



        INNER JOIN prioridades p

        ON t.id_prioridad = p.id_prioridad



        INNER JOIN incidencias i

        ON t.id_incidencia = i.id_incidencia



        INNER JOIN categorias c

        ON i.id_categoria = c.id_categoria



        INNER JOIN oficinas o

        ON c.id_oficina_predeterminada = o.id_oficina



        WHERE t.id_ticket=$1;


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
// Buscar ticket por incidencia
// =====================================

const findByIncidencia = async(id_incidencia)=>{


    const query = `

        SELECT

            id_ticket,

            codigo_ticket,

            id_incidencia,

            modalidad_atencion


        FROM tickets


        WHERE id_incidencia=$1;


    `;



    const result =

        await pool.query(

            query,

            [

                id_incidencia

            ]

        );



    return result.rows[0];


};





// =====================================
// Listar tickets
// =====================================

const findAll = async()=>{


    const query = `

        SELECT


            t.id_ticket,

            t.codigo_ticket,

            t.modalidad_atencion,

            t.fecha_creacion,

            t.fecha_limite,


            ce.nombre AS estado,


            p.nombre AS prioridad,


            i.codigo_incidencia,

            i.titulo,


            c.nombre AS categoria,


            o.nombre AS oficina



        FROM tickets t



        INNER JOIN catalogo_estados ce

        ON t.id_estado = ce.id_estado



        INNER JOIN prioridades p

        ON t.id_prioridad = p.id_prioridad



        INNER JOIN incidencias i

        ON t.id_incidencia=i.id_incidencia



        INNER JOIN categorias c

        ON i.id_categoria=c.id_categoria



        INNER JOIN oficinas o

        ON c.id_oficina_predeterminada=o.id_oficina



        ORDER BY

        t.fecha_creacion DESC;


    `;



    const result =

        await pool.query(query);



    return result.rows;


};





// =====================================
// Ticket asignado
// =====================================

const assignTicket = async (

    id_ticket,

    id_estado

) => {

    return await updateTicketState(

        id_ticket,

        id_estado

    );

};

// =====================================
// Iniciar atención
// =====================================

const startAttention = async (

    id_ticket,

    id_estado

) => {

    return await updateTicketState(

        id_ticket,

        id_estado

    );

};
// =====================================
// Resolver ticket
// =====================================

const resolveTicket = async (

    id_ticket,

    id_estado

) => {

    const query = `

        UPDATE tickets

        SET

            id_estado = $1,

            fecha_resolucion = CURRENT_TIMESTAMP

        WHERE

            id_ticket = $2

        RETURNING *;

    `;

    const result = await pool.query(

        query,

        [

            id_estado,

            id_ticket

        ]

    );

    return result.rows[0];

};

// =====================================
// Obtener incidencia para generar ticket
// =====================================
const findIncidentForTicket = async (id_incidencia) => {
    const query = `
        SELECT
            i.id_incidencia,
            i.id_ciudadano,
            i.id_categoria,
            i.codigo_incidencia,
            i.id_estado,
            c.nombre AS categoria,
            c.id_oficina_predeterminada,
            c.id_prioridad_predeterminada
        FROM incidencias i
        INNER JOIN categorias c
            ON i.id_categoria = c.id_categoria
        WHERE i.id_incidencia = $1;
    `;

    const result = await pool.query(query, [id_incidencia]);

    return result.rows[0] || null;
};

// =====================================
// Cerrar ticket
// =====================================

// =====================================
// Cerrar ticket
// =====================================

const closeTicket = async (
    id_ticket,
    id_estado,
    observacion_cierre
) => {
    const query = `
        UPDATE tickets
        SET
            id_estado = $1,
            fecha_cierre = CURRENT_TIMESTAMP,
            observacion_cierre = $2
        WHERE id_ticket = $3
        RETURNING *;
    `;

    const result = await pool.query(query, [
        id_estado,
        observacion_cierre,
        id_ticket
    ]);

    return result.rows[0];
};

const updateTicketState = async (

    id_ticket,

    id_estado

) => {

    const query = `

        UPDATE tickets

        SET

            id_estado = $1

        WHERE

            id_ticket = $2

        RETURNING

            id_ticket,

            codigo_ticket,

            id_estado,

            fecha_creacion,

            fecha_limite;

    `;

    const result = await pool.query(

        query,

        [

            id_estado,

            id_ticket

        ]

    );

    return result.rows[0];

};

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

    const result = await pool.query(
        query,
        [
            tipo_estado,
            nombre
        ]
    );

    return result.rows[0];

};

// =====================================
// Buscar modalidad de atención
// =====================================

const findAttentionMode = async (
    id_ticket
) => {

    const query = `

        SELECT

            id_ticket,

            modalidad_atencion

        FROM tickets

        WHERE id_ticket = $1;

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
// Registrar modalidad de atención
// =====================================

const setAttentionMode = async (
    id_ticket,
    modalidad_atencion
) => {

    const query = `

        UPDATE tickets

        SET

            modalidad_atencion = $2

        WHERE

            id_ticket = $1

        AND

            modalidad_atencion IS NULL

        RETURNING

            id_ticket,

            codigo_ticket,

            id_incidencia,

            id_estado,

            id_prioridad,

            modalidad_atencion,

            fecha_creacion,

            fecha_limite,

            fecha_resolucion,

            fecha_cierre,

            observacion_cierre;

    `;

    const result =
        await pool.query(
            query,
            [

                id_ticket,

                modalidad_atencion

            ]

        );

    return result.rows[0];

};

module.exports = {

    create,

    findById,

    findByIncidencia,

    findAll,

    findIncidentForTicket,

    findStateByName,

    findAttentionMode,

    setAttentionMode,

    assignTicket,

    startAttention,

    resolveTicket,

    closeTicket

};