import { Pool } from 'pg';
import env from './env.config.js';

const dbConfig: any = {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    database: env.DB_NAME,
    
    // PostgreSQL (pg) Pool Configuration
    max: 20, // Equivalent to connectionLimit
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    keepAlive: true, // Equivalent to enableKeepAlive
};

if (env.DB_PASS && env.DB_PASS.length > 0) dbConfig.password = env.DB_PASS;

export const pool = new Pool(dbConfig);

export const testConnection =  async ()=> {
    try {
        // simple query verifies connection and auth
        await pool.query('SELECT 1');
        console.log("Database connected successfully");
    } catch (err: any) {
        console.error("Error connecting to database", err.message || err);
        throw err;
    } finally {
        try { await pool.end(); } catch {}
    }
}