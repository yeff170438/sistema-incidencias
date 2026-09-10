const service =
    require('./encuestas.service');


// =====================================
// CREAR ENCUESTA
// =====================================

const createSurvey = async (req, res) => {

    try {

        const {
            id_ticket
        } = req.params;


        const encuesta =
            await service.createSurvey(
                Number(id_ticket)
            );


        return res.status(201).json({

            message:
                'Encuesta creada correctamente',

            encuesta

        });

    } catch (error) {

        console.error(
            'Error al crear encuesta:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// OBTENER ENCUESTA POR ID
// =====================================

const findById = async (req, res) => {

    try {

        const {
            id_encuesta
        } = req.params;


        const encuesta =
            await service.findById(
                Number(id_encuesta)
            );


        return res.status(200).json({

            encuesta

        });

    } catch (error) {

        console.error(
            'Error al obtener encuesta:',
            error
        );

        return res.status(404).json({

            message:
                error.message

        });

    }

};


// =====================================
// OBTENER ENCUESTA COMPLETA
// =====================================

const findCompleteById = async (
    req,
    res
) => {

    try {

        const {
            id_encuesta
        } = req.params;


        const encuesta =
            await service.findCompleteById(
                Number(id_encuesta)
            );


        return res.status(200).json({

            encuesta

        });

    } catch (error) {

        console.error(
            'Error al obtener encuesta completa:',
            error
        );

        return res.status(404).json({

            message:
                error.message

        });

    }

};


// =====================================
// ENCUESTAS DEL CIUDADANO
// =====================================

const findByCitizen = async (
    req,
    res
) => {

    try {

        const {
            id_ciudadano
        } = req.params;


        const encuestas =
            await service.findByCitizen(
                Number(id_ciudadano)
            );


        return res.status(200).json({

            encuestas

        });

    } catch (error) {

        console.error(
            'Error al obtener encuestas:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// ENCUESTAS PENDIENTES DEL CIUDADANO
// =====================================

const findPendingByCitizen = async (
    req,
    res
) => {

    try {

        const {
            id_ciudadano
        } = req.params;


        const encuestas =
            await service.findPendingByCitizen(
                Number(id_ciudadano)
            );


        return res.status(200).json({

            encuestas

        });

    } catch (error) {

        console.error(
            'Error al obtener encuestas pendientes:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// OBTENER PREGUNTAS
// =====================================

const findQuestions = async (
    req,
    res
) => {

    try {

        const preguntas =
            await service.findQuestions();


        return res.status(200).json({

            preguntas

        });

    } catch (error) {

        console.error(
            'Error al obtener preguntas:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// RESPONDER ENCUESTA
// =====================================

const answerSurvey = async (
    req,
    res
) => {

    try {

        const {

            id_encuesta,

            respuestas

        } = req.body;


        /*
         * El ciudadano NO debería enviar
         * libremente su id_ciudadano.
         *
         * Lo obtenemos del usuario autenticado.
         *
         * Ejemplo:
         * req.user.id_ciudadano
         */

        const id_ciudadano =
            req.user.id_ciudadano;


        if (!id_ciudadano) {

            return res.status(403).json({

                message:
                    'El usuario autenticado no está asociado a un ciudadano'

            });

        }


        const resultado =
            await service.answerSurvey({

                id_encuesta:
                    Number(id_encuesta),

                id_ciudadano,

                respuestas

            });


        return res.status(200).json({

            message:
                'Encuesta respondida correctamente',

            ...resultado

        });

    } catch (error) {

        console.error(
            'Error al responder encuesta:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// EXPIRAR ENCUESTA
// =====================================

const expireSurvey = async (
    req,
    res
) => {

    try {

        const {
            id_encuesta
        } = req.params;


        const resultado =
            await service.expireSurvey(
                Number(id_encuesta)
            );


        return res.status(200).json({

            message:
                'Encuesta expirada correctamente',

            encuesta:
                resultado

        });

    } catch (error) {

        console.error(
            'Error al expirar encuesta:',
            error
        );

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// ESTADÍSTICAS
// =====================================

const getStatistics = async (
    req,
    res
) => {

    try {

        const estadisticas =
            await service.getStatistics();


        return res.status(200).json({

            estadisticas

        });

    } catch (error) {

        console.error(
            'Error al obtener estadísticas:',
            error
        );

        return res.status(500).json({

            message:
                'No se pudieron obtener las estadísticas'

        });

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createSurvey,

    findById,

    findCompleteById,

    findByCitizen,

    findPendingByCitizen,

    findQuestions,

    answerSurvey,

    expireSurvey,

    getStatistics

};