const pool = require('../../database/database');


// =====================================================
// RESUMEN GENERAL DEL SISTEMA
// =====================================================

const getSummary = async () => {

    const query = `
        SELECT

            -- =================================================
            -- INCIDENCIAS
            -- =================================================

            (
                SELECT COUNT(*)
                FROM incidencias
            ) AS incidencias,


            -- =================================================
            -- TICKETS
            -- =================================================

            (
                SELECT COUNT(*)
                FROM tickets
            ) AS tickets,


            (
                SELECT COUNT(*)
                FROM tickets
                WHERE fecha_cierre IS NULL
            ) AS tickets_abiertos,


            (
                SELECT COUNT(*)
                FROM tickets t
                INNER JOIN catalogo_estados ce
                    ON ce.id_estado = t.id_estado
                WHERE
                    t.fecha_cierre IS NULL
                    AND LOWER(ce.nombre)
                        IN (
                            'en atención',
                            'en atencion'
                        )
            ) AS tickets_en_atencion,


            (
                SELECT COUNT(*)
                FROM tickets
                WHERE
                    fecha_resolucion IS NOT NULL
            ) AS tickets_resueltos,


            (
                SELECT COUNT(*)
                FROM tickets
                WHERE
                    fecha_cierre IS NULL
                    AND fecha_limite IS NOT NULL
                    AND fecha_limite < CURRENT_TIMESTAMP
            ) AS casos_retrasados,


            (
                SELECT COUNT(*)
                FROM tickets t
                INNER JOIN prioridades p
                    ON p.id_prioridad = t.id_prioridad
                WHERE
                    t.fecha_cierre IS NULL
                    AND LOWER(p.nombre)
                        IN (
                            'crítica',
                            'critica'
                        )
            ) AS casos_criticos,


            -- =================================================
            -- USUARIOS
            -- =================================================

            (
                SELECT COUNT(*)
                FROM usuarios
                WHERE estado = TRUE
            ) AS usuarios_activos,


            (
                SELECT COUNT(*)
                FROM ciudadanos
            ) AS ciudadanos,


            (
                SELECT COUNT(*)
                FROM oficinas
                WHERE estado = TRUE
            ) AS oficinas_activas,


            -- =================================================
            -- SAIU
            -- =================================================

            (
                SELECT COUNT(*)
                FROM solicitudes_incidencia si
                INNER JOIN estados_saiu es
                    ON es.id_estado_saiu = si.id_estado_saiu
                WHERE
                    LOWER(es.nombre) IN (
                        'pendiente_expediente',
                        'expediente_registrado'
                    )
            ) AS saiu_pendientes

        ;
    `;


    const { rows } =
        await pool.query(query);


    return rows[0];

};


// =====================================================
// MÉTRICAS DE ATENCIÓN
// =====================================================

const getAttentionMetrics = async () => {

    const query = `
        SELECT

            COUNT(*) AS atenciones_finalizadas,

            ROUND(
                AVG(
                    EXTRACT(
                        EPOCH FROM (
                            fecha_fin -
                            fecha_inicio
                        )
                    ) / 3600.0
                )::numeric,
                2
            ) AS tiempo_promedio_horas

        FROM atenciones

        WHERE
            fecha_inicio IS NOT NULL
            AND fecha_fin IS NOT NULL;
    `;


    const { rows } =
        await pool.query(query);


    return rows[0];

};


// =====================================================
// CASOS QUE REQUIEREN SUPERVISIÓN
// =====================================================

const getFollowUpCases = async () => {

    const query = `
        SELECT

            i.id_incidencia,

            i.codigo_incidencia,

            i.titulo,

            i.descripcion,

            i.direccion_texto,

            i.fecha_reporte,


            c.nombre AS categoria,


            p.nombre AS prioridad,


            ce.nombre AS estado,


            t.id_ticket,

            t.codigo_ticket,

            t.fecha_creacion,

            t.fecha_limite,

            t.fecha_resolucion,

            t.modalidad_atencion,


            o.nombre AS oficina,


            COALESCE(
                derivaciones.total_derivaciones,
                0
            ) AS cantidad_derivaciones,


            CASE

                WHEN
                    t.fecha_cierre IS NULL
                    AND t.fecha_limite IS NOT NULL
                    AND t.fecha_limite < CURRENT_TIMESTAMP

                    THEN 'FUERA_DE_PLAZO'


                WHEN
                    t.fecha_cierre IS NULL
                    AND LOWER(
                        COALESCE(
                            p.nombre,
                            ''
                        )
                    ) IN (
                        'crítica',
                        'critica'
                    )

                    THEN 'PRIORIDAD_CRITICA'


                WHEN
                    ultima_asignacion.id_asignacion IS NULL

                    THEN 'SIN_ASIGNACION'


                WHEN
                    COALESCE(
                        derivaciones.total_derivaciones,
                        0
                    ) >= 2

                    THEN 'MULTIPLES_DERIVACIONES'


                ELSE 'REVISION'

            END AS motivo_supervision,


            ROUND(
                EXTRACT(
                    EPOCH FROM (
                        CURRENT_TIMESTAMP -
                        t.fecha_creacion
                    )
                ) / 3600.0,
                2
            ) AS horas_transcurridas


        FROM incidencias i


        INNER JOIN categorias c
            ON c.id_categoria =
               i.id_categoria


        INNER JOIN tickets t
            ON t.id_incidencia =
               i.id_incidencia


        LEFT JOIN prioridades p
            ON p.id_prioridad =
               t.id_prioridad


        LEFT JOIN catalogo_estados ce
            ON ce.id_estado =
               t.id_estado


        -- =================================================
        -- ÚLTIMA ASIGNACIÓN
        -- =================================================

        LEFT JOIN LATERAL (

            SELECT

                a.id_asignacion,

                a.id_oficina

            FROM asignaciones a

            WHERE
                a.id_ticket =
                t.id_ticket

            ORDER BY
                a.fecha_asignacion DESC

            LIMIT 1

        ) ultima_asignacion

            ON TRUE


        LEFT JOIN oficinas o
            ON o.id_oficina =
               ultima_asignacion.id_oficina


        -- =================================================
        -- TOTAL DE DERIVACIONES
        -- =================================================

        LEFT JOIN LATERAL (

            SELECT
                COUNT(*) AS total_derivaciones

            FROM derivaciones d

            WHERE
                d.id_ticket =
                t.id_ticket

        ) derivaciones

            ON TRUE


        WHERE

            t.fecha_cierre IS NULL

            AND (

                (
                    t.fecha_limite IS NOT NULL
                    AND t.fecha_limite < CURRENT_TIMESTAMP
                )

                OR

                LOWER(
                    COALESCE(
                        p.nombre,
                        ''
                    )
                ) IN (
                    'crítica',
                    'critica'
                )

                OR

                ultima_asignacion.id_asignacion IS NULL

                OR

                COALESCE(
                    derivaciones.total_derivaciones,
                    0
                ) >= 2

            )


        ORDER BY

            CASE

                WHEN
                    t.fecha_limite IS NOT NULL
                    AND t.fecha_limite < CURRENT_TIMESTAMP

                    THEN 1

                WHEN
                    LOWER(
                        COALESCE(
                            p.nombre,
                            ''
                        )
                    ) IN (
                        'crítica',
                        'critica'
                    )

                    THEN 2

                WHEN
                    ultima_asignacion.id_asignacion IS NULL

                    THEN 3

                WHEN
                    COALESCE(
                        derivaciones.total_derivaciones,
                        0
                    ) >= 2

                    THEN 4

                ELSE 5

            END,


            t.fecha_limite ASC NULLS LAST


        LIMIT 20;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// DESEMPEÑO POR OFICINA
// =====================================================

const getOfficePerformance = async () => {

    const query = `
        SELECT

            o.id_oficina,

            o.nombre,


            COUNT(
                DISTINCT a.id_ticket
            ) AS tickets,


            COUNT(
                DISTINCT CASE

                    WHEN
                        t.fecha_resolucion
                        IS NOT NULL

                    THEN
                        t.id_ticket

                END
            ) AS tickets_resueltos,


            COUNT(
                DISTINCT CASE

                    WHEN
                        t.fecha_cierre
                        IS NULL

                    THEN
                        t.id_ticket

                END
            ) AS tickets_abiertos,


            COUNT(
                DISTINCT CASE

                    WHEN
                        t.fecha_cierre IS NULL
                        AND t.fecha_limite IS NOT NULL
                        AND t.fecha_limite < CURRENT_TIMESTAMP

                    THEN
                        t.id_ticket

                END
            ) AS tickets_retrasados,


            ROUND(

                (
                    COUNT(
                        DISTINCT CASE

                            WHEN
                                t.fecha_resolucion
                                IS NOT NULL

                            THEN
                                t.id_ticket

                        END
                    )::numeric

                    /

                    NULLIF(
                        COUNT(
                            DISTINCT a.id_ticket
                        ),
                        0
                    )

                ) * 100,

                2

            ) AS porcentaje_resolucion


        FROM oficinas o


        LEFT JOIN asignaciones a
            ON a.id_oficina =
               o.id_oficina


        LEFT JOIN tickets t
            ON t.id_ticket =
               a.id_ticket


        WHERE
            o.estado = TRUE


        GROUP BY

            o.id_oficina,

            o.nombre


        ORDER BY

            tickets DESC,

            porcentaje_resolucion
                DESC NULLS LAST;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// ACTIVIDAD RECIENTE
// =====================================================

const getRecentActivity = async () => {

    const query = `
        SELECT *

        FROM (

            -- =============================================
            -- INCIDENCIAS
            -- =============================================

            SELECT

                'INCIDENCIA' AS tipo,

                i.id_incidencia::text
                    AS referencia,

                i.codigo_incidencia
                    AS codigo,

                'Nueva incidencia registrada'
                    AS descripcion,

                i.fecha_reporte
                    AS fecha

            FROM incidencias i


            UNION ALL


            -- =============================================
            -- TICKETS
            -- =============================================

            SELECT

                'TICKET' AS tipo,

                t.id_ticket::text
                    AS referencia,

                t.codigo_ticket
                    AS codigo,

                'Ticket registrado'
                    AS descripcion,

                t.fecha_creacion
                    AS fecha

            FROM tickets t


            UNION ALL


            -- =============================================
            -- ASIGNACIONES
            -- =============================================

            SELECT

                'ASIGNACION' AS tipo,

                a.id_asignacion::text
                    AS referencia,

                t.codigo_ticket
                    AS codigo,

                'Asignación registrada'
                    AS descripcion,

                a.fecha_asignacion
                    AS fecha

            FROM asignaciones a

            INNER JOIN tickets t
                ON t.id_ticket =
                   a.id_ticket


            UNION ALL


            -- =============================================
            -- ATENCIONES
            -- =============================================

            SELECT

                'ATENCION' AS tipo,

                at.id_atencion::text
                    AS referencia,

                t.codigo_ticket
                    AS codigo,

                'Atención iniciada'
                    AS descripcion,

                at.fecha_inicio
                    AS fecha

            FROM atenciones at

            INNER JOIN tickets t
                ON t.id_ticket =
                   at.id_ticket

            WHERE
                at.fecha_inicio IS NOT NULL


            UNION ALL


            -- =============================================
            -- DERIVACIONES
            -- =============================================

            SELECT

                'DERIVACION' AS tipo,

                d.id_derivacion::text
                    AS referencia,

                t.codigo_ticket
                    AS codigo,

                'Ticket derivado'
                    AS descripcion,

                d.fecha_derivacion
                    AS fecha

            FROM derivaciones d

            INNER JOIN tickets t
                ON t.id_ticket =
                   d.id_ticket


            UNION ALL


            -- =============================================
            -- SAIU
            -- =============================================

            SELECT

                'SAIU' AS tipo,

                si.id_saiu::text
                    AS referencia,

                si.codigo_saiu
                    AS codigo,

                'SAIU generado'
                    AS descripcion,

                si.fecha_generacion
                    AS fecha

            FROM solicitudes_incidencia si


            UNION ALL


            -- =============================================
            -- SEGUIMIENTO
            -- =============================================

            SELECT

                'SEGUIMIENTO' AS tipo,

                st.id_seguimiento::text
                    AS referencia,

                t.codigo_ticket
                    AS codigo,

                st.accion
                    AS descripcion,

                st.fecha
                    AS fecha

            FROM seguimiento_ticket st

            INNER JOIN tickets t
                ON t.id_ticket =
                   st.id_ticket


            UNION ALL


            -- =============================================
            -- NOTIFICACIONES
            -- =============================================

            SELECT

                'NOTIFICACION' AS tipo,

                n.id_notificacion::text
                    AS referencia,

                COALESCE(
                    t.codigo_ticket,
                    i.codigo_incidencia,
                    ''
                ) AS codigo,

                'Notificación generada'
                    AS descripcion,

                n.fecha
                    AS fecha

            FROM notificaciones n

            LEFT JOIN tickets t
                ON t.id_ticket =
                   n.id_ticket

            LEFT JOIN incidencias i
                ON i.id_incidencia =
                   n.id_incidencia

        ) actividad


        WHERE
            fecha IS NOT NULL


        ORDER BY
            fecha DESC


        LIMIT 15;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// INCIDENCIAS POR CATEGORÍA
// =====================================================

const getIncidentsByCategory = async () => {

    const query = `
        SELECT

            c.id_categoria,

            c.nombre,

            COUNT(
                i.id_incidencia
            ) AS cantidad

        FROM categorias c

        LEFT JOIN incidencias i
            ON i.id_categoria =
               c.id_categoria

        GROUP BY

            c.id_categoria,

            c.nombre

        ORDER BY

            cantidad DESC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// INCIDENCIAS POR ESTADO
// =====================================================

const getIncidentsByState = async () => {

    const query = `
        SELECT

            ce.id_estado,

            ce.tipo_estado,

            ce.nombre,

            COUNT(
                i.id_incidencia
            ) AS cantidad

        FROM catalogo_estados ce

        LEFT JOIN incidencias i
            ON i.id_estado =
               ce.id_estado

        GROUP BY

            ce.id_estado,

            ce.tipo_estado,

            ce.nombre

        ORDER BY

            cantidad DESC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// TICKETS POR PRIORIDAD
// =====================================================

const getTicketsByPriority = async () => {

    const query = `
        SELECT

            p.id_prioridad,

            p.nombre,

            p.tiempo_maximo_horas,

            COUNT(
                t.id_ticket
            ) AS cantidad

        FROM prioridades p

        LEFT JOIN tickets t
            ON t.id_prioridad =
               p.id_prioridad

        GROUP BY

            p.id_prioridad,

            p.nombre,

            p.tiempo_maximo_horas

        ORDER BY

            cantidad DESC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// TICKETS POR MODALIDAD
// =====================================================

const getTicketsByModality = async () => {

    const query = `
        SELECT

            COALESCE(
                modalidad_atencion,
                'SIN_DEFINIR'
            ) AS modalidad,

            COUNT(*) AS cantidad

        FROM tickets

        GROUP BY
            modalidad_atencion

        ORDER BY
            cantidad DESC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// INCIDENCIAS POR SECTOR
// =====================================================

const getIncidentsBySector = async () => {

    const query = `
        SELECT

            s.id_sector,

            s.nombre,

            COUNT(
                i.id_incidencia
            ) AS cantidad

        FROM sectores s

        LEFT JOIN incidencias i
            ON i.id_sector =
               s.id_sector

        GROUP BY

            s.id_sector,

            s.nombre

        ORDER BY

            cantidad DESC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// TENDENCIA MENSUAL
// =====================================================

const getMonthlyTrend = async () => {

    const query = `
        SELECT

            DATE_TRUNC(
                'month',
                fecha_reporte
            ) AS mes,

            COUNT(*) AS cantidad

        FROM incidencias

        WHERE

            fecha_reporte >=
            DATE_TRUNC(
                'month',
                CURRENT_DATE -
                INTERVAL '11 months'
            )

        GROUP BY

            DATE_TRUNC(
                'month',
                fecha_reporte
            )

        ORDER BY

            mes ASC;
    `;


    const { rows } =
        await pool.query(query);


    return rows;

};


// =====================================================
// DATOS TERRITORIALES COMPLETOS
//
// Devuelve:
//   - límite del distrito de Santiago
//   - sectores catastrales reales
//   - incidencias georreferenciadas
// =====================================================

const getTerritorialData = async () => {

    // =================================================
    // DISTRITO
    // =================================================

    const distritoQuery = `
        SELECT
            d.id_distrito,
            d.ubigeo,
            d.nombre,
            d.descripcion,
            ST_AsGeoJSON(d.geometria)::json AS geometria
        FROM distrito_referencia d
        WHERE
            d.activo = TRUE
            AND d.ubigeo = '080106'
        LIMIT 1;
    `;


    // =================================================
    // SECTORES CATASTRALES
    // =================================================
const sectoresQuery = `
    SELECT
        s.id_sector,
        s.nombre,
        s.descripcion,
        ST_AsGeoJSON(s.geometria)::json AS geometria
    FROM sectores s
    INNER JOIN distrito_referencia d
        ON ST_Intersects(
            s.geometria,
            d.geometria
        )
    WHERE
        d.activo = TRUE
        AND d.ubigeo = '080106'
        AND s.geometria IS NOT NULL
    ORDER BY s.id_sector ASC;
`;


    // =================================================
    // INCIDENCIAS GEOREFERENCIADAS
    // =================================================

    const puntosQuery = `
    SELECT

        i.id_incidencia,

        i.codigo_incidencia,

        i.titulo,

        i.descripcion,

        i.direccion_texto,

        i.fecha_reporte,

        i.id_sector,

        COALESCE(
            sector_espacial.id_sector,
            i.id_sector
        ) AS id_sector_real,

        COALESCE(
            sector_espacial.nombre,
            sector_actual.nombre
        ) AS sector,

        c.nombre AS categoria,

        ticket_actual.id_ticket,

        ticket_actual.codigo_ticket,

        pr.nombre AS prioridad,

        ce.nombre AS estado,

        o.nombre AS oficina,

        ST_Y(i.ubicacion) AS latitud,

        ST_X(i.ubicacion) AS longitud

    FROM incidencias i

    INNER JOIN distrito_referencia d
        ON ST_Covers(
            d.geometria,
            i.ubicacion
        )

    LEFT JOIN categorias c
        ON c.id_categoria = i.id_categoria

    LEFT JOIN sectores sector_actual
        ON sector_actual.id_sector = i.id_sector

    LEFT JOIN LATERAL (

        SELECT
            s.id_sector,
            s.nombre

        FROM sectores s

        WHERE ST_Covers(
            s.geometria,
            i.ubicacion
        )

        ORDER BY s.id_sector

        LIMIT 1

    ) sector_espacial
        ON TRUE

    LEFT JOIN LATERAL (

        SELECT
            t.id_ticket,
            t.codigo_ticket,
            t.id_prioridad

        FROM tickets t

        WHERE t.id_incidencia = i.id_incidencia

        ORDER BY
            t.fecha_creacion DESC,
            t.id_ticket DESC

        LIMIT 1

    ) ticket_actual
        ON TRUE

    LEFT JOIN prioridades pr
        ON pr.id_prioridad =
           ticket_actual.id_prioridad

    LEFT JOIN catalogo_estados ce
        ON ce.id_estado = i.id_estado

    LEFT JOIN LATERAL (

        SELECT
            a.id_oficina

        FROM asignaciones a

        WHERE a.id_ticket =
              ticket_actual.id_ticket

        ORDER BY
            a.fecha_asignacion DESC,
            a.id_asignacion DESC

        LIMIT 1

    ) ultima_asignacion
        ON TRUE

    LEFT JOIN oficinas o
        ON o.id_oficina =
           ultima_asignacion.id_oficina

    WHERE

        d.activo = TRUE

        AND d.ubigeo = '080106'

        AND i.ubicacion IS NOT NULL

    ORDER BY

        i.fecha_reporte DESC,
        i.id_incidencia DESC

    LIMIT 500;
`;


    // =================================================
    // EJECUCIÓN EN PARALELO
    // =================================================

    const [
        distritoResult,
        sectoresResult,
        puntosResult
    ] = await Promise.all([

        pool.query(
            distritoQuery
        ),

        pool.query(
            sectoresQuery
        ),

        pool.query(
            puntosQuery
        )

    ]);


    // =================================================
    // RESPUESTA
    // =================================================

    return {

        distrito:
            distritoResult.rows[0] ?? null,

        sectores:
            sectoresResult.rows,

        puntos:
            puntosResult.rows

    };

};


// =====================================================
// PUNTOS TERRITORIALES
//
// Compatibilidad con código anterior.
// El dashboard nuevo debe usar getTerritorialData().
// =====================================================

const getTerritorialPoints = async () => {

    const query = `
    SELECT

        i.id_incidencia,

        i.codigo_incidencia,

        i.titulo,

        i.descripcion,

        i.direccion_texto,

        i.id_sector,

        COALESCE(
            sector_espacial.id_sector,
            i.id_sector
        ) AS id_sector_real,

        COALESCE(
            sector_espacial.nombre,
            s.nombre
        ) AS sector,

        c.nombre AS categoria,

        t.id_ticket,

        t.codigo_ticket,

        p.nombre AS prioridad,

        ce.nombre AS estado,

        o.nombre AS oficina,

        ST_Y(i.ubicacion) AS latitud,

        ST_X(i.ubicacion) AS longitud,

        i.fecha_reporte

    FROM incidencias i

    INNER JOIN distrito_referencia d
        ON ST_Covers(
            d.geometria,
            i.ubicacion
        )

    LEFT JOIN sectores s
        ON s.id_sector = i.id_sector

    LEFT JOIN LATERAL (

        SELECT
            sx.id_sector,
            sx.nombre

        FROM sectores sx

        WHERE ST_Covers(
            sx.geometria,
            i.ubicacion
        )

        ORDER BY sx.id_sector

        LIMIT 1

    ) sector_espacial
        ON TRUE

    LEFT JOIN categorias c
        ON c.id_categoria = i.id_categoria

    LEFT JOIN LATERAL (

        SELECT
            tx.id_ticket,
            tx.codigo_ticket,
            tx.id_prioridad

        FROM tickets tx

        WHERE tx.id_incidencia =
              i.id_incidencia

        ORDER BY
            tx.fecha_creacion DESC,
            tx.id_ticket DESC

        LIMIT 1

    ) t
        ON TRUE

    LEFT JOIN prioridades p
        ON p.id_prioridad = t.id_prioridad

    LEFT JOIN catalogo_estados ce
        ON ce.id_estado = i.id_estado

    LEFT JOIN LATERAL (

        SELECT
            a.id_oficina

        FROM asignaciones a

        WHERE a.id_ticket = t.id_ticket

        ORDER BY
            a.fecha_asignacion DESC,
            a.id_asignacion DESC

        LIMIT 1

    ) ultima_asignacion
        ON TRUE

    LEFT JOIN oficinas o
        ON o.id_oficina =
           ultima_asignacion.id_oficina

    WHERE

        d.activo = TRUE

        AND d.ubigeo = '080106'

        AND i.ubicacion IS NOT NULL

    ORDER BY

        i.fecha_reporte DESC,
        i.id_incidencia DESC

    LIMIT 500;
`;


    const { rows } =
        await pool.query(query);


    return rows;

};







// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {

    getSummary,

    getAttentionMetrics,

    getFollowUpCases,

    getOfficePerformance,

    getRecentActivity,

    getIncidentsByCategory,

    getIncidentsByState,

    getTicketsByPriority,

    getTicketsByModality,

    getIncidentsBySector,

    getMonthlyTrend,

    getTerritorialData,

    getTerritorialPoints,

};