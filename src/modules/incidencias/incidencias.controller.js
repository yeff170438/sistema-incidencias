const service = require('./incidencias.service');



// =====================================
// Registrar incidencia
// =====================================
const create = async (req, res) => {

    try {

        const data = {

    id_ciudadano:
        req.user.id_ciudadano,

    id_categoria:
        req.body.id_categoria,

    id_sector:
        req.body.id_sector,

    titulo:
        req.body.titulo,

    descripcion:
        req.body.descripcion,

    direccion_texto:
        req.body.direccion_texto,

    referencia:
        req.body.referencia,

    longitud:
        req.body.longitud,

    latitud:
        req.body.latitud

};

        const incidencia =
            await service.create(data);


        return res.status(201).json(
            incidencia
        );


    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};




// =====================================
// Listar incidencias de un ciudadano
// =====================================

const findByCitizen = async (req, res) => {

    try {

        const incidencias =
            await service.findByCitizen(

                req.user.id_ciudadano

            );

        res.json({

            incidencias

        });

    } catch (error) {

        res.status(400).json({

            message:
                error.message

        });

    }

};



// =====================================
// Obtener incidencia por ID
// =====================================

const findById = async(req,res)=>{

    try{

        const incidencia =
            await service.findById(

                req.params.id,

                req.user.id_ciudadano

            );

        res.json({

            incidencia

        });

    }catch(error){

        res.status(403).json({

            message:
                error.message

        });

    }

};




// =====================================
// Listar incidencias pendientes
// =====================================

const findPending = async (req, res) => {

    try {

        const incidencias =
            await service.findPending();



        res.json({

            incidencias

        });

    } catch (error) {

        res.status(500).json({

            message:
                error.message

        });

    }

};




// =====================================
// Validar incidencia
// =====================================

const validateIncident = async (req, res) => {

    try {

        const incidencia =
            await service.validateIncident(

                req.params.id,

                req.user.id_usuario

            );


        res.json({

            message:
                "Incidencia validada correctamente",

            incidencia

        });

    } catch (error) {

        res.status(400).json({

            message:
                error.message

        });

    }

};
// =====================================
// Observar incidencia
// =====================================

const observeIncident = async(req,res)=>{


    try{


        const observacion =

            await service.observeIncident({

                id_incidencia:
                    req.params.id,


                id_usuario:
                    req.user.id_usuario,


                id_motivo:
                    req.body.id_motivo,


                comentario:
                    req.body.comentario

            });




        return res.json({

            message:

                "Incidencia observada correctamente",


            observacion

        });



    }catch(error){


        return res.status(400).json({

            message:

                error.message

        });


    }


};


// =====================================
// Corregir incidencia observada
// =====================================

const correctIncident = async(req,res)=>{


    try{


        const incidencia =

            await service.correctIncident({

                id_incidencia:
                    req.params.id,


                id_ciudadano:
                    req.user.id_ciudadano,


                id_categoria:
                    req.body.id_categoria,


                id_sector:
                    req.body.id_sector,


                titulo:
                    req.body.titulo,


                descripcion:
                    req.body.descripcion,


                direccion_texto:
                    req.body.direccion_texto,


                referencia:
                    req.body.referencia,


                longitud:
                    req.body.longitud,


                latitud:
                    req.body.latitud

            });





        return res.json({

            message:

                "Incidencia corregida correctamente. Fue enviada nuevamente para validación.",


            incidencia

        });



    }catch(error){


        return res.status(400).json({

            message:

                error.message

        });


    }


};

// =====================================
// Rechazar incidencia
// =====================================

const rejectIncident = async (req, res) => {

    try {

        const resultado =

            await service.rejectIncident(

                req.params.id,

                req.user.id_usuario

            );


        return res.json({

            message:
                "Incidencia rechazada correctamente",

            incidencia:
                resultado

        });


    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};




// =====================================
// Exportar
// =====================================
module.exports = {

    create,

    findByCitizen,

    findById,

    findPending,

    validateIncident,

    observeIncident,

    correctIncident,

    rejectIncident,
    

};