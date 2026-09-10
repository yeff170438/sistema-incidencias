// =====================================
// Validar registro ciudadano
// =====================================

const validateCreate = (req, res, next) => {


    const {
        dni,
        nombres,
        apellido_paterno,
        apellido_materno,
        correo,
        password
    } = req.body;



    // ===============================
    // DNI obligatorio
    // ===============================

    if(!dni){

        return res.status(400).json({

            message:"El DNI es obligatorio"

        });

    }



    // ===============================
    // Validar formato DNI
    // ===============================

    const dniRegex = /^[0-9]{8}$/;


    if(!dniRegex.test(dni)){


        return res.status(400).json({

            message:"El DNI debe contener 8 números"

        });


    }



    // ===============================
    // Nombres obligatorios
    // ===============================

    if(!nombres){

        return res.status(400).json({

            message:"Los nombres son obligatorios"

        });

    }



    // ===============================
    // Apellido paterno
    // ===============================

    if(!apellido_paterno){

        return res.status(400).json({

            message:"El apellido paterno es obligatorio"

        });

    }



    // ===============================
    // Apellido materno
    // ===============================

    if(!apellido_materno){

        return res.status(400).json({

            message:"El apellido materno es obligatorio"

        });

    }



    // ===============================
    // Correo obligatorio
    // ===============================

    if(!correo){

        return res.status(400).json({

            message:"El correo es obligatorio"

        });

    }



    // ===============================
    // Validar correo
    // ===============================

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    if(!emailRegex.test(correo)){


        return res.status(400).json({

            message:"El correo no tiene un formato válido"

        });


    }



    // ===============================
    // Password obligatorio
    // ===============================

    if(!password){

        return res.status(400).json({

            message:"La contraseña es obligatoria"

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




// =====================================
// Validar actualización ciudadano
// =====================================

const validateUpdate = (req,res,next)=>{


    const {
        nombres,
        apellido_paterno,
        apellido_materno,
        correo
    } = req.body;



    // ===============================
    // Validar nombres
    // ===============================

    if(
        nombres !== undefined &&
        nombres.trim()===""
    ){

        return res.status(400).json({

            message:
            "Los nombres no pueden estar vacíos"

        });

    }



    // ===============================
    // Validar apellidos
    // ===============================

    if(
        apellido_paterno !== undefined &&
        apellido_paterno.trim()===""
    ){

        return res.status(400).json({

            message:
            "El apellido paterno no puede estar vacío"

        });

    }



    if(
        apellido_materno !== undefined &&
        apellido_materno.trim()===""
    ){

        return res.status(400).json({

            message:
            "El apellido materno no puede estar vacío"

        });

    }



    // ===============================
    // Validar correo
    // ===============================

    if(correo){


        const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



        if(!emailRegex.test(correo)){


            return res.status(400).json({

                message:
                "El correo no tiene un formato válido"

            });


        }

    }



    next();

};




// =====================================
// Validar cambio de contraseña
// =====================================

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


// =====================================
// Validar login ciudadano
// =====================================

const validateLogin = (req,res,next)=>{

    const {
        correo,
        password
    } = req.body;


    if(!correo){

        return res.status(400).json({

            message:"El correo es obligatorio"

        });

    }


    if(!password){

        return res.status(400).json({

            message:"La contraseña es obligatoria"

        });

    }


    next();

};


module.exports = {

    validateCreate,
    validateUpdate,
    validatePassword,
    validateLogin

};