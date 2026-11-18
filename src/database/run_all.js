const fs = require('fs');
const path = require('path');
const pool = require('./database');


// =====================================================
// EJECUTAR ARCHIVO SQL
// =====================================================

async function runFile(file) {

  console.log(`\nEjecutando: ${file}`);

  const rutaArchivo = path.join(
    __dirname,
    file
  );

  const sql = fs.readFileSync(
    rutaArchivo,
    'utf8'
  );

  try {

    await pool.query(sql);

    console.log(`OK: ${file}`);

  } catch (err) {

    console.error(
      `ERROR en ${file}:`,
      err.message
    );

    throw err;
  }
}


// =====================================================
// CARGAR GEOMETRÍA DE SANTIAGO
// =====================================================

async function cargarDistritoSantiago() {

  console.log(
    '\nCargando geometría del distrito de Santiago...'
  );

  const archivo = path.join(
    __dirname,
    'geodata',
    'santiago_distrito.geojson'
  );


  if (!fs.existsSync(archivo)) {

    throw new Error(
      `No se encontró el archivo GeoJSON:\n${archivo}`
    );

  }


  const contenido = fs.readFileSync(
    archivo,
    'utf8'
  );


  let geojson;

  try {

    geojson = JSON.parse(
      contenido
    );

  } catch {

    throw new Error(
      'El archivo santiago_distrito.geojson no contiene un JSON válido.'
    );

  }


  if (
    !geojson.features ||
    geojson.features.length === 0
  ) {

    throw new Error(
      'El GeoJSON de Santiago no contiene ninguna geometría.'
    );

  }


  const feature =
    geojson.features[0];


  if (!feature.geometry) {

    throw new Error(
      'La entidad GeoJSON de Santiago no contiene geometría.'
    );

  }


  const geometria =
    JSON.stringify(
      feature.geometry
    );


  const query = `
    UPDATE distrito_referencia
    SET
      geometria = ST_Multi(
        ST_SetSRID(
          ST_GeomFromGeoJSON($1),
          4326
        )
      )
    WHERE
      ubigeo = '080106';
  `;


  const resultado =
    await pool.query(
      query,
      [geometria]
    );


  if (
    resultado.rowCount === 0
  ) {

    throw new Error(
      'No se encontró el registro del distrito Santiago con UBIGEO 080106.'
    );

  }


  console.log(
    'OK: Geometría del distrito de Santiago cargada correctamente.'
  );

}


// =====================================================
// VERIFICAR GEOMETRÍA
// =====================================================

async function verificarDistritoSantiago() {

  const query = `
    SELECT
      id_distrito,
      ubigeo,
      nombre,
      ST_GeometryType(geometria)
        AS tipo_geometria,
      ST_SRID(geometria)
        AS srid,
      ST_IsEmpty(geometria)
        AS geometria_vacia,
      ST_IsValid(geometria)
        AS geometria_valida
    FROM distrito_referencia
    WHERE
      ubigeo = '080106';
  `;


  const { rows } =
    await pool.query(
      query
    );


  if (
    rows.length === 0
  ) {

    throw new Error(
      'No existe Santiago en distrito_referencia.'
    );

  }


  const distrito =
    rows[0];


  console.log(
    '\nVerificación territorial:'
  );


  console.table({
    id_distrito:
      distrito.id_distrito,

    ubigeo:
      distrito.ubigeo,

    nombre:
      distrito.nombre,

    tipo_geometria:
      distrito.tipo_geometria,

    srid:
      distrito.srid,

    geometria_vacia:
      distrito.geometria_vacia,

    geometria_valida:
      distrito.geometria_valida
  });


  if (
    distrito.geometria_vacia
  ) {

    throw new Error(
      'La geometría de Santiago está vacía.'
    );

  }


  if (
    !distrito.geometria_valida
  ) {

    throw new Error(
      'La geometría de Santiago no es válida.'
    );

  }

}


// =====================================================
// PROCESO PRINCIPAL
// =====================================================

async function main() {

  console.log(
    '\n=============================================='
  );

  console.log(
    ' SISTEMA DE GESTIÓN DE INCIDENCIAS URBANAS V5'
  );

  console.log(
    ' Instalación de base de datos'
  );

  console.log(
    '=============================================='
  );


  const files = [

    '01_extensions.sql',

    '02_schema_base.sql',

    '03_catalogos.sql',

    '04_operacion.sql',

    '05_archivos.sql',

    '06_comunicacion.sql',

    '07_auditoria.sql',

    '08_seed.sql',

    '09_observaciones.sql',

    '10_test_data.sql'

  ];


  try {

    // =============================================
    // SCRIPTS SQL
    // =============================================

    for (
      const file of files
    ) {

      await runFile(
        file
      );

    }


    // =============================================
    // GEOMETRÍA DE SANTIAGO
    // =============================================

    await cargarDistritoSantiago();


    // =============================================
    // VERIFICACIÓN
    // =============================================

    await verificarDistritoSantiago();


    console.log(
      '\n=============================================='
    );

    console.log(
      ' BASE DE DATOS INSTALADA CORRECTAMENTE'
    );

    console.log(
      '==============================================\n'
    );

  } catch (error) {

    console.error(
      '\n=============================================='
    );

    console.error(
      ' ERROR DURANTE LA INSTALACIÓN'
    );

    console.error(
      '=============================================='
    );

    console.error(
      error.message
    );

    process.exitCode = 1;

  } finally {

    await pool.end();

  }

}


// =====================================================
// EJECUTAR
// =====================================================

main();