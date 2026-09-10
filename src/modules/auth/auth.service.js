const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const repository = require('./auth.repository');



// =====================================================
// LOGIN USUARIO MUNICIPAL
// =====================================================

const loginUsuario = async (

    correo,

    password

) => {


    // Buscar usuario

    const usuario =

        await repository.findUserByEmail(

            correo

        );



    if(!usuario){


        throw new Error(

            'Usuario no encontrado'

        );

    }





    // Validar estado

    if(!usuario.estado){


        throw new Error(

            'Usuario inactivo'

        );

    }





    // Comparar contraseña

    const passwordValida =

        await bcrypt.compare(

            password,

            usuario.password_hash

        );



    if(!passwordValida){


        throw new Error(

            'Contraseña incorrecta'

        );

    }





    // Obtener permisos RBAC

    const permisos =

        await repository.getUserPermissions(

            usuario.id_usuario

        );





    // Generar token usuario municipal

    const token = jwt.sign(

    {
        id_usuario: usuario.id_usuario,

        tipo:"USUARIO",

        rol:usuario.rol,

        permisos

    },

    process.env.JWT_SECRET,

    {
        expiresIn:'24h'
    }

    );





    return {


        usuario:{


            id:

                usuario.id_usuario,


            nombre:

                usuario.nombre,


            correo:

                usuario.correo,


            tipo:

                "USUARIO",


            rol:

                usuario.rol,


            permisos


        },


        token


    };


};








// =====================================================
// LOGIN CIUDADANO
// =====================================================

const loginCiudadano = async (

    correo,

    password

)=>{


    // Buscar ciudadano

    const ciudadano =

        await repository.findCitizenByEmail(

            correo

        );



    if(!ciudadano){


        throw new Error(

            'Ciudadano no encontrado'

        );

    }





    // Validar contraseña

    const passwordValida =

        await bcrypt.compare(

            password,

            ciudadano.password_hash

        );



    if(!passwordValida){


        throw new Error(

            'Contraseña incorrecta'

        );

    }





    // Crear token ciudadano

    const token =

        jwt.sign(

            {


                id_ciudadano:

                    ciudadano.id_ciudadano,


                tipo:

                    "CIUDADANO"


            },


            process.env.JWT_SECRET,


            {

                expiresIn:'24h'

            }

        );





    return {


        ciudadano:{


            id:

                ciudadano.id_ciudadano,


            nombre:

                `${ciudadano.nombres} ${ciudadano.apellido_paterno}`,


            correo:

                ciudadano.correo,


            tipo:

                "CIUDADANO"


        },


        token


    };


};







// =====================================================
// EXPORTAR
// =====================================================

module.exports = {


    loginUsuario,

    loginCiudadano

};