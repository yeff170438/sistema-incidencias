// =====================================
// SOLICITUDES INCIDENCIA VALIDATOR
// =====================================


// =====================================
// VALIDAR ID ENTERO POSITIVO
// =====================================

const validatePositiveInteger = (
    value,
    field
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        throw new Error(
            `${field} es obligatorio`
        );

    }


    const number =
        Number(value);


    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {

        throw new Error(
            `${field} debe ser un entero positivo`
        );

    }


    return number;

};


// =====================================
// VALIDAR TEXTO
// =====================================

const validateText = (
    value,
    field,
    maxLength
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        throw new Error(
            `${field} es obligatorio`
        );

    }


    if (
        typeof value !== 'string'
    ) {

        throw new Error(
            `${field} debe ser texto`
        );

    }


    const text =
        value.trim();


    if (!text) {

        throw new Error(
            `${field} no puede estar vacío`
        );

    }


    if (
        text.length >
        maxLength
    ) {

        throw new Error(
            `${field} no puede superar los ${maxLength} caracteres`
        );

    }


    return text;

};


// =====================================
// VALIDAR TEXTO OPCIONAL
// =====================================

const validateOptionalText = (
    value,
    field,
    maxLength
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        return null;

    }


    if (
        typeof value !== 'string'
    ) {

        throw new Error(
            `${field} debe ser texto`
        );

    }


    const text =
        value.trim();


    if (
        text.length >
        maxLength
    ) {

        throw new Error(
            `${field} no puede superar los ${maxLength} caracteres`
        );

    }


    return text;

};


// =====================================
// VALIDAR CÓDIGO SAIU
// =====================================

const validateCodigoSAIU = (
    value
) => {

    const codigo =
        validateText(
            value,
            'codigo_saiu',
            30
        );


    /*
     * El código generado por el sistema
     * tendrá la estructura:
     *
     * SAIU-123-1234567890123
     *
     * No permitimos espacios ni caracteres
     * especiales arbitrarios.
     */

    const regex =
        /^SAIU-[0-9]+-[0-9]+$/;


    if (
        !regex.test(codigo)
    ) {

        throw new Error(
            'El código SAIU no tiene un formato válido'
        );

    }


    return codigo;

};


// =====================================
// VALIDAR NÚMERO DE EXPEDIENTE
// =====================================

const validateNumeroExpediente = (
    value
) => {

    const expediente =
        validateText(
            value,
            'numero_expediente',
            60
        );


    /*
     * Permitimos formatos habituales de
     * expedientes municipales:
     *
     * 12345-2026
     * EXP-12345
     * 00123-2026-MPS
     *
     * Se permiten:
     * letras
     * números
     * guion
     * barra
     * punto
     */

    const regex =
        /^[A-Za-z0-9][A-Za-z0-9./-]*$/;


    if (
        !regex.test(
            expediente
        )
    ) {

        throw new Error(
            'El número de expediente contiene caracteres no permitidos'
        );

    }


    return expediente;

};


// =====================================
// VALIDAR FECHA
// =====================================

const validateDate = (
    value,
    field
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        return new Date();

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        throw new Error(
            `${field} no contiene una fecha válida`
        );

    }


    return date;

};


// =====================================
// VALIDAR FECHA OPCIONAL
// =====================================

const validateOptionalDate = (
    value,
    field
) => {

    if (
        value === undefined ||
        value === null ||
        value === ''
    ) {

        return null;

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        throw new Error(
            `${field} no contiene una fecha válida`
        );

    }


    return date;

};


// =====================================
// VALIDAR CREACIÓN DE SAIU
// =====================================

// =====================================
// VALIDAR CREACIÓN DE SAIU
// =====================================

const validateCreate = (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la solicitud son obligatorios'
        );

    }


    // =====================================
    // Ticket
    // =====================================

    const id_ticket =
        validatePositiveInteger(
            data.id_ticket,
            'id_ticket'
        );


    // =====================================
    // Oficina opcional
    // =====================================

    let id_oficina = null;


    if (
        data.id_oficina !== undefined &&
        data.id_oficina !== null &&
        data.id_oficina !== ''
    ) {

        id_oficina =
            validatePositiveInteger(
                data.id_oficina,
                'id_oficina'
            );

    }


    // =====================================
    // Observación opcional
    // =====================================

    const observacion =
        validateOptionalText(
            data.observacion,
            'observacion',
            1000
        );


    // =====================================
    // Retornar datos validados
    // =====================================

    return {

        id_ticket,

        id_oficina,

        observacion

    };

};



// =====================================
// VALIDAR REGISTRO DE EXPEDIENTE
// =====================================

const validateRegisterExpediente = (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la solicitud son obligatorios'
        );

    }


    // =====================================
    // CÓDIGO SAIU
    // =====================================

    const codigo_saiu =
        validateCodigoSAIU(
            data.codigo_saiu
        );


    // =====================================
    // NÚMERO DE EXPEDIENTE
    // =====================================

    const numero_expediente =
        validateNumeroExpediente(
            data.numero_expediente
        );


    // =====================================
    // FECHA DE EXPEDIENTE
    // =====================================

    const fecha_expediente =
        validateDate(
            data.fecha_expediente,
            'fecha_expediente'
        );


    // =====================================
    // RETORNAR DATOS VALIDADOS
    // =====================================

    return {

        codigo_saiu,

        numero_expediente,

        fecha_expediente

    };

};



// =====================================
// VALIDAR ID
// =====================================

const validateId = (
    value,
    field
) => {

    return validatePositiveInteger(
        value,
        field
    );

};


// =====================================
// VALIDAR CÓDIGO SAIU DE CONSULTA
// =====================================

const validateCodigoConsulta = (
    value
) => {

    return validateCodigoSAIU(
        value
    );

};

// =====================================
// VALIDAR CORRECCIÓN DE EXPEDIENTE
// =====================================

const validateUpdateExpediente = (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la solicitud son obligatorios'
        );

    }


    // =====================================
    // CÓDIGO SAIU
    // =====================================

    const codigo_saiu =
        validateCodigoSAIU(
            data.codigo_saiu
        );


    // =====================================
    // NUEVO NÚMERO DE EXPEDIENTE
    // =====================================

    const numero_expediente =
        validateNumeroExpediente(
            data.numero_expediente
        );


    // =====================================
    // RETORNAR DATOS VALIDADOS
    // =====================================

    return {

        codigo_saiu,

        numero_expediente

    };

};




// =====================================
// EXPORTAR
// =====================================

module.exports = {

    validateCreate,

    validateRegisterExpediente,

    validateId,

    validateCodigoSAIU,

    validateCodigoConsulta,

    validateNumeroExpediente,

    validateDate,

    validateOptionalDate,

    validateUpdateExpediente

};