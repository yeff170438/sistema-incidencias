const request = require('supertest');

const app = require('../app');


describe('Servidor API', () => {

    test('GET a una ruta inexistente debe devolver 404', async () => {

        const response = await request(app)
            .get('/api/ruta-que-no-existe');

        expect(response.statusCode).toBe(404);

        expect(response.body).toHaveProperty(
            'mensaje',
            'Ruta no encontrada'
        );

    });

});