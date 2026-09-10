const jwt = require('jsonwebtoken');


// =====================================
// Middleware autenticación ciudadano
// =====================================

const ciudadanoAuth = (

    req,

    res,

    next

)=>{


    const authHeader =

        req.headers.authorization;



    if(!authHeader){


        return res.status(401).json({

            message:
            "Token no proporcionado"

        });

    }





    const token =

        authHeader.startsWith("Bearer ")

        ? authHeader.split(" ")[1]

        : authHeader;





    try{


        const decoded =

            jwt.verify(

                token,

                process.env.JWT_SECRET

            );





        // Validar tipo ciudadano

        if(decoded.tipo !== "CIUDADANO"){


            return res.status(403).json({

                message:
                "Acceso permitido solo para ciudadanos"

            });

        }





        // Guardar usuario autenticado

        req.user = decoded;



        next();



    }catch(error){


        return res.status(401).json({

            message:
            "Token inválido o expirado"

        });


    }


};



module.exports = ciudadanoAuth;