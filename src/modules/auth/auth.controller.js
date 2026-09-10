const service = require('./auth.service');



// =====================================================
// LOGIN USUARIO MUNICIPAL
// =====================================================

const loginUsuarioController = async (

    req,

    res

) => {


    try {


        const {

            correo,

            password


        } = req.body;



        const resultado =

            await service.loginUsuario(

                correo,

                password

            );



        return res.status(200).json(

            {

                message:

                    'Acceso permitido',


                ...resultado

            }

        );



    } catch(error){


        return res.status(401).json(

            {

                message:

                    error.message

            }

        );


    }


};







// =====================================================
// LOGIN CIUDADANO
// =====================================================

const loginCiudadanoController = async (

    req,

    res

)=>{


    try {


        const {

            correo,

            password


        } = req.body;




        const resultado =

            await service.loginCiudadano(

                correo,

                password

            );



        return res.status(200).json(

            {

                message:

                    'Acceso permitido',


                ...resultado

            }

        );



    } catch(error){



        return res.status(401).json(

            {

                message:

                    error.message

            }

        );


    }


};







module.exports = {


    loginUsuarioController,

    loginCiudadanoController


};