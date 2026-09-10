require('dotenv').config();

const pool =
    require('./database');

const testConnection = async () => {

    try {

        const client =
            await pool.connect();

        console.log(
            'Conectado a PostgreSQL correctamente'
        );

        client.release();

    } catch (error) {

        console.error(
            'Error de conexión:',
            error.message
        );

    } finally {

        await pool.end();

    }

};

testConnection();