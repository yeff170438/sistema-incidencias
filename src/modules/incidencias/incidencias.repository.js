const pool = require('../../database/database');



// =====================================
// Crear incidencia
// =====================================

const create = async (data) => {

    const {

        codigo_incidencia,
        id_ciudadano,
        id_categoria,
        id_sector,
        titulo,
        descripcion,
        direccion_texto,
        referencia,
        longitud,
        latitud

    } = data;



    const query = `

        INSERT INTO incidencias
        (

            codigo_incidencia,
            id_ciudadano,
            id_categoria,
            id_sector,
            id_estado,
            titulo,
            descripcion,
            direccion_texto,
            referencia,
            ubicacion

        )

        VALUES

        (

            $1,
            $2,
            $3,
            $4,

            (
                SELECT id_estado
                FROM catalogo_estados
                WHERE tipo_estado='INCIDENCIA'
                AND nombre='Pendiente'
            ),

            $5,
            $6,
            $7,
            $8,

            ST_SetSRID(
                ST_MakePoint(
                    $9,
                    $10
                ),
                4326
            )

        )

        RETURNING

            id_incidencia,
            codigo_incidencia,
            id_ciudadano,
            id_categoria,
            id_sector,
            id_estado,
            titulo,
            descripcion,
            direccion_texto,
            referencia,
            fecha_reporte;

    `;



    const result =
        await pool.query(

            query,

            [

                codigo_incidencia,
                id_ciudadano,
                id_categoria,
                id_sector,
                titulo,
                descripcion,
                direccion_texto,
                referencia,
                longitud,
                latitud

            ]

        );



    return result.rows[0];

};



// =====================================
// Buscar incidencias del ciudadano
// =====================================

const findByCitizen = async (id_ciudadano) => {

    const query = `

        SELECT

            i.id_incidencia,
            i.codigo_incidencia,

            i.titulo,
            i.descripcion,

            i.direccion_texto,
            i.fecha_reporte,

            c.nombre AS categoria,

            e.nombre AS estado

        FROM incidencias i

        INNER JOIN categorias c
            ON i.id_categoria = c.id_categoria

        INNER JOIN catalogo_estados e
            ON i.id_estado = e.id_estado

        WHERE i.id_ciudadano = $1

        ORDER BY
            i.fecha_reporte DESC;

    `;



    const result =
        await pool.query(
            query,
            [id_ciudadano]
        );



    return result.rows;

};



// =====================================
// Buscar incidencia por ID
// =====================================

const findById = async (id) => {

    const query = `

        SELECT

            i.*,

            c.nombre AS categoria,

            c.id_oficina_predeterminada,

            e.nombre AS estado

        FROM incidencias i

        INNER JOIN categorias c
            ON i.id_categoria = c.id_categoria

        INNER JOIN catalogo_estados e
            ON i.id_estado = e.id_estado

        WHERE i.id_incidencia = $1;

    `;



    const result =
        await pool.query(
            query,
            [id]
        );



    return result.rows[0];

};



// =====================================
// Buscar categoría
// =====================================

const findCategoryById = async (id_categoria) => {

    const query = `

        SELECT

            id_categoria,

            nombre,

            id_oficina_predeterminada

        FROM categorias

        WHERE id_categoria = $1;

    `;



    const result =
        await pool.query(
            query,
            [id_categoria]
        );



    return result.rows[0];

};
// =====================================
// Validar sector
// =====================================

const findSectorById = async (id_sector) => {

    const query = `

        SELECT

            id_sector,
            nombre

        FROM sectores

        WHERE id_sector = $1;

    `;



    const result =
        await pool.query(
            query,
            [id_sector]
        );



    return result.rows[0];

};




// =====================================
// Listar incidencias pendientes
// =====================================

const findPending = async () => {

    const query = `

        SELECT

            i.id_incidencia,
            i.codigo_incidencia,

            i.titulo,
            i.descripcion,

            i.direccion_texto,
            i.fecha_reporte,

            c.nombre AS categoria,

            ci.nombres,
            ci.apellido_paterno,
            ci.apellido_materno,

            e.nombre AS estado

        FROM incidencias i

        INNER JOIN categorias c
            ON i.id_categoria = c.id_categoria

        INNER JOIN ciudadanos ci
            ON i.id_ciudadano = ci.id_ciudadano

        INNER JOIN catalogo_estados e
            ON i.id_estado = e.id_estado

        WHERE

            e.tipo_estado = 'INCIDENCIA'

            AND

            e.nombre = 'Pendiente'

        ORDER BY

            i.fecha_reporte ASC;

    `;



    const result =
        await pool.query(query);



    return result.rows;

};




// =====================================
// Cambiar estado
// =====================================

const updateStatus = async (
    id_incidencia,
    id_estado
) => {

    const query = `

        UPDATE incidencias

        SET

            id_estado = $1

        WHERE

            id_incidencia = $2

        RETURNING

            id_incidencia,
            codigo_incidencia,
            id_estado;

    `;



    const result =
        await pool.query(
            query,
            [
                id_estado,
                id_incidencia
            ]
        );



    return result.rows[0];

};


// =====================================
// Buscar estado por tipo y nombre
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
// Crear observación de incidencia
// =====================================

const createObservation = async(data)=>{


    const query = `

        INSERT INTO observaciones_incidencia
        (
            id_incidencia,
            id_usuario,
            id_motivo,
            comentario
        )

        VALUES

        (
            $1,
            $2,
            $3,
            $4
        )

        RETURNING *;

    `;



    const result =

        await pool.query(

            query,

            [

                data.id_incidencia,

                data.id_usuario,

                data.id_motivo,

                data.comentario

            ]

        );



    return result.rows[0];

};

// =====================================
// Crear seguimiento incidencia
// =====================================

    const createTracking = async(data)=>{


        const query = `

            INSERT INTO seguimiento_incidencia
            (

                id_incidencia,

                id_usuario,

                id_ciudadano,

                id_estado_anterior,

                id_estado_nuevo,

                origen,

                accion,

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

                    data.id_incidencia,

                    data.id_usuario,

                    data.id_ciudadano,

                    data.id_estado_anterior,

                    data.id_estado_nuevo,

                    data.origen,

                    data.accion,

                    data.comentario

                ]

            );



        return result.rows[0];

    };

    const updateCorrection = async(data)=>{


        const query = `

            UPDATE incidencias

            SET

                id_categoria=$1,

                id_sector=$2,

                titulo=$3,

                descripcion=$4,

                direccion_texto=$5,

                referencia=$6,

                ubicacion=
                ST_SetSRID(
                    ST_MakePoint($7,$8),
                    4326
                ),

                id_estado=$9


            WHERE

                id_incidencia=$10


            RETURNING *;

        `;


        const result = await pool.query(

            query,

            [

                data.id_categoria,

                data.id_sector,

                data.titulo,

                data.descripcion,

                data.direccion_texto,

                data.referencia,

                data.longitud,

                data.latitud,

                data.id_estado,

                data.id_incidencia

            ]

        );


        return result.rows[0];

    };

const findObservationByIncident = async(id_incidencia)=>{

    const query = `

        SELECT

            *

        FROM observaciones_incidencia

        WHERE id_incidencia=$1

        ORDER BY fecha DESC

        LIMIT 1;

    `;


    const result = await pool.query(

        query,

        [
            id_incidencia
        ]

    );


    return result.rows[0];

};

const findIncidentState = async(id_incidencia)=>{

    const query = `

        SELECT

            ce.id_estado,
            ce.nombre

        FROM incidencias i

        INNER JOIN catalogo_estados ce

        ON i.id_estado=ce.id_estado

        WHERE i.id_incidencia=$1;

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
// EXPORTAR
// =====================================

module.exports = {

    create,

    findByCitizen,

    findById,

    findCategoryById,

    findSectorById,

    findPending,

    updateStatus,

    findStateByName,

    createObservation,

    createTracking,

    updateCorrection,
    findObservationByIncident,
    findIncidentState

};