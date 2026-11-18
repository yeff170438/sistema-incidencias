const service = require('./admin.service');

// =====================================================
// DASHBOARD
// =====================================================

const getDashboard = async (req, res) => {

    try {

        const data =
            await service.getDashboard();

        return res.status(200).json({

            ok: true,

            data

        });

    } catch (error) {

        console.error(
            'Error en dashboard administrativo:',
            error
        );

        return res.status(500).json({

            ok: false,

            message:
                'Error al obtener el dashboard administrativo'

        });

    }

};


module.exports = {

    getDashboard

};