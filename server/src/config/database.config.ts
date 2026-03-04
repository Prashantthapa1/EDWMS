import { Pool } from 'pg';
import env from './env.config.js';

// const dbConfig = {
//     host: process.env['DB_HOST'] || 'localhost',
//     port: Number(process.env['DB_PORT']) ||  5432,
//     user: process.env['DB_USER'] || "root",
//     password: process.env['DB_PASS'],
//     database: process.env['DB_NAME'] || 'edwms',
// }

const dbConfig: any = {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    database: env.DB_NAME
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

//  way to create connection with database. 
// $env:PGPASSWORD="postgres"
// & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE your_db_name;"

//  way to run migrate
// $env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/edwms"
// npx node-pg-migrate up