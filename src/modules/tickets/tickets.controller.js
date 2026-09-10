const service = require('./tickets.service');

const validator =
    require('./tickets.validator');

// =====================================
// Crear ticket desde incidencia validada
// =====================================

const createFromIncident = async (req, res) => {

    try {


        const {

            id_incidencia

        } = req.body;



        const ticket =

            await service.createTicketFromIncident(

                id_incidencia

            );



        return res.status(201).json({

            message:

                "Ticket creado correctamente",

            ticket

        });



    } catch(error) {


        return res.status(400).json({

            message:

                error.message

        });


    }

};




// =====================================
// Obtener ticket por ID
// =====================================

const findById = async(req,res)=>{


    try{


        const ticket =

            await service.findById(

                req.params.id

            );



        return res.json(ticket);



    }catch(error){


        return res.status(404).json({

            message:

                error.message

        });


    }


};




// =====================================
// Listar tickets
// =====================================

const findAll = async(req,res)=>{


    try{


        const tickets =

            await service.findAll();



        return res.json(tickets);



    }catch(error){


        return res.status(500).json({

            message:

                error.message

        });


    }


};




// =====================================
// Asignar ticket
// =====================================

const assignTicket = async(req,res)=>{


    try{


        const ticket =

            await service.assignTicket(

                req.params.id,

                req.user.id_usuario

            );



        return res.json({

            message:

                "Ticket asignado correctamente",

            ticket

        });



    }catch(error){


        return res.status(400).json({

            message:

                error.message

        });


    }


};




// =====================================
// Iniciar atención
// =====================================

const startAttention = async(req,res)=>{


    try{


        const ticket =

            await service.startAttention(

                req.params.id,

                req.user.id_usuario

            );



        return res.json({

            message:

                "Atención iniciada correctamente",

            ticket

        });



    }catch(error){


        return res.status(400).json({

            message:

                error.message

        });


    }


};




// =====================================
// Resolver ticket
// =====================================

const resolveTicket = async(req,res)=>{


    try{


        const ticket =

            await service.resolveTicket(

                req.params.id,

                req.user.id_usuario

            );



        return res.json({

            message:

                "Ticket resuelto correctamente",

            ticket

        });



    }catch(error){


        return res.status(400).json({

            message:

                error.message

        });


    }


};




// =====================================
// Cerrar ticket
// =====================================

// =====================================
// Cerrar ticket
// =====================================

const closeTicket = async(

    id_ticket,

    observacion_cierre,

    id_usuario

)=>{


    // Buscar ticket

    const ticket =

        await repository.findById(

            id_ticket

        );



    if(!ticket){


        throw new Error(

            "Ticket no encontrado"

        );

    }




    // Validar estado actual

    if(ticket.estado !== "Resuelto"){


        throw new Error(

            "Solo se pueden cerrar tickets resueltos"

        );

    }





    // Buscar estado Cerrado

    const estado =

        await repository.findStateByName(

            "TICKET",

            "Cerrado"

        );



    if(!estado){


        throw new Error(

            "No existe estado Cerrado"

        );

    }





    const resultado =

        await repository.closeTicket(

            id_ticket,

            estado.id_estado,

            observacion_cierre

        );






    // Registrar seguimiento

    await seguimientoService.createTracking({

        id_ticket:

            id_ticket,


        id_usuario:

            id_usuario,


        id_ciudadano:

            null,


        origen:

            "USUARIO",


        accion:

            "CIERRE_TICKET",


        id_estado_anterior:

            ticket.id_estado,


        id_estado_nuevo:

            estado.id_estado,


        comentario:

            observacion_cierre ||

            "Ticket cerrado correctamente."

    });






    return resultado;


};


// =====================================
// Cerrar ticket
// =====================================

const close = async (req, res) => {

    try {

        const {

            observacion_cierre

        } = req.body;


        const ticket =
            await service.closeTicket(

                req.params.id,

                observacion_cierre,

                req.user.id_usuario

            );


        return res.json({

            message:
                "Ticket cerrado correctamente",

            ticket

        });


    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// Seleccionar modalidad de atención
// =====================================

const selectAttentionMode = async (
    req,
    res
) => {

    try {

        const id_ticket =
            validator.validateTicketId(
                req.params.id
            );

        const modalidad =
            validator.validateAttentionMode(
                req.body.modalidad_atencion
            );

        const id_usuario =
            req.user.id_usuario;


        const resultado =
            await service.selectAttentionMode(

                id_ticket,

                modalidad,

                id_usuario

            );


        return res.status(200).json({

            message:
                'Modalidad de atención seleccionada correctamente',

            resultado

        });


    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};

module.exports = {

    createFromIncident,

    findById,

    findAll,

    assignTicket,

    startAttention,

    resolveTicket,

    closeTicket,

    close,

    selectAttentionMode

};