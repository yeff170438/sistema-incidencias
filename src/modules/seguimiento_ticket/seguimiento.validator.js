const {
    param
} = require('express-validator');


// =====================================
// Historial del ticket
// =====================================

const findByTicket = [

    param('id_ticket')

        .notEmpty()

        .withMessage(
            'El id_ticket es obligatorio'
        )

        .isInt({ min: 1 })

        .withMessage(
            'El id_ticket debe ser un entero positivo'
        )

];


// =====================================
// EXPORTAR
// =====================================

module.exports = {

    findByTicket

};