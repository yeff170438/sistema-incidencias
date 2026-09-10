const service = require('./usuarios.service');



// =====================================================
// CREAR USUARIO
// =====================================================

const create = async (
    req,
    res
) => {


    try {


        const usuario =
            await service.create(
                req.body
            );



        return res.status(201).json({

            success:true,

            message:
            "Usuario creado correctamente",

            data:usuario

        });



    }catch(error){


        return res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =====================================================
// LISTAR USUARIOS
// =====================================================

const findAll = async(
    req,
    res
)=>{


    try{


        const usuarios =
            await service.findAll();



        return res.status(200).json({

            success:true,

            data:usuarios

        });



    }catch(error){


        return res.status(500).json({

            success:false,

            message:
            "Error al obtener usuarios",

            error:error.message

        });


    }


};




// =====================================================
// OBTENER USUARIO POR ID
// =====================================================

const findById = async(
    req,
    res
)=>{


    try{


        const usuario =
            await service.findById(
                req.params.id
            );



        return res.status(200).json({

            success:true,

            data:usuario

        });



    }catch(error){



        return res.status(404).json({

            success:false,

            message:error.message

        });


    }


};




// =====================================================
// ACTUALIZAR USUARIO
// =====================================================

const update = async(
    req,
    res
)=>{


    try{


        const usuario =
            await service.update(

                req.params.id,

                req.body

            );



        return res.status(200).json({

            success:true,

            message:
            "Usuario actualizado correctamente",

            data:usuario

        });



    }catch(error){


        return res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

const changePassword = async(
    req,
    res
)=>{


    try{


        const resultado =
            await service.changePassword(

                req.params.id,

                req.body.password

            );



        return res.status(200).json({

            success:true,

            message:
            "Contraseña actualizada correctamente",

            data:resultado

        });



    }catch(error){


        return res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =====================================================
// CAMBIAR ESTADO
// =====================================================

const changeStatus = async(
    req,
    res
)=>{


    try{


        const usuario =
            await service.changeStatus(

                req.params.id,

                req.body.estado

            );



        return res.status(200).json({

            success:true,

            message:
            "Estado actualizado correctamente",

            data:usuario

        });



    }catch(error){


        return res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =====================================================
// ELIMINACIÓN LÓGICA
// =====================================================

const remove = async(
    req,
    res
)=>{


    try{


        const usuario =
            await service.remove(

                req.params.id

            );



        return res.status(200).json({

            success:true,

            message:
            "Usuario desactivado correctamente",

            data:usuario

        });



    }catch(error){


        return res.status(400).json({

            success:false,

            message:error.message

        });


    }


};





module.exports = {


    create,

    findAll,

    findById,

    update,

    changePassword,

    changeStatus,

    remove


};