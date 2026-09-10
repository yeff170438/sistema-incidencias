// =====================================================
// VALIDACIONES GENERALES
// =====================================================


const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;




const validarIdNumerico = (valor) => {

    return Number.isInteger(
        Number(valor)
    );

};




// =====================================================
// CREAR USUARIO
// =====================================================

const validateCreate = (
    req,
    res,
    next
) => {


    const {

        nombre,
        correo,
        password,
        id_rol,
        id_oficina

    } = req.body;



    // Nombre

    if(!nombre || nombre.trim()===""){


        return res.status(400).json({

            message:
            "El nombre es obligatorio"

        });

    }




    // Correo

    if(!correo){


        return res.status(400).json({

            message:
            "El correo es obligatorio"

        });

    }



    if(!emailRegex.test(correo)){


        return res.status(400).json({

            message:
            "El correo no tiene formato válido"

        });

    }




    // Password

    if(!password){


        return res.status(400).json({

            message:
            "La contraseña es obligatoria"

        });

    }



    if(password.length < 6){


        return res.status(400).json({

            message:
            "La contraseña debe tener mínimo 6 caracteres"

        });

    }




    // Rol obligatorio

    if(!id_rol){


        return res.status(400).json({

            message:
            "Debe asignar un rol"

        });

    }




    if(!validarIdNumerico(id_rol)){


        return res.status(400).json({

            message:
            "El id_rol debe ser numérico"

        });

    }




    // Oficina opcional aquí
    // La regla depende del rol
    // y será validada en service


    if(
        id_oficina !== undefined &&
        id_oficina !== null &&
        !validarIdNumerico(id_oficina)
    ){


        return res.status(400).json({

            message:
            "El id_oficina debe ser numérico"

        });

    }



    next();

};




// =====================================================
// ACTUALIZAR USUARIO
// =====================================================

const validateUpdate = (
    req,
    res,
    next
) => {



    const {

        nombre,
        correo,
        id_oficina,
        id_rol

    } = req.body;




    if(
        nombre !== undefined &&
        nombre.trim()===""
    ){


        return res.status(400).json({

            message:
            "El nombre no puede estar vacío"

        });

    }




    if(correo){


        if(!emailRegex.test(correo)){


            return res.status(400).json({

                message:
                "El correo no tiene formato válido"

            });

        }

    }




    if(
        id_rol !== undefined &&
        !validarIdNumerico(id_rol)
    ){


        return res.status(400).json({

            message:
            "El id_rol debe ser numérico"

        });

    }




    if(
        id_oficina !== undefined &&
        id_oficina !== null &&
        !validarIdNumerico(id_oficina)
    ){


        return res.status(400).json({

            message:
            "El id_oficina debe ser numérico"

        });

    }



    next();


};




// =====================================================
// CAMBIO DE PASSWORD
// =====================================================

const validatePassword = (
    req,
    res,
    next
)=>{


    const {
        password
    } = req.body;



    if(!password){


        return res.status(400).json({

            message:
            "La contraseña es obligatoria"

        });

    }




    if(password.length < 6){


        return res.status(400).json({

            message:
            "La contraseña debe tener mínimo 6 caracteres"

        });

    }




    next();


};




// =====================================================
// CAMBIO DE ESTADO
// =====================================================

const validateStatus = (
    req,
    res,
    next
)=>{


    const {
        estado
    } = req.body;




    if(typeof estado !== "boolean"){


        return res.status(400).json({

            message:
            "El estado debe ser booleano"

        });

    }




    next();


};




// =====================================================
// EXPORTAR
// =====================================================

module.exports = {


    validateCreate,

    validateUpdate,

    validatePassword,

    validateStatus


};