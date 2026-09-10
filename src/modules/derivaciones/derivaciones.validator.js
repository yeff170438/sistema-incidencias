const validateCreateDerivation = (req,res,next)=>{


    const {

        id_ticket,

        id_oficina_destino,

        id_motivo

    } = req.body;



    if(!id_ticket){

        return res.status(400).json({

            message:
            "El id_ticket es obligatorio"

        });

    }



    if(!id_oficina_destino){

        return res.status(400).json({

            message:
            "La oficina destino es obligatoria"

        });

    }



    if(!id_motivo){

        return res.status(400).json({

            message:
            "El motivo de derivación es obligatorio"

        });

    }



    next();


};




module.exports = {


    validateCreateDerivation


};