const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const { secret } = require("../config/jwt");

class AuditRepository {
    static async verifyTokenAndGetUserId(accessToken) {
        if (!accessToken) return null;
        
        try {
            const decoded = jwt.verify(accessToken, secret);
            return decoded.id;
        } catch (error) {
            console.error('Error verifying access token:', error);
            return null;
        }
    }

    static async buildQueryWithAuthFilter(baseQuery, accessToken, params = []) {
        const userId = await this.verifyTokenAndGetUserId(accessToken);
        
        // Si es el admin (userId = 1), no aplicar ningún filtro
        if (userId === 1) {
            return {
                query: baseQuery,
                params
            };
        }
        
        // Para otros usuarios, excluir registros del admin (user_id = 1)
        const whereClause = baseQuery.includes('WHERE') ? ' AND user_id <> 1' : ' WHERE user_id <> 1';
        
        return {
            query: baseQuery + whereClause,
            params
        };
    }

    static async getLogs(accessToken, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
            id, 
            user_id, 
            action, 
            entity_type, 
            entity_id, 
            details, 
            timestamp 
          FROM 
            audit_logs`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogsByEntity(accessToken, entityType, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
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
            entity_type = ?`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [entityType]
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogsByAction(accessToken, action, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
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
            action = ?`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [action]
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogsByUser(accessToken, userId, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
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
            user_id = ?`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [userId]
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogsByEntityId(accessToken, entityType, entityId, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
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
            entity_type = ? AND entity_id = ?`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [entityType, entityId]
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogsByDateRange(accessToken, startDate, endDate, limit = 100, offset = 0) {
        const baseQuery = `SELECT 
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
            timestamp BETWEEN ? AND ?`;
        
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [startDate, endDate]
        );
        
        const fullQuery = query + ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        const [rows] = await pool.query(fullQuery, [...params, limit, offset]);
        return rows;
    }

    static async getLogCount(accessToken) {
        const baseQuery = `SELECT COUNT(*) as count FROM audit_logs`;
        const { query, params } = await this.buildQueryWithAuthFilter(baseQuery, accessToken);
        
        const [result] = await pool.query(query, params);
        return result[0].count;
    }

    static async getLogCountByEntity(accessToken, entityType) {
        const baseQuery = `SELECT COUNT(*) as count FROM audit_logs WHERE entity_type = ?`;
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [entityType]
        );
        
        const [result] = await pool.query(query, params);
        return result[0].count;
    }

    static async getLogCountByAction(accessToken, action) {
        const baseQuery = `SELECT COUNT(*) as count FROM audit_logs WHERE action = ?`;
        const { query, params } = await this.buildQueryWithAuthFilter(
            baseQuery, 
            accessToken, 
            [action]
        );
        
        const [result] = await pool.query(query, params);
        return result[0].count;
    }
}

module.exports = AuditRepository;