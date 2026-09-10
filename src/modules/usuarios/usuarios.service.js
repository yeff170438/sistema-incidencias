const bcrypt = require('bcrypt');

const repository = require('./usuarios.repository');



// =====================================================
// VALIDACIONES INTERNAS
// =====================================================


// Validar correo duplicado al crear

const validarCorreoCrear = async (correo) => {

    const existe =
        await repository.findByEmail(correo);


    if(existe){

        throw new Error(
            "El correo ya está registrado"
        );

    }

};




// Validar correo duplicado al editar

const validarCorreoEditar = async (
    correo,
    id_usuario
) => {


    const existe =
        await repository.findByEmailExceptId(
            correo,
            id_usuario
        );


    if(existe){

        throw new Error(
            "El correo ya está registrado por otro usuario"
        );

    }

};




// Validar rol existente

const validarRol = async (
    id_rol
) => {


    const rol =
        await repository.findRoleById(
            id_rol
        );


    if(!rol){

        throw new Error(
            "El rol seleccionado no existe"
        );

    }


    return rol;

};




// Validar oficina

const validarOficina = async (
    id_oficina
) => {


    const oficina =
        await repository.findOfficeById(
            id_oficina
        );


    if(!oficina){

        throw new Error(
            "La oficina seleccionada no existe"
        );

    }


    return oficina;

};




// Reglas según rol

const validarReglasRol = async (
    id_rol,
    id_oficina
) => {


    const rol =
        await validarRol(id_rol);



    switch(rol.nombre){


        case "ADMIN":


            if(id_oficina){

                throw new Error(
                    "Un ADMIN no puede tener oficina asignada"
                );

            }

            break;



        case "OPERADOR":


        case "RESPONSABLE":


            if(!id_oficina){

                throw new Error(
                    `El rol ${rol.nombre} requiere una oficina`
                );

            }


            await validarOficina(
                id_oficina
            );


            break;



        default:


            throw new Error(
                "Rol no permitido"
            );


    }


    return rol;

};




// =====================================================
// CREAR USUARIO
// =====================================================

const create = async (
    data
) => {


    const {

        nombre,
        correo,
        password,
        id_oficina,
        id_rol

    } = data;



    await validarCorreoCrear(
        correo
    );



    await validarReglasRol(
        id_rol,
        id_oficina
    );



    const password_hash =
        await bcrypt.hash(
            password,
            10
        );



    const client =
        await repository.getClient();



    try{


        await client.query(
            "BEGIN"
        );



        const usuario =
            await repository.create(

                {
                    nombre,
                    correo,
                    password_hash,
                    id_oficina
                },

                client

            );



        await repository.assignRole(

            usuario.id_usuario,

            id_rol,

            client

        );



        await client.query(
            "COMMIT"
        );



        return usuario;



    }catch(error){


        await client.query(
            "ROLLBACK"
        );


        throw error;



    }finally{


        client.release();

    }


};




// =====================================================
// LISTAR USUARIOS
// =====================================================

const findAll = async()=>{


    return await repository.findAll();

};




// =====================================================
// BUSCAR POR ID
// =====================================================

const findById = async(
    id
)=>{


    const usuario =
        await repository.findById(
            id
        );


    if(!usuario){

        throw new Error(
            "Usuario no encontrado"
        );

    }


    return usuario;

};




// =====================================================
// ACTUALIZAR USUARIO
// =====================================================

const update = async(
    id,
    data
)=>{


    const usuarioExistente =
        await repository.findById(
            id
        );


    if(!usuarioExistente){

        throw new Error(
            "Usuario no encontrado"
        );

    }



    const {

        nombre,
        correo,
        id_oficina,
        id_rol

    } = data;



    await validarCorreoEditar(

        correo,

        id

    );



    await validarReglasRol(

        id_rol,

        id_oficina

    );



    const client =
        await repository.getClient();



    try{


        await client.query(
            "BEGIN"
        );



        const usuario =
            await repository.update(

                id,

                {
                    nombre,
                    correo,
                    id_oficina
                },

                client

            );



        await repository.updateRole(

            id,

            id_rol,

            client

        );



        await client.query(
            "COMMIT"
        );



        return usuario;



    }catch(error){


        await client.query(
            "ROLLBACK"
        );


        throw error;


    }finally{


        client.release();

    }


};




// =====================================================
// CAMBIAR PASSWORD
// =====================================================

const changePassword = async(
    id,
    password
)=>{


    const usuario =
        await repository.findById(
            id
        );


    if(!usuario){

        throw new Error(
            "Usuario no encontrado"
        );

    }



    const password_hash =
        await bcrypt.hash(
            password,
            10
        );



    return await repository.changePassword(

        id,

        password_hash

    );


};




// =====================================================
// CAMBIAR ESTADO
// =====================================================

const changeStatus = async(
    id,
    estado
)=>{


    const usuario =
        await repository.findById(
            id
        );


    if(!usuario){

        throw new Error(
            "Usuario no encontrado"
        );

    }



    return await repository.changeStatus(

        id,

        estado

    );


};




// =====================================================
// ELIMINACIÓN LÓGICA
// =====================================================

const remove = async(
    id
)=>{


    const usuario =
        await repository.findById(
            id
        );


    if(!usuario){

        throw new Error(
            "Usuario no encontrado"
        );

    }



    return await repository.remove(
        id
    );


};




// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    create,
    findAll,
    findById,
    update,
    changePassword,
    changeStatus,
    remove

};