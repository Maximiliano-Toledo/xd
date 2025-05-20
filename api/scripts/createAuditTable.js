const { pool } = require('../config/db');

async function createAuditTable() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        details JSON,
        operation_description VARCHAR(255),
        timestamp DATETIME NOT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        severity VARCHAR(20) DEFAULT 'info',
        session_id VARCHAR(100) DEFAULT NULL,
        INDEX (user_id),
        INDEX (entity_type, entity_id),
        INDEX (operation_description),
        INDEX (timestamp),
        INDEX (severity),
        INDEX (action)
      )
    `);
        console.log('Tabla de auditoría creada o verificada correctamente');

        // Comprobar si las columnas nuevas ya existen
        const [columns] = await pool.query(`
            SHOW COLUMNS FROM audit_logs 
            WHERE Field IN ('operation_description', 'ip_address', 'user_agent', 'severity', 'session_id')
        `);

        // Si no existen todas las columnas nuevas, agregarlas
        if (columns.length < 5) {
            console.log('Agregando columnas adicionales a la tabla audit_logs...');
            try {
                await pool.query(`
                    ALTER TABLE audit_logs
                    ADD COLUMN IF NOT EXISTS operation_description VARCHAR(255) AFTER details,
                    ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL,
                    ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT NULL,
                    ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'info',
                    ADD COLUMN IF NOT EXISTS session_id VARCHAR(100) DEFAULT NULL
                `);
                console.log('Columnas adicionales agregadas correctamente');
            } catch (alterError) {
                console.error('Error al agregar columnas adicionales:', alterError);
            }
        }
    } catch (error) {
        console.error('Error al crear tabla de auditoría:', error);
    } finally {
        process.exit();
    }
}

createAuditTable();