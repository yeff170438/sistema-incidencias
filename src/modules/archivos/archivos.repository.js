const pool =
    require('../../database/database');


// =====================================
// ARCHIVOS REPOSITORY
// =====================================


// =====================================
// Buscar tipo de archivo
// =====================================

const findTypeById = async (
    id_tipo_archivo
) => {

    const query = `

        SELECT

            id_tipo_archivo,

            nombre,

            descripcion

        FROM tipos_archivo

        WHERE id_tipo_archivo = $1;

    `;

    const result =
        await pool.query(
            query,
            [
                id_tipo_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Crear archivo
// =====================================

const create = async (data) => {

    const query = `

        INSERT INTO archivos
        (
            id_tipo_archivo,
            nombre_original,
            nombre_servidor,
            ruta,
            extension,
            mime_type,
            tamanio,
            hash
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

        RETURNING

            id_archivo,
            id_tipo_archivo,
            nombre_original,
            nombre_servidor,
            ruta,
            extension,
            mime_type,
            tamanio,
            hash,
            fecha_subida;

    `;

    const result =
        await pool.query(
            query,
            [

                data.id_tipo_archivo,

                data.nombre_original,

                data.nombre_servidor,

                data.ruta,

                data.extension,

                data.mime_type,

                data.tamanio,

                data.hash

            ]
        );

    return result.rows[0];

};


// =====================================
// Buscar archivo por ID
// =====================================

const findById = async (
    id_archivo
) => {

    const query = `

        SELECT

            a.id_archivo,

            a.id_tipo_archivo,

            ta.nombre AS tipo_archivo,

            ta.descripcion AS descripcion_tipo,

            a.nombre_original,

            a.nombre_servidor,

            a.ruta,

            a.extension,

            a.mime_type,

            a.tamanio,

            a.hash,

            a.fecha_subida

        FROM archivos a

        INNER JOIN tipos_archivo ta

            ON a.id_tipo_archivo =
               ta.id_tipo_archivo

        WHERE

            a.id_archivo = $1;

    `;

    const result =
        await pool.query(
            query,
            [
                id_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Buscar archivos de una incidencia
// =====================================

const findByIncident = async (
    id_incidencia
) => {

    const query = `

        SELECT

            a.id_archivo,

            a.id_tipo_archivo,

            ta.nombre AS tipo_archivo,

            a.nombre_original,

            a.nombre_servidor,

            a.ruta,

            a.extension,

            a.mime_type,

            a.tamanio,

            a.hash,

            a.fecha_subida

        FROM archivo_incidencia ai

        INNER JOIN archivos a

            ON ai.id_archivo =
               a.id_archivo

        INNER JOIN tipos_archivo ta

            ON a.id_tipo_archivo =
               ta.id_tipo_archivo

        WHERE

            ai.id_incidencia = $1

        ORDER BY

            a.fecha_subida ASC;

    `;

    const result =
        await pool.query(
            query,
            [
                id_incidencia
            ]
        );

    return result.rows;

};


// =====================================
// Buscar archivos de una atención
// =====================================

const findByAttention = async (
    id_atencion
) => {

    const query = `

        SELECT

            a.id_archivo,

            a.id_tipo_archivo,

            ta.nombre AS tipo_archivo,

            a.nombre_original,

            a.nombre_servidor,

            a.ruta,

            a.extension,

            a.mime_type,

            a.ruta,

            a.tamanio,

            a.hash,

            a.fecha_subida

        FROM archivo_atencion aa

        INNER JOIN archivos a

            ON aa.id_archivo =
               a.id_archivo

        INNER JOIN tipos_archivo ta

            ON a.id_tipo_archivo =
               ta.id_tipo_archivo

        WHERE

            aa.id_atencion = $1

        ORDER BY

            a.fecha_subida ASC;

    `;

    const result =
        await pool.query(
            query,
            [
                id_atencion
            ]
        );

    return result.rows;

};


// =====================================
// Relacionar archivo con incidencia
// =====================================

const createIncidentRelation = async (
    id_incidencia,
    id_archivo
) => {

    const query = `

        INSERT INTO archivo_incidencia
        (
            id_incidencia,
            id_archivo
        )

        VALUES
        (
            $1,
            $2
        )

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [
                id_incidencia,
                id_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Relacionar archivo con atención
// =====================================

const createAttentionRelation = async (
    id_atencion,
    id_archivo
) => {

    const query = `

        INSERT INTO archivo_atencion
        (
            id_atencion,
            id_archivo
        )

        VALUES
        (
            $1,
            $2
        )

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [
                id_atencion,
                id_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Eliminar relación con incidencia
// =====================================

const deleteIncidentRelation = async (
    id_incidencia,
    id_archivo
) => {

    const query = `

        DELETE FROM archivo_incidencia

        WHERE

            id_incidencia = $1

        AND

            id_archivo = $2

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [
                id_incidencia,
                id_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Eliminar relación con atención
// =====================================

const deleteAttentionRelation = async (
    id_atencion,
    id_archivo
) => {

    const query = `

        DELETE FROM archivo_atencion

        WHERE

            id_atencion = $1

        AND

            id_archivo = $2

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [
                id_atencion,
                id_archivo
            ]
        );

    return result.rows[0];

};


// =====================================
// Eliminar archivo
// =====================================

const deleteFile = async (
    id_archivo
) => {

    const query = `

        DELETE FROM archivos

        WHERE

            id_archivo = $1

        RETURNING *;

    `;

    const result =
        await pool.query(
            query,
            [
                id_archivo
            ]
        );

    return result.rows[0];

};

// =====================================
// Buscar incidencia por ID
// =====================================

// =====================================
// BUSCAR INCIDENCIA POR ID
// =====================================

const findIncidentById = async (
    id_incidencia
) => {

    const query = `

        SELECT

            i.id_incidencia,

            i.id_ciudadano,

            i.id_categoria,

            t.id_prioridad,

            i.id_estado,

            ce.tipo_estado,

            ce.nombre AS estado

        FROM incidencias i

        INNER JOIN tickets t
            ON t.id_incidencia =
               i.id_incidencia

        INNER JOIN catalogo_estados ce

            ON i.id_estado =
               ce.id_estado

        WHERE

            i.id_incidencia = $1;

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

    findTypeById,

    findIncidentById,

    create,

    findById,

    findByIncident,

    findByAttention,

    createIncidentRelation,

    createAttentionRelation,

    deleteIncidentRelation,

    deleteAttentionRelation,

    deleteFile

};