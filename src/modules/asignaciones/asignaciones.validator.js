// =====================================
// Validar creación de asignación
// =====================================

const validateCreate = (req,res,next)=>{


    const {

        id_ticket,

        id_oficina,

        id_usuario


    } = req.body;




    if(!id_ticket){


        return res.status(400).json({

            message:
            "El ticket es obligatorio"

        });

    }





    if(
        Number.isNaN(
            Number(id_ticket)
        )
    ){

        return res.status(400).json({

            message:
            "El id_ticket debe ser numérico"

        });

    }






    if(!id_oficina){


        return res.status(400).json({

            message:
            "La oficina es obligatoria"

        });

    }





    if(
        Number.isNaN(
            Number(id_oficina)
        )
    ){

        return res.status(400).json({

            message:
            "El id_oficina debe ser numérico"

        });

    }





    if(
        id_usuario &&
        Number.isNaN(
            Number(id_usuario)
        )
    ){

        return res.status(400).json({

            message:
            "El responsable debe ser numérico"

        });

    }




    next();

};






// =====================================
// Validar recepción
// =====================================

const validateReceive = (req,res,next)=>{


    const {

        usuario_receptor

    } = req.body;




    if(!usuario_receptor){


        return res.status(400).json({

            message:
            "El usuario receptor es obligatorio"

        });

    }





    if(
        Number.isNaN(
            Number(usuario_receptor)
        )
    ){

        return res.status(400).json({

            message:
            "El usuario receptor debe ser numérico"

        });

    }




    next();

};






// =====================================
// Validar cierre / rechazo
// =====================================

const validateObservation = (req,res,next)=>{


    const {

        observacion

    } = req.body;




    if(!observacion){


        return res.status(400).json({

            message:
            "La observación es obligatoria"

        });

    }





    if(
        observacion.length < 5
    ){

        return res.status(400).json({

            message:
            "La observación debe tener mínimo 5 caracteres"

        });

    }




    next();

};







module.exports={


    validateCreate,

    validateReceive,

    validateObservation


};