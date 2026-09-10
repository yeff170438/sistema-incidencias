// =====================================
// Middleware de permisos RBAC
// =====================================


const authorizePermission = (...permisosRequeridos) => {


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
                "Acceso restringido a personal municipal"

            });

        }



        console.log("USUARIO EN PERMISSION:", req.user);

        // =====================================
        // Obtener permisos del JWT
        // =====================================

        const permisosUsuario =

            req.user.permisos || [];






        // =====================================
        // Validar permisos requeridos
        // =====================================

        const tienePermiso =

            permisosRequeridos.some(

                permiso =>

                    permisosUsuario.includes(
                        permiso
                    )

            );






        if (!tienePermiso) {


            return res.status(403).json({

                message:
                "No tiene permisos suficientes"

            });

        }





        // =====================================
        // Continuar
        // =====================================

        next();


    };


};



module.exports = authorizePermission;