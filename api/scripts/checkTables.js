const { pool } = require('../config/db');

async function checkTables() {
    try {
        // Obtener el nombre de la base de datos actual
        const [dbResult] = await pool.query('SELECT DATABASE() as dbname');
        const dbName = dbResult[0].dbname;

        console.log(`Base de datos actual: ${dbName}`);

        // Consultar las tablas existentes
        const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbName]);

        console.log('\nTablas existentes en la base de datos:');
        if (tables.length === 0) {
            console.log('No se encontraron tablas en la base de datos');
        } else {
            tables.forEach((table, index) => {
                console.log(`- ${index + 1}. ${table.TABLE_NAME}`);
            });
        }

        // Tablas necesarias para el sistema
        const requiredTables = [
            'users', 'planes', 'categorias_prestador', 'especialidades',
            'provincias', 'localidades', 'prestadores', 'prestador_plan',
            'prestador_categoria', 'prestador_especialidad', 'audit_logs'
        ];

        console.log('\nVerificación de tablas requeridas:');

        // Crear un array con los nombres de las tablas existentes
        const existingTables = tables.map(t => t.TABLE_NAME ? t.TABLE_NAME.toLowerCase() : null).filter(Boolean);

        for (const table of requiredTables) {
            if (existingTables.includes(table.toLowerCase())) {
                console.log(`✅ ${table} - Presente`);
            } else {
                console.log(`❌ ${table} - Falta`);
            }
        }

        // Mostrar estadísticas
        console.log('\nResumen:');
        const presentCount = requiredTables.filter(table =>
            existingTables.includes(table.toLowerCase())
        ).length;

        console.log(`Tablas presentes: ${presentCount} de ${requiredTables.length}`);
        console.log(`Tablas faltantes: ${requiredTables.length - presentCount}`);

    } catch (error) {
        console.error('Error al verificar tablas:', error);
    } finally {
        process.exit();
    }
}

checkTables();