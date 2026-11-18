const PDFDocument = require('pdfkit');

const texto = (valor, alternativo = 'No consignado') => {
    if (valor === null || valor === undefined || valor === '') {
        return alternativo;
    }

    return String(valor);
};

const fechaLocal = (valor) => {
    if (!valor) return 'No consignada';

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
        return String(valor);
    }

    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'long',
        timeZone: 'America/Lima'
    }).format(fecha);
};

const generarSolicitudAdministrativa = (data) => {
    const doc = new PDFDocument({
        size: 'A4',
        margins: {
            top: 48,
            bottom: 48,
            left: 52,
            right: 52
        },
        info: {
            Title: 'Solicitud administrativa de incidencia urbana',
            Author: 'Sistema de Gestion de Incidencias Urbanas',
            Subject: 'Solicitud administrativa SAIU'
        }
    });

    const ancho = doc.page.width - 104;

    const tituloSeccion = (titulo) => {
        doc.moveDown(0.8);
        doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor('#1F513F')
            .text(titulo.toUpperCase(), { width: ancho });

        doc
            .moveDown(0.25)
            .strokeColor('#A8BDB2')
            .lineWidth(0.8)
            .moveTo(52, doc.y)
            .lineTo(doc.page.width - 52, doc.y)
            .stroke();

        doc.moveDown(0.45);
    };

    const campo = (etiqueta, valor, alternativo) => {
        doc.font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#333333')
            .text(`${etiqueta}:`, { continued: true });

        doc.font('Helvetica')
            .fontSize(9)
            .fillColor('#222222')
            .text(` ${texto(valor, alternativo)}`, {
                width: ancho
            });

        doc.moveDown(0.3);
    };

    const saiu = data.saiu || {};
    const ticket = data.ticket || {};
    const ciudadano = data.ciudadano || {};
    const incidencia = data.incidencia || {};
    const oficina = data.oficina_responsable || {};

    doc
        .font('Helvetica-Bold')
        .fontSize(15)
        .fillColor('#1F513F')
        .text('SOLICITUD ADMINISTRATIVA', {
            align: 'center',
            width: ancho
        });

    doc
        .moveDown(0.3)
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#555555')
        .text('Registro de incidencia urbana georreferenciada', {
            align: 'center',
            width: ancho
        });

    doc.moveDown(0.8);

    doc
        .roundedRect(52, doc.y, ancho, 56, 5)
        .fill('#F0F5F1');

    const yCodigo = doc.y + 11;

    doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#333333')
        .text('CODIGO SAIU', 64, yCodigo);

    doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#1F513F')
        .text(texto(saiu.codigo_saiu), 64, yCodigo + 16);

    doc.y = yCodigo + 62;

    campo('Fecha de generación', fechaLocal(saiu.fecha_generacion));
    campo('Estado de la solicitud', saiu.estado);
    campo('Código de ticket', ticket.codigo_ticket);
    campo('Número de expediente', saiu.numero_expediente);
    campo('Fecha de expediente', fechaLocal(saiu.fecha_expediente));

    tituloSeccion('I. Datos del ciudadano');

    campo(
        'Nombres y apellidos',
        [
            ciudadano.nombres,
            ciudadano.apellido_paterno,
            ciudadano.apellido_materno
        ].filter(Boolean).join(' ')
    );
    campo('DNI', ciudadano.dni);
    campo('Teléfono', ciudadano.telefono);
    campo('Correo electrónico', ciudadano.correo);

    tituloSeccion('II. Detalle de la incidencia');

    campo('Título', incidencia.titulo);
    campo('Categoría', incidencia.categoria);
    campo('Dirección o ubicación textual', incidencia.direccion_texto);
    campo('Referencia', incidencia.referencia);

    if (
        incidencia.latitud !== null &&
        incidencia.latitud !== undefined &&
        incidencia.longitud !== null &&
        incidencia.longitud !== undefined
    ) {
        campo(
            'Coordenadas (latitud, longitud)',
            `${incidencia.latitud}, ${incidencia.longitud}`
        );
    }

    doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#333333')
        .text('Descripción:', { width: ancho });

    doc
        .moveDown(0.25)
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#222222')
        .text(texto(incidencia.descripcion), {
            width: ancho,
            align: 'justify',
            lineGap: 2
        });

    tituloSeccion('III. Derivación administrativa');

    campo('Oficina responsable', oficina.nombre);
    campo('Modalidad de atención', ticket.modalidad_atencion);

    doc.moveDown(0.8);

    const aviso = 'IMPORTANTE: Este documento ha sido generado por el sistema. Por sí solo, no acredita la recepción del expediente por Mesa de Partes ni la resolución de la incidencia. La recepción y el registro del expediente deberán confirmarse mediante el procedimiento administrativo correspondiente.';

    const avisoY = doc.y;
    const avisoAlto = doc.heightOfString(aviso, {
        width: ancho - 20,
        font: 'Helvetica',
        fontSize: 8,
        lineGap: 2
    }) + 20;

    doc
        .roundedRect(52, avisoY, ancho, avisoAlto, 4)
        .fill('#F7F4E9');

    doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#514B37')
        .text(aviso, 62, avisoY + 10, {
            width: ancho - 20,
            align: 'justify',
            lineGap: 2
        });

    doc.y = avisoY + avisoAlto + 28;

    if (doc.y > doc.page.height - 125) {
        doc.addPage();
    }

    const firmaY = Math.max(doc.y, doc.page.height - 112);
    const mitad = ancho / 2;

    doc
        .moveTo(52, firmaY)
        .lineTo(52 + mitad - 18, firmaY)
        .strokeColor('#777777')
        .stroke();

    doc
        .moveTo(70 + mitad, firmaY)
        .lineTo(doc.page.width - 52, firmaY)
        .stroke();

    doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#555555')
        .text('Firma del solicitante', 52, firmaY + 7, {
            width: mitad - 18,
            align: 'center'
        });

    doc
        .text('Recepción / sello de la oficina', 70 + mitad, firmaY + 7, {
            width: mitad - 18,
            align: 'center'
        });

    doc
        .fontSize(7)
        .fillColor('#777777')
        .text(
            `Documento generado por el sistema | SAIU: ${texto(saiu.codigo_saiu)}`,
            52,
            doc.page.height - 35,
            {
                width: ancho,
                align: 'center'
            }
        );

    return doc;
};

module.exports = generarSolicitudAdministrativa;
