const pool =
    require('../../database/database');



// =====================================
// CREAR REGISTRO DE AUDITORÍA
// =====================================

const create = async (
    data
) => {

    const query = `

        INSERT INTO auditoria
        (

            id_usuario,

            id_ciudadano,

            accion,

            tabla_afectada,

            registro_afectado,

            valores_modificados,

            fecha

        )

        VALUES

        (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            CURRENT_TIMESTAMP

        )

        RETURNING

            id_auditoria,

            id_usuario,

            id_ciudadano,

            accion,

            tabla_afectada,

            registro_afectado,

            valores_modificados,

            fecha;

    `;


    const result =
        await pool.query(

            query,

            [

                data.id_usuario || null,

                data.id_ciudadano || null,

                data.accion,

                data.tabla_afectada,

                data.registro_afectado,

                data.valores_modificados || null

            ]

        );


    return result.rows[0];

};



// =====================================
// BUSCAR AUDITORÍA POR ID
// =====================================

const findById = async (
    id_auditoria
) => {

    const query = `

        SELECT

            a.id_auditoria,

            a.id_usuario,

            u.nombre AS usuario,

            a.id_ciudadano,

            a.accion,

            a.tabla_afectada,

            a.registro_afectado,

            a.valores_modificados,

            a.fecha

        FROM auditoria a

        LEFT JOIN usuarios u

            ON a.id_usuario =
               u.id_usuario

        WHERE

            a.id_auditoria = $1;

    `;


    const result =
        await pool.query(

            query,

            [

                id_auditoria

            ]

        );


    return result.rows[0];

};



// =====================================
// BUSCAR AUDITORÍA DE UN REGISTRO
// =====================================

const findByRecord = async (

    tabla_afectada,

    registro_afectado

) => {

    const query = `

        SELECT

            a.id_auditoria,

            a.id_usuario,

            u.nombre AS usuario,

            a.id_ciudadano,

            a.accion,

            a.tabla_afectada,

            a.registro_afectado,

            a.valores_modificados,

            a.fecha

        FROM auditoria a

        LEFT JOIN usuarios u

            ON a.id_usuario =
               u.id_usuario

        WHERE

            a.tabla_afectada = $1

        AND

            a.registro_afectado = $2

        ORDER BY

            a.fecha ASC;

    `;


    const result =
        await pool.query(

            query,

            [

                tabla_afectada,

                registro_afectado

            ]

        );


    return result.rows;

};



// =====================================
// LISTAR TODAS LAS AUDITORÍAS
// =====================================

const findAll = async () => {

    const query = `

        SELECT

            a.id_auditoria,

            a.id_usuario,

            u.nombre AS usuario,

            a.id_ciudadano,

            a.accion,

            a.tabla_afectada,

            a.registro_afectado,

            a.valores_modificados,

            a.fecha

        FROM auditoria a

        LEFT JOIN usuarios u

            ON a.id_usuario =
               u.id_usuario

        ORDER BY

            a.fecha DESC;

    `;


    const result =
        await pool.query(query);


    return result.rows;

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    create,

    findById,

    findByRecord,

    findAll

};