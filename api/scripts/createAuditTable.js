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
        timestamp DATETIME NOT NULL,
        INDEX (user_id),
        INDEX (entity_type, entity_id),
        INDEX (timestamp)
      )
    `);
        console.log('Tabla de auditoría creada o verificada correctamente');
    } catch (error) {
        console.error('Error al crear tabla de auditoría:', error);
    } finally {
        process.exit();
    }
}

createAuditTable();