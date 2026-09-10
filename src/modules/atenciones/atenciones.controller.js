const service =
    require('./atenciones.service');


// =====================================
// Iniciar atención
// =====================================

const startAttention = async (req, res) => {

    try {

        const atencion =
            await service.startAttention({

                id_asignacion:
                    req.body.id_asignacion,

                id_usuario:
                    req.user.id_usuario,

                descripcion_atencion:
                    req.body.descripcion_atencion

            });


        return res.status(201).json({

            message:
                "Atención iniciada correctamente.",

            atencion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Actualizar avance
// =====================================

const updateProgress = async (req, res) => {

    try {

        const atencion =
            await service.updateProgress({

                id_atencion:
                    req.params.id_atencion,

                id_usuario:
                    req.user.id_usuario,

                descripcion_atencion:
                    req.body.descripcion_atencion,

                resultado:
                    req.body.resultado,

                conclusion:
                    req.body.conclusion

            });


        return res.json({

            message:
                "Avance actualizado correctamente.",

            atencion

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

const finishAttention = async (req, res) => {

    try {

        const atencion =
            await service.finishAttention({

                id_atencion:
                    req.params.id_atencion,

                id_usuario:
                    req.user.id_usuario,

                resultado:
                    req.body.resultado,

                conclusion:
                    req.body.conclusion

            });


        return res.json({

            message:
                "Atención finalizada correctamente.",

            atencion

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Buscar atención por ID
// =====================================

const findById = async (req, res) => {

    try {

        const atencion =
            await service.findById(

                req.params.id_atencion

            );


        return res.json({

            atencion

        });

    } catch (error) {

        return res.status(404).json({

            message:
                error.message

        });

    }

};



// =====================================
// Historial de atenciones del ticket
// =====================================

const findByTicket = async (req, res) => {

    try {

        const historial =
            await service.findByTicket(

                req.params.id_ticket

            );


        return res.json({

            historial

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Derivar atención
// =====================================

const deriveAttention = async (req, res) => {

    try {

        const resultado =
            await service.deriveAttention({

                id_atencion:
                    req.params.id_atencion,

                id_oficina_destino:
                    req.body.id_oficina_destino,

                id_usuario:
                    req.user.id_usuario,

                id_motivo:
                    req.body.id_motivo,

                comentario:
                    req.body.comentario

            });


        return res.status(201).json({

            message:
                "Atención derivada correctamente.",

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
// Finalizar atención por derivación
// =====================================

const finishAttentionByDerivation =
    async (req, res) => {

        try {

            const resultado =
                await service.finishAttentionByDerivation({

                    id_atencion:
                        req.params.id_atencion,

                    id_usuario:
                        req.user.id_usuario,

                    resultado:
                        req.body.resultado,

                    conclusion:
                        req.body.conclusion

                });


            return res.json({

                message:
                    "Atención finalizada por derivación correctamente.",

                atencion:
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
// EXPORTAR
// =====================================

module.exports = {

    startAttention,

    updateProgress,

    finishAttention,

    findById,

    findByTicket,

    deriveAttention,

    finishAttentionByDerivation

};