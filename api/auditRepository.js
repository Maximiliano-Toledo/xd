const { pool } = require('../config/db');

const AuditRepository = {
    async getLogs(limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    },

    async getLogsByEntity(entityType, limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      WHERE 
        entity_type = ? 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [entityType, limit, offset]
        );
        return rows;
    },

    async getLogsByAction(action, limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      WHERE 
        action = ? 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [action, limit, offset]
        );
        return rows;
    },

    async getLogsByUser(userId, limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      WHERE 
        user_id = ? 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        return rows;
    },

    async getLogsByEntityId(entityType, entityId, limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      WHERE 
        entity_type = ? AND entity_id = ? 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [entityType, entityId, limit, offset]
        );
        return rows;
    },

    async getLogsByDateRange(startDate, endDate, limit = 100, offset = 0) {
        const [rows] = await pool.query(
            `SELECT 
        id, 
        user_id, 
        action, 
        entity_type, 
        entity_id, 
        details, 
        timestamp 
      FROM 
        audit_logs 
      WHERE 
        timestamp BETWEEN ? AND ? 
      ORDER BY 
        timestamp DESC 
      LIMIT ? OFFSET ?`,
            [startDate, endDate, limit, offset]
        );
        return rows;
    },

    async getLogCount() {
        const [result] = await pool.query(
            `SELECT COUNT(*) as count FROM audit_logs`
        );
        return result[0].count;
    },

    async getLogCountByEntity(entityType) {
        const [result] = await pool.query(
            `SELECT COUNT(*) as count FROM audit_logs WHERE entity_type = ?`,
            [entityType]
        );
        return result[0].count;
    },

    async getLogCountByAction(action) {
        const [result] = await pool.query(
            `SELECT COUNT(*) as count FROM audit_logs WHERE action = ?`,
            [action]
        );
        return result[0].count;
    }
};

module.exports = AuditRepository;