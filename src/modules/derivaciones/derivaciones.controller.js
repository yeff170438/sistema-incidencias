const service =
    require('./derivaciones.service');



// =====================================
// Crear derivación de atención
// =====================================

const createDerivation = async (req, res) => {

    try {

        const resultado =
            await service.createDerivation({

                // Atención que será derivada
                id_atencion:
                    req.params.id_atencion,


                // Oficina responsable nueva
                id_oficina_destino:
                    req.body.id_oficina_destino,


                // Usuario que realiza la derivación
                id_usuario:
                    req.user.id_usuario,


                // Motivo
                id_motivo:
                    req.body.id_motivo,


                // Comentario
                comentario:
                    req.body.comentario

            });


        return res.status(201).json({

            message:
                "Atención derivada correctamente",

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
// Exportar
// =====================================

module.exports = {

    createDerivation

};