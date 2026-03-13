import { pool } from "@config/database.config.js"

const selectUsers = async () => {
    const users = await pool.query('SELECT id, email, name, role_id FROM users');

    return users.rows;
}

selectUsers();