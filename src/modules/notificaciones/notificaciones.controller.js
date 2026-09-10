
const service =
    require('./notificaciones.service');



// =====================================
// BUSCAR POR ID
// =====================================

const findById = async (req, res) => {

    try {

        const notification =
            await service.findById(

                req.params.id_notificacion

            );


        return res.status(200).json({

            mensaje:
                'Notificación obtenida correctamente',

            notificacion:
                notification

        });

    } catch (error) {

        return res.status(404).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// LISTAR NOTIFICACIONES DEL CIUDADANO
// =====================================

const findByCitizen = async (req, res) => {

    try {

        const id_ciudadano =
            req.params.id_ciudadano;


        const notifications =
            await service.findByCitizen(

                id_ciudadano

            );


        return res.status(200).json({

            mensaje:
                'Notificaciones obtenidas correctamente',

            total:
                notifications.length,

            notificaciones:
                notifications

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// NO LEÍDAS
// =====================================

const findUnreadByCitizen = async (
    req,
    res
) => {

    try {

        const notifications =
            await service.findUnreadByCitizen(

                req.params.id_ciudadano

            );


        return res.status(200).json({

            mensaje:
                'Notificaciones no leídas obtenidas correctamente',

            total:
                notifications.length,

            notificaciones:
                notifications

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// CONTAR NO LEÍDAS
// =====================================

const countUnreadByCitizen = async (
    req,
    res
) => {

    try {

        const total =
            await service.countUnreadByCitizen(

                req.params.id_ciudadano

            );


        return res.status(200).json({

            total

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// NOTIFICACIONES DE INCIDENCIA
// =====================================

const findByIncident = async (
    req,
    res
) => {

    try {

        const notifications =
            await service.findByIncident(

                req.params.id_incidencia

            );


        return res.status(200).json({

            mensaje:
                'Notificaciones de la incidencia obtenidas correctamente',

            total:
                notifications.length,

            notificaciones:
                notifications

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// NOTIFICACIONES DE TICKET
// =====================================

const findByTicket = async (
    req,
    res
) => {

    try {

        const notifications =
            await service.findByTicket(

                req.params.id_ticket

            );


        return res.status(200).json({

            mensaje:
                'Notificaciones del ticket obtenidas correctamente',

            total:
                notifications.length,

            notificaciones:
                notifications

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// MARCAR COMO LEÍDA
// =====================================

const markAsRead = async (
    req,
    res
) => {

    try {

        const notification =
            await service.markAsRead(

                req.params.id_notificacion

            );


        return res.status(200).json({

            mensaje:
                'Notificación marcada como leída',

            notificacion:
                notification

        });

    } catch (error) {

        return res.status(404).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// MARCAR TODAS COMO LEÍDAS
// =====================================

const markAllAsReadByCitizen = async (
    req,
    res
) => {

    try {

        const notifications =
            await service.markAllAsReadByCitizen(

                req.params.id_ciudadano

            );


        return res.status(200).json({

            mensaje:
                'Notificaciones marcadas como leídas',

            total:
                notifications.length,

            notificaciones:
                notifications

        });

    } catch (error) {

        return res.status(500).json({

            mensaje:
                error.message

        });

    }

};



// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findById,

    findByCitizen,

    findUnreadByCitizen,

    countUnreadByCitizen,

    findByIncident,

    findByTicket,

    markAsRead,

    markAllAsReadByCitizen

};

