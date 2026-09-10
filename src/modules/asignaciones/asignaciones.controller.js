const service = require('./asignaciones.service');


// =====================================
// Crear asignación
// =====================================

const create = async (req, res) => {

    try {

        const asignacion =
            await service.createAssignment({

                ...req.body,

                id_usuario:
                    req.user.id_usuario

            });


        return res.status(201).json({

            message:
                "Asignación creada correctamente",

            asignacion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Obtener asignación por ID
// =====================================

const findById = async (req, res) => {

    try {

        const asignacion =
            await service.findById(

                req.params.id

            );


        return res.json(

            asignacion

        );

    } catch (error) {

        return res.status(404).json({

            message:
                error.message

        });

    }

};



// =====================================
// Listar asignaciones por oficina
// =====================================

const findByOffice = async (req, res) => {

    try {

        const asignaciones =
            await service.findByOffice(

                req.params.id_oficina

            );


        return res.json(

            asignaciones

        );

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Obtener asignaciones pendientes
// por oficina
// =====================================

const getPendingAssignments = async (
    req,
    res
) => {

    try {

        const asignaciones =
            await service.getPendingAssignments(

                req.params.id_oficina

            );


        return res.json({

            asignaciones

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Recibir asignación
// =====================================

const receive = async (req, res) => {

    try {

        const asignacion =
            await service.receiveAssignment(

                req.params.id,

                req.user.id_usuario,

                req.user.id_usuario

            );


        return res.json({

            message:
                "Asignación recibida correctamente",

            asignacion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Rechazar asignación
// =====================================

const reject = async (req, res) => {

    try {

        const {

            observacion

        } = req.body;


        const asignacion =
            await service.rejectAssignment(

                req.params.id,

                observacion,

                req.user.id_usuario

            );


        return res.json({

            message:
                "Asignación rechazada correctamente",

            asignacion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Iniciar atención
// =====================================

const start = async (req, res) => {

    try {

        const resultado =
            await service.startAssignmentFromAttention(

                req.params.id,

                req.user.id_usuario

            );


        return res.json({

            message:
                "La atención de la asignación fue iniciada correctamente",

            resultado:
                asignacion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Finalizar atención
// =====================================

const finish = async (req, res) => {

    try {

        const {

            observacion

        } = req.body;


        const resultado =
            await service.finishAssignmentFromAttention(

                req.params.id,

                observacion,

                req.user.id_usuario

            );


        return res.json({

            message:
                "Atención finalizada correctamente",

            resultado

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};

// =====================================
// Crear asignación por derivación
// =====================================

const createFromDerivation = async (req, res) => {

    try {

        const {

            id_ticket,

            id_oficina

        } = req.body;


        const asignacion =
            await service.createAssignmentFromDerivation(

                id_ticket,

                id_oficina

            );


        return res.status(201).json({

            message:
                "Asignación por derivación creada correctamente",

            asignacion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};

// =====================================
// EXPORTAR
// =====================================

module.exports = {

    create,

    createFromDerivation,

    findById,

    findByOffice,

    getPendingAssignments,

    receive,

    reject,

    start,

    finish

};