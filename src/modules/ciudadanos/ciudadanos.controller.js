const service = require('./ciudadanos.service');


const profile = async(req,res)=>{


    res.json({

        message:
        "Perfil ciudadano",

        ciudadano:
        req.ciudadano

    });


};
// =====================================
// Crear ciudadano
// =====================================

const create = async (req, res) => {

    try {

        const ciudadano =
            await service.create(
                req.body
            );


        res.status(201).json({

            message:
            "Ciudadano registrado correctamente",

            ciudadano

        });


    } catch(error) {


        res.status(400).json({

            message:
            error.message

        });


    }

};





// =====================================
// Listar ciudadanos
// =====================================

const findAll = async (req,res)=>{


    try {


        const ciudadanos =
            await service.findAll();



        res.json({

            ciudadanos

        });



    } catch(error){


        res.status(500).json({

            message:
            error.message

        });


    }


};





// =====================================
// Buscar ciudadano por ID
// =====================================

const findById = async(req,res)=>{


    try {


        const ciudadano =
            await service.findById(

                req.params.id

            );



        res.json({

            ciudadano

        });



    } catch(error){


        res.status(404).json({

            message:
            error.message

        });


    }


};





// =====================================
// Buscar ciudadano por DNI
// =====================================

const findByDni = async(req,res)=>{


    try {


        const ciudadano =
            await service.findByDni(

                req.params.dni

            );



        res.json({

            ciudadano

        });



    } catch(error){


        res.status(404).json({

            message:
            error.message

        });


    }


};





// =====================================
// Actualizar ciudadano
// =====================================

const update = async(req,res)=>{


    try {


        const ciudadano =
            await service.update(

                req.params.id,

                req.body

            );



        res.json({

            message:
            "Ciudadano actualizado correctamente",

            ciudadano

        });



    } catch(error){


        res.status(400).json({

            message:
            error.message

        });


    }


};





// =====================================
// Cambiar contraseña
// =====================================

const changePassword = async(req,res)=>{


    try {


        const resultado =
            await service.changePassword(

                req.params.id,

                req.body.password

            );



        res.json({

            message:
            "Contraseña actualizada correctamente",

            resultado

        });



    } catch(error){


        res.status(400).json({

            message:
            error.message

        });


    }


};





// =====================================
// Cambiar estado de verificación
// =====================================

const verifyEmail = async(req,res)=>{


    try {


        const ciudadano =
            await service.verifyEmail(

                req.params.id

            );



        res.json({

            message:
            "Correo verificado correctamente",

            ciudadano

        });



    } catch(error){


        res.status(400).json({

            message:
            error.message

        });


    }


};





// =====================================
// Eliminar ciudadano lógico
// =====================================

const remove = async(req,res)=>{


    try {


        const ciudadano =
            await service.remove(

                req.params.id

            );



        res.json({

            message:
            "Ciudadano eliminado correctamente",

            ciudadano

        });



    } catch(error){


        res.status(400).json({

            message:
            error.message

        });


    }


};





// =====================================
// Login ciudadano
// =====================================

const login = async(req,res)=>{


    try {


        const resultado =
            await service.login(

                req.body

            );



        res.json({

            message:
            "Acceso permitido",

            ciudadano:
            resultado

        });



    } catch(error){


        res.status(401).json({

            message:
            error.message

        });


    }


};





module.exports = {


    create,

    findAll,

    findById,

    findByDni,

    update,

    changePassword,

    verifyEmail,

    remove,

    login,
    profile


};