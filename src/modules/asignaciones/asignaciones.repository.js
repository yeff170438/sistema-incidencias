const pool = require('../../database/database');




// =====================================
// Crear asignación
// =====================================

const create = async(

    data,

    client = pool

)=>{


    const {

        id_ticket,
        id_oficina,
        id_usuario,
        id_estado

    } = data;



    const query = `

        INSERT INTO asignaciones
        (
            id_ticket,
            id_oficina,
            id_usuario,
            id_estado
        )

        VALUES

        (
            $1,
            $2,
            $3,
            $4
        )

        RETURNING

            id_asignacion,
            id_ticket,
            id_oficina,
            id_usuario,
            usuario_receptor,
            id_estado,
            fecha_asignacion,
            fecha_recepcion,
            fecha_fin,
            observacion;

    `;



    const result = await client.query(

        query,

        [

            id_ticket,
            id_oficina,
            id_usuario,
            id_estado

        ]

    );



    return result.rows[0];

};




// =====================================
// Buscar asignación por ID
// =====================================

const findById = async (id_asignacion) => {

    const query = `

        SELECT

            -- =====================================
            -- DATOS DE LA ASIGNACIÓN
            -- =====================================

            a.id_asignacion,

            a.id_ticket,

            a.id_oficina,

            a.id_usuario,

            a.usuario_receptor,

            a.fecha_asignacion,

            a.fecha_recepcion,

            a.fecha_fin,

            a.observacion,


            -- =====================================
            -- DATOS DEL TICKET
            -- =====================================

            t.codigo_ticket,


            -- =====================================
            -- DATOS DE LA INCIDENCIA
            -- =====================================

            i.id_incidencia,

            i.codigo_incidencia,

            i.id_ciudadano,


            -- =====================================
            -- DATOS DE LA OFICINA
            -- =====================================

            o.nombre AS oficina,


            -- =====================================
            -- ESTADO DE LA ASIGNACIÓN
            -- =====================================

            ce.id_estado AS id_estado_asignacion,

            ce.nombre AS estado,


            -- =====================================
            -- ESTADO ACTUAL DEL TICKET
            -- =====================================

            cet.id_estado AS id_estado_ticket,

            cet.nombre AS estado_ticket,


            -- =====================================
            -- USUARIO RESPONSABLE
            -- =====================================

            u.nombre AS responsable,


            -- =====================================
            -- USUARIO QUE RECIBE
            -- =====================================

            ur.nombre AS receptor


        FROM asignaciones a


        -- =====================================
        -- TICKET
        -- =====================================

        INNER JOIN tickets t

            ON a.id_ticket = t.id_ticket


        -- =====================================
        -- INCIDENCIA
        -- =====================================

        INNER JOIN incidencias i

            ON t.id_incidencia = i.id_incidencia


        -- =====================================
        -- OFICINA
        -- =====================================

        INNER JOIN oficinas o

            ON a.id_oficina = o.id_oficina


        -- =====================================
        -- ESTADO DE LA ASIGNACIÓN
        -- =====================================

        INNER JOIN catalogo_estados ce

            ON a.id_estado = ce.id_estado


        -- =====================================
        -- ESTADO DEL TICKET
        -- =====================================

        INNER JOIN catalogo_estados cet

            ON t.id_estado = cet.id_estado


        -- =====================================
        -- RESPONSABLE
        -- =====================================

        LEFT JOIN usuarios u

            ON a.id_usuario = u.id_usuario


        -- =====================================
        -- RECEPTOR
        -- =====================================

        LEFT JOIN usuarios ur

            ON a.usuario_receptor = ur.id_usuario


        -- =====================================
        -- FILTRO
        -- =====================================

        WHERE

            a.id_asignacion = $1;

    `;


    const result = await pool.query(

        query,

        [
            id_asignacion
        ]

    );


    return result.rows[0];

};



// =====================================
// Buscar asignación por ticket
// =====================================

const findByTicket = async(id_ticket)=>{


    const query = `

        SELECT

            a.*,

            ce.nombre AS estado


        FROM asignaciones a


        INNER JOIN catalogo_estados ce

        ON a.id_estado=ce.id_estado


        WHERE a.id_ticket=$1;


    `;



    const result = await pool.query(

        query,

        [

            id_ticket

        ]

    );



    return result.rows;

};




// =====================================
// Buscar asignación activa del ticket
// =====================================

const findActiveByTicket = async(id_ticket)=>{


    const query = `

        SELECT

            a.id_asignacion,

            a.id_ticket,

            ce.nombre AS estado


        FROM asignaciones a


        INNER JOIN catalogo_estados ce

        ON a.id_estado=ce.id_estado


        WHERE

            a.id_ticket=$1


        AND

            ce.nombre NOT IN

            (

                'Finalizada',

                'Rechazada'

            );


    `;



    const result = await pool.query(

        query,

        [

            id_ticket

        ]

    );



    return result.rows[0];

};




// =====================================
// Listar asignaciones por oficina
// =====================================

const findByOffice = async(id_oficina)=>{


    const query = `

        SELECT

            a.id_asignacion,

            a.fecha_asignacion,


            t.codigo_ticket,


            i.codigo_incidencia,


            i.titulo,


            c.nombre AS categoria,


            ce.nombre AS estado


        FROM asignaciones a


        INNER JOIN tickets t

        ON a.id_ticket=t.id_ticket


        INNER JOIN incidencias i

        ON t.id_incidencia=i.id_incidencia


        INNER JOIN categorias c

        ON i.id_categoria=c.id_categoria


        INNER JOIN catalogo_estados ce

        ON a.id_estado=ce.id_estado


        WHERE

            a.id_oficina=$1


        ORDER BY

            a.fecha_asignacion DESC;


    `;



    const result = await pool.query(

        query,

        [

            id_oficina

        ]

    );



    return result.rows;

};




// =====================================
// Buscar estado
// =====================================

const findStateByName = async(

    tipo_estado,

    nombre

)=>{


    const query = `

        SELECT

            id_estado,

            nombre


        FROM catalogo_estados


        WHERE

            tipo_estado=$1


        AND

            nombre=$2;


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
// Actualizar estado asignación
// =====================================

const updateStatus = async(

    id_asignacion,

    id_estado

)=>{


    const query = `

        UPDATE asignaciones

        SET

            id_estado=$1


        WHERE

            id_asignacion=$2


        RETURNING *;


    `;



    const result = await pool.query(

        query,

        [

            id_estado,

            id_asignacion

        ]

    );



    return result.rows[0];

};




// =====================================
// Recibir asignación
// =====================================

const receiveAssignment = async(

    id_asignacion,

    usuario_receptor,

    id_estado

)=>{


    const query = `

        UPDATE asignaciones

        SET

            usuario_receptor=$1,

            fecha_recepcion=CURRENT_TIMESTAMP,

            id_estado=$2


        WHERE

            id_asignacion=$3


        RETURNING *;


    `;



    const result = await pool.query(

        query,

        [

            usuario_receptor,

            id_estado,

            id_asignacion

        ]

    );



    return result.rows[0];

};




// =====================================
// Iniciar proceso
// =====================================

const startProcess = async(

    id_asignacion,

    id_estado

)=>{


    const query = `

        UPDATE asignaciones

        SET

            id_estado=$1


        WHERE

            id_asignacion=$2


        RETURNING *;


    `;



    const result = await pool.query(

        query,

        [

            id_estado,

            id_asignacion

        ]

    );



    return result.rows[0];

};




// =====================================
// Finalizar asignación
// =====================================

const finishAssignment = async(

    id_asignacion,

    id_estado,

    observacion

)=>{


    const query = `

        UPDATE asignaciones

        SET

            id_estado=$1,

            fecha_fin=CURRENT_TIMESTAMP,

            observacion=$2


        WHERE

            id_asignacion=$3


        RETURNING *;


    `;



    const result = await pool.query(

        query,

        [

            id_estado,

            observacion,

            id_asignacion

        ]

    );



    return result.rows[0];

};




// =====================================
// Rechazar asignación
// =====================================

const rejectAssignment = async(

    id_asignacion,

    id_estado,

    observacion

)=>{


    const query = `

        UPDATE asignaciones

        SET

            id_estado=$1,

            observacion=$2


        WHERE

            id_asignacion=$3


        RETURNING *;


    `;



    const result = await pool.query(

        query,

        [

            id_estado,

            observacion,

            id_asignacion

        ]

    );



    return result.rows[0];

};




// =====================================
// Obtener ticket para asignación
// =====================================

const findTicketForAssignment = async (id_ticket) => {

    const query = `

        SELECT

            t.id_ticket,

            t.codigo_ticket,

            t.id_estado AS id_estado_ticket,

            ce.nombre AS estado_ticket,

            t.modalidad_atencion,

            i.id_incidencia,

            i.id_ciudadano,

            i.codigo_incidencia,

            i.titulo,

            c.id_categoria,

            c.nombre AS categoria,

            c.id_oficina_predeterminada,

            o.nombre AS oficina

        FROM tickets t

        INNER JOIN catalogo_estados ce
            ON t.id_estado = ce.id_estado

        INNER JOIN incidencias i
            ON t.id_incidencia = i.id_incidencia

        INNER JOIN categorias c
            ON i.id_categoria = c.id_categoria

        INNER JOIN oficinas o
            ON c.id_oficina_predeterminada = o.id_oficina

        WHERE t.id_ticket = $1;

    `;

    const result =
        await pool.query(
            query,
            [id_ticket]
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
// Buscar asignación creada por ticket
// =====================================

const findLatestByTicket = async(id_ticket)=>{


    const query = `

        SELECT

            a.id_asignacion,

            a.id_ticket,

            a.id_oficina,

            a.id_usuario,

            a.usuario_receptor,

            a.fecha_asignacion,

            a.fecha_recepcion,

            a.fecha_fin,

            a.observacion,


            o.nombre AS oficina,


            ce.nombre AS estado


        FROM asignaciones a


        INNER JOIN oficinas o

        ON a.id_oficina=o.id_oficina


        INNER JOIN catalogo_estados ce

        ON a.id_estado=ce.id_estado


        WHERE a.id_ticket=$1


        ORDER BY

            a.fecha_asignacion DESC


        LIMIT 1;

    `;



    const result = await pool.query(

        query,

        [

            id_ticket

        ]

    );


    return result.rows[0];

};


const finishByDerivation = async(

    id_asignacion,
    observacion

)=>{


    const query = `

        UPDATE asignaciones

        SET

            id_estado = (

                SELECT id_estado

                FROM catalogo_estados

                WHERE tipo_estado='ASIGNACION'

                AND nombre='Finalizada'

            ),


            fecha_fin = CURRENT_TIMESTAMP,


            observacion = $2


        WHERE

            id_asignacion=$1


        RETURNING *;

    `;


    const result =

        await pool.query(

            query,

            [
                id_asignacion,
                observacion
            ]

        );


    return result.rows[0];

};

// =====================================
// Buscar asignaciones pendientes por oficina
// =====================================

const findPendingByOffice = async(id_oficina)=>{


    const query = `

        SELECT

            a.id_asignacion,

            a.id_ticket,

            a.id_oficina,

            a.fecha_asignacion,


            t.codigo_ticket,


            i.codigo_incidencia,

            i.titulo,

            i.descripcion,


            ce.id_estado,

            ce.nombre AS estado


        FROM asignaciones a


        INNER JOIN tickets t

            ON a.id_ticket = t.id_ticket


        INNER JOIN incidencias i

            ON t.id_incidencia = i.id_incidencia


        INNER JOIN catalogo_estados ce

            ON a.id_estado = ce.id_estado


        WHERE

            a.id_oficina = $1


        AND

            ce.tipo_estado = 'ASIGNACION'


        AND

            ce.nombre = 'Pendiente de recepción'


        ORDER BY

            a.fecha_asignacion ASC;


    `;


    const result = await pool.query(

        query,

        [
            id_oficina
        ]

    );


    return result.rows;

};

module.exports = {

    create,

    findById,

    findByTicket,

    findActiveByTicket,

    findByOffice,

    findStateByName,

    updateStatus,

    receiveAssignment,

    startProcess,

    finishAssignment,

    finishByDerivation,

    rejectAssignment,

    findTicketForAssignment,

    updateTicketStatus,

    findLatestByTicket,

    findPendingByOffice

};