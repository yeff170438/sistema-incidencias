const service =
    require('./solicitudes_incidencias.service');


const validator =
    require('./solicitudes_incidencias.validator');

const generarSolicitudAdministrativa =
    require('./solicitud-administrativa.pdf');


// =====================================
// SOLICITUDES DE INCIDENCIA CONTROLLER
// =====================================


// =====================================
// CREAR SAIU
// =====================================

const createSAIU = async (
    req,
    res
) => {

    try {

        const datosValidados =
            validator.validateCreate(
                req.body
            );


        const data = {

            ...datosValidados,

            id_usuario:
                req.user.id_usuario

        };


        const saiu =
            await service.createSAIU(
                data
            );


        return res.status(201).json({

            mensaje:
                'SAIU generado correctamente',

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error creando SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR ID
// =====================================

const findById = async (
    req,
    res
) => {

    try {

        const id_saiu =
            validator.validateId(

                req.params.id_saiu,

                'id_saiu'

            );


        const saiu =
            await service.findById(
                id_saiu
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR TICKET
// =====================================

const findByTicket = async (
    req,
    res
) => {

    try {

        const id_ticket =
            validator.validateId(

                req.params.id_ticket,

                'id_ticket'

            );


        const saiu =
            await service.findByTicket(
                id_ticket
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU por ticket:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// OBTENER SAIU POR CÃ“DIGO
// =====================================

const findByCodigo = async (
    req,
    res
) => {

    try {

        const codigo =
            validator.validateCodigoConsulta(

                req.params.codigo_saiu

            );


        const saiu =
            await service.findByCodigo(
                codigo
            );


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error obteniendo SAIU por cÃ³digo:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// REGISTRAR EXPEDIENTE
// =====================================

const registerExpediente = async (
    req,
    res
) => {

    try {

        // =====================================
        // VALIDAR DATOS RECIBIDOS
        // =====================================

        const data =
            validator.validateRegisterExpediente({

                ...req.body

            });


        // =====================================
        // USUARIO AUTENTICADO
        // =====================================

        data.id_usuario =
            req.user.id_usuario;


        // =====================================
        // REGISTRAR EXPEDIENTE
        // =====================================

        const saiu =
            await service.registerExpediente(
                data
            );


        return res.status(200).json({

            mensaje:
                'NÃºmero de expediente registrado correctamente',

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error registrando expediente:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};





// =====================================
// LISTAR SAIU
// =====================================

const findAll = async (
    req,
    res
) => {

    try {

        const saiu =
            await service.findAll();


        return res.status(200).json({

            data:
                saiu

        });

    } catch (error) {

        console.error(
            'Error listando SAIU:',
            error
        );


        return res.status(500).json({

            mensaje:
                'Error interno del servidor'

        });

    }

};

// =====================================
// OBTENER SOLICITUD ADMINISTRATIVA COMPLETA
// =====================================

const getAdministrativeRequest = async (
    req,
    res
) => {

    try {

        const id_saiu =
            validator.validateId(
                req.params.id_saiu,
                'id_saiu'
            );


        const solicitud =
            await service.getAdministrativeRequest(
                id_saiu
            );


        return res.status(200).json({

            mensaje:
                'Solicitud administrativa obtenida correctamente',

            data:
                solicitud

        });

    } catch (error) {

        console.error(
            'Error obteniendo solicitud administrativa:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// CONFIRMAR RECEPCIÃ“N DEL SAIU
// =====================================


// =====================================
// GENERAR PDF DE SOLICITUD ADMINISTRATIVA
// =====================================

const generateAdministrativeRequestPdf = async (req, res) => {
    try {
        const id_saiu = validator.validateId(
            req.params.id_saiu,
            'id_saiu'
        );

        const solicitud = await service.getAdministrativeRequest(id_saiu);

        const codigoOriginal =
            solicitud?.saiu?.codigo_saiu || `SAIU-${id_saiu}`;

        const codigo = String(codigoOriginal)
            .replace(/[^a-zA-Z0-9_-]/g, '_');

        const pdf = generarSolicitudAdministrativa(solicitud);

        pdf.on('error', (error) => {
            console.error(
                'Error generando PDF de solicitud administrativa:',
                error
            );

            if (!res.headersSent) {
                res.status(500).json({
                    mensaje: 'No se pudo generar el PDF de la solicitud administrativa'
                });
            } else {
                res.destroy(error);
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="Solicitud-${codigo}.pdf"`
        );
        res.setHeader('Cache-Control', 'private, no-store');

        pdf.pipe(res);
        pdf.end();
    } catch (error) {
        console.error(
            'Error preparando PDF de solicitud administrativa:',
            error
        );

        if (!res.headersSent) {
            const noEncontrada =
                error.message &&
                error.message.includes('No existe una solicitud administrativa');

            return res.status(noEncontrada ? 404 : 400).json({
                mensaje: error.message
            });
        }

        res.destroy(error);
    }
};

const receiveSAIU = async (
    req,
    res
) => {

    try {

        const data = {

            ...req.body,

            id_usuario:
                req.user.id_usuario

        };


        const recibido =
            await service.receiveSAIU(
                data
            );


        return res.status(200).json({

            mensaje:
                'TrÃ¡mite administrativo recibido correctamente',

            data:
                recibido

        });

    } catch (error) {

        console.error(
            'Error confirmando recepciÃ³n del SAIU:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// CORREGIR NÃšMERO DE EXPEDIENTE
// =====================================

const updateExpediente = async (
    req,
    res
) => {

    try {

        // =====================================
        // VALIDAR DATOS RECIBIDOS
        // =====================================

        const data =
            validator.validateUpdateExpediente({

                ...req.body

            });


        // =====================================
        // USUARIO AUTENTICADO
        // =====================================

        data.id_usuario =
            req.user.id_usuario;


        // =====================================
        // CORREGIR EXPEDIENTE
        // =====================================

        const actualizado =
            await service.updateExpediente(
                data
            );


        // =====================================
        // RESPUESTA
        // =====================================

        return res.status(200).json({

            mensaje:
                'NÃºmero de expediente corregido correctamente',

            data:
                actualizado

        });

    } catch (error) {

        console.error(
            'Error corrigiendo expediente:',
            error
        );


        return res.status(400).json({

            mensaje:
                error.message

        });

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    createSAIU,

    findById,

    findByTicket,

    findByCodigo,

    registerExpediente,

    findAll,

    getAdministrativeRequest,

    generateAdministrativeRequestPdf,
    receiveSAIU,

    updateExpediente

};
