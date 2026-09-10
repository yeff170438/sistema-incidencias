// =====================================
// Middleware de roles RBAC
// =====================================


const authorize = (...rolesPermitidos) => {


    return (req, res, next) => {


        // =====================================
        // Verificar autenticación
        // =====================================

        if (!req.user) {


            return res.status(401).json({

                message:
                "Usuario no autenticado"

            });

        }





        // =====================================
        // Validar tipo de usuario
        // =====================================

        if (req.user.tipo !== "USUARIO") {


            return res.status(403).json({

                message:
                "Acceso permitido únicamente para personal municipal"

            });

        }





        // =====================================
        // Validar existencia del rol
        // =====================================

        if (!req.user.rol) {


            return res.status(403).json({

                message:
                "El usuario no tiene un rol asignado"

            });

        }





        // =====================================
        // Validar rol permitido
        // =====================================

        if (

            !rolesPermitidos.includes(
                req.user.rol
            )

        ) {


            return res.status(403).json({

                message:
                "Rol no autorizado para esta operación"

            });

        }





        // =====================================
        // Continuar ejecución
        // =====================================

        next();


    };


};



module.exports = authorize;