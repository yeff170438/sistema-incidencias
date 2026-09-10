const service =
    require('./seguimiento.service');


// =====================================
// Historial ticket
// =====================================

const findByTicket = async (req, res) => {

    try {

        const historial =
            await service.findByTicket(
                req.params.id_ticket
            );

        return res.status(200).json({

            historial

        });

    } catch (error) {

        return res.status(400).json({

            message:
                error.message

        });

    }

};


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findByTicket

};