// =====================================
// COMUNICACIONES VALIDATOR
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
        text.length > maxLength
    ) {

        throw new Error(
            `${field} no puede superar los ${maxLength} caracteres`
        );

    }


    return text;

};



// =====================================
// VALIDAR TIPO EMISOR
// =====================================

const validateTipoEmisor = (
    value
) => {

    const tipo =
        validateText(
            value,
            'tipo_emisor',
            20
        ).toUpperCase();


    const tiposPermitidos = [

        'USUARIO',

        'CIUDADANO',

        'SISTEMA'

    ];


    if (
        !tiposPermitidos.includes(tipo)
    ) {

        throw new Error(
            'El tipo_emisor debe ser USUARIO, CIUDADANO o SISTEMA'
        );

    }


    return tipo;

};



// =====================================
// VALIDAR ID OPCIONAL
// =====================================

const validateOptionalPositiveInteger = (
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


    return validatePositiveInteger(
        value,
        field
    );

};



// =====================================
// VALIDAR CREACIÓN
// =====================================

const validateCreate = (
    data
) => {

    if (
        !data ||
        typeof data !== 'object'
    ) {

        throw new Error(
            'Los datos de la comunicación son obligatorios'
        );

    }


    const id_ticket =
        validatePositiveInteger(
            data.id_ticket,
            'id_ticket'
        );


    const tipo_emisor =
        validateTipoEmisor(
            data.tipo_emisor
        );


    const id_usuario =
        validateOptionalPositiveInteger(
            data.id_usuario,
            'id_usuario'
        );


    const id_ciudadano =
        validateOptionalPositiveInteger(
            data.id_ciudadano,
            'id_ciudadano'
        );


    const mensaje =
        validateText(
            data.mensaje,
            'mensaje',
            5000
        );


    // =====================================
    // VALIDAR RELACIÓN DEL EMISOR
    // =====================================

    if (
        tipo_emisor === 'USUARIO' &&
        !id_usuario
    ) {

        throw new Error(
            'Debe indicar el usuario emisor'
        );

    }


    if (
        tipo_emisor === 'CIUDADANO' &&
        !id_ciudadano
    ) {

        throw new Error(
            'Debe indicar el ciudadano emisor'
        );

    }


    // =====================================
    // SISTEMA NO TIENE EMISOR
    // =====================================

    if (
        tipo_emisor === 'SISTEMA'
    ) {

        return {

            id_ticket,

            tipo_emisor,

            id_usuario: null,

            id_ciudadano: null,

            mensaje

        };

    }


    // =====================================
    // USUARIO
    // =====================================

    if (
        tipo_emisor === 'USUARIO'
    ) {

        return {

            id_ticket,

            tipo_emisor,

            id_usuario,

            id_ciudadano: null,

            mensaje

        };

    }


    // =====================================
    // CIUDADANO
    // =====================================

    return {

        id_ticket,

        tipo_emisor,

        id_usuario: null,

        id_ciudadano,

        mensaje

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
// EXPORTAR
// =====================================

module.exports = {

    validateCreate,

    validateId

};