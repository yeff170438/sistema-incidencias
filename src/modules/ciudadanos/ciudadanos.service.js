const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const repository = require('./ciudadanos.repository');


// =====================================
// Login ciudadano
// =====================================

const login = async (data) => {


    const {
        correo,
        password
    } = data;



    const ciudadano =
        await repository.findByEmail(
            correo
        );



    if(!ciudadano){

        throw new Error(
            "Credenciales incorrectas"
        );

    }



    const passwordValida =
        await bcrypt.compare(
            password,
            ciudadano.password_hash
        );



    if(!passwordValida){

        throw new Error(
            "Credenciales incorrectas"
        );

    }



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
                expiresIn:"1d"
            }

        );



    return {

        ciudadano:{

            id_ciudadano:
            ciudadano.id_ciudadano,

            dni:
            ciudadano.dni,

            nombres:
            ciudadano.nombres,

            apellido_paterno:
            ciudadano.apellido_paterno,

            apellido_materno:
            ciudadano.apellido_materno,

            correo:
            ciudadano.correo

        },


        token

    };


};



// =====================================
// Registrar ciudadano
// =====================================

const create = async (data) => {


    const {
        dni,
        nombres,
        apellido_paterno,
        apellido_materno,
        telefono,
        correo,
        password,
        direccion
    } = data;



    // ===============================
    // Validar DNI existente
    // ===============================

    const existeDni =
        await repository.findByDni(dni);



    if(existeDni){

        throw new Error(
            "El DNI ya está registrado"
        );

    }



    // ===============================
    // Validar correo existente
    // ===============================

    const existeCorreo =
        await repository.findByEmail(correo);



    if(existeCorreo){

        throw new Error(
            "El correo ya está registrado"
        );

    }



    // ===============================
    // Encriptar contraseña
    // ===============================

    const password_hash =
        await bcrypt.hash(
            password,
            10
        );



    // ===============================
    // Crear ciudadano
    // ===============================

    const ciudadano =
        await repository.create({

            dni,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            correo,
            password_hash,
            direccion

        });



    return ciudadano;

};




// =====================================
// Buscar todos los ciudadanos
// =====================================

const findAll = async () => {


    return await repository.findAll();

};




// =====================================
// Buscar ciudadano por ID
// =====================================

const findById = async (
    id_ciudadano
) => {


    const ciudadano =
        await repository.findById(
            id_ciudadano
        );



    if(!ciudadano){

        throw new Error(
            "Ciudadano no encontrado"
        );

    }



    return ciudadano;

};




// =====================================
// Actualizar perfil
// =====================================

const update = async (
    id_ciudadano,
    data
) => {


    const ciudadano =
        await repository.findById(
            id_ciudadano
        );



    if(!ciudadano){

        throw new Error(
            "Ciudadano no encontrado"
        );

    }



    // Validar cambio de correo

    if(
        data.correo &&
        data.correo !== ciudadano.correo
    ){

        const existeCorreo =
            await repository.findByEmail(
                data.correo
            );



        if(existeCorreo){

            throw new Error(
                "El correo ya está registrado"
            );

        }

    }



    const actualizado =
        await repository.update(
            id_ciudadano,
            data
        );



    return actualizado;

};




// =====================================
// Cambiar contraseña
// =====================================

const changePassword = async (
    id_ciudadano,
    password
) => {


    const ciudadano =
        await repository.findById(
            id_ciudadano
        );



    if(!ciudadano){

        throw new Error(
            "Ciudadano no encontrado"
        );

    }



    const password_hash =
        await bcrypt.hash(
            password,
            10
        );



    return await repository.changePassword(
        id_ciudadano,
        password_hash
    );

};




// =====================================
// Actualizar último acceso
// =====================================

const updateLastAccess = async (
    id_ciudadano
) => {


    const ciudadano =
        await repository.findById(
            id_ciudadano
        );



    if(!ciudadano){

        throw new Error(
            "Ciudadano no encontrado"
        );

    }



    return await repository.updateLastAccess(
        id_ciudadano
    );

};




// =====================================
// Verificar correo
// =====================================

const verifyEmail = async (
    id_ciudadano
) => {


    const ciudadano =
        await repository.findById(
            id_ciudadano
        );



    if(!ciudadano){

        throw new Error(
            "Ciudadano no encontrado"
        );

    }



    return await repository.verifyEmail(
        id_ciudadano
    );

};




// =====================================
// Exportar
// =====================================

module.exports = {

    create,
    login,
    findAll,
    findById,
    update

};
