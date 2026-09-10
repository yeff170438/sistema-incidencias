// =====================================
// CONTROLLER DE AUDITORÍA
// =====================================

const service =
    require('./auditoria.service');


// =====================================
// BUSCAR AUDITORÍA POR ID
// =====================================

const findById = async (req, res) => {

    try {

        const auditoria =
            await service.findById(
                req.params.id
            );

        return res.status(200).json({

            auditoria

        });

    } catch (error) {

        console.error(
            'Error al obtener auditoría:',
            error
        );

        return res.status(404).json({

            message:
                error.message

        });

    }

};


// =====================================
// LISTAR TODAS LAS AUDITORÍAS
// =====================================

const findAll = async (req, res) => {

    try {

        const auditorias =
            await service.findAll();

        return res.status(200).json({

            total:
                auditorias.length,

            auditorias

        });

    } catch (error) {

        console.error(
            'Error al obtener auditorías:',
            error
        );

        return res.status(500).json({

            message:
                error.message

        });

    }

};


// =====================================
// BUSCAR AUDITORÍAS DE UN REGISTRO
// =====================================

const findByRecord = async (req, res) => {

    try {

        const {

            tabla,

            id

        } = req.params;


        const auditorias =
            await service.findByRecord(

                tabla,

                id

            );


        return res.status(200).json({

            total:
                auditorias.length,

            auditorias

        });

    } catch (error) {

        console.error(

            'Error al obtener historial de auditoría:',

            error

        );

        return res.status(500).json({

            message:
                error.message

        });

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findById,

    findAll,

    findByRecord

};