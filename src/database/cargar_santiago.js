const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function main() {
    try {

        const archivo = path.join(
            __dirname,
            'geodata',
            'santiago_distrito.geojson'
        );

        if (!fs.existsSync(archivo)) {
            throw new Error(
                `No existe el archivo:\n${archivo}`
            );
        }

        const contenido = fs.readFileSync(
            archivo,
            'utf8'
        );

        const geojson = JSON.parse(contenido);

        if (
            !geojson.features ||
            geojson.features.length === 0
        ) {
            throw new Error(
                'El GeoJSON no contiene ninguna geometría.'
            );
        }

        const feature = geojson.features[0];

        if (!feature.geometry) {
            throw new Error(
                'El GeoJSON no contiene geometría.'
            );
        }

        const geometria = JSON.stringify(
            feature.geometry
        );

        await pool.query(`
            DELETE FROM distrito_referencia
            WHERE ubigeo = '080106';
        `);

        await pool.query(
            `
            INSERT INTO distrito_referencia (
                ubigeo,
                nombre,
                descripcion,
                geometria,
                activo
            )
            VALUES (
                '080106',
                'Santiago',
                'Distrito de Santiago, provincia del Cusco, departamento del Cusco',
                ST_Multi(
                    ST_SetSRID(
                        ST_GeomFromGeoJSON($1),
                        4326
                    )
                ),
                TRUE
            );
            `,
            [geometria]
        );

        console.log(
            '✓ Santiago fue cargado correctamente en PostGIS.'
        );

    } catch (error) {

        console.error(
            '✗ Error:',
            error.message
        );

        process.exitCode = 1;

    } finally {

        await pool.end();

    }
}

main();