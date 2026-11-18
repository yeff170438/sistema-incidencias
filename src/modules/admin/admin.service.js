const repository = require('./admin.repository');

// =====================================================
// DASHBOARD ADMIN
// =====================================================

const getDashboard = async () => {

    const [
        resumen,
        atencion,
        seguimiento,
        oficinas,
        actividad,
        incidenciasPorCategoria,
        incidenciasPorEstado,
        ticketsPorPrioridad,
        ticketsPorModalidad,
        incidenciasPorSector,
        tendenciaMensual,
        territorio
    ] = await Promise.all([

        repository.getSummary(),

        repository.getAttentionMetrics(),

        repository.getFollowUpCases(),

        repository.getOfficePerformance(),

        repository.getRecentActivity(),

        repository.getIncidentsByCategory(),

        repository.getIncidentsByState(),

        repository.getTicketsByPriority(),

        repository.getTicketsByModality(),

        repository.getIncidentsBySector(),

        repository.getMonthlyTrend(),

        repository.getTerritorialData()

    ]);


    return {

        resumen: {

            ...resumen,

            atencionesFinalizadas:
                atencion?.atenciones_finalizadas ?? 0,

            tiempoPromedioAtencion:
                atencion?.tiempo_promedio_horas ?? 0

        },

        seguimiento,

        oficinas,

        actividad,

        analisis: {

            incidenciasPorCategoria,

            incidenciasPorEstado,

            ticketsPorPrioridad,

            ticketsPorModalidad,

            incidenciasPorSector,

            tendenciaMensual

        },

        territorio

    };

};


module.exports = {

    getDashboard

};