// import { pool } from "@config/database.config.js";

// async function createUsers () {
//     const db = await pool.connect();
//     try {
//         console.log("Connected to database");

//         const createUsers = `
//             CREATE TABLE IF NOT EXISTS users 
//             (
//                 id uuid PRIMARY KEY,
//                 name VARCHAR(100),
//                 email VARCHAR(255) UNIQUE NOT NULL, 
//                 password TEXT NOT NULL, 

//                 is_active BOOLEAN DEFAULT FALSE,

//                 address VARCHAR(100),
//                 phone_number VARCHAR(15),

//                 avatar_url VARCHAR(255),

//                 role_id UUID NOT NULL REFERENCES roles(id),
//                 dep_id UUID REFERENCES departments(id) ,

//                 email_verified BOOLEAN DEFAULT FALSE,
//                 email_verified_at TIMESTAMPTZ,

//                 password_reset_at TIMESTAMPTZ,
//                 failed_login_attempts INT DEFAULT 0,
//                 locked_until TIMESTAMPTZ,

//                 auth_provider VARCHAR(20) DEFAULT 'local' NOT NULL,
//                 google_id VARCHAR(255) UNIQUE,

//                 created_at TIMESTAMPTZ DEFAULT NOW(),
//                 updated_at TIMESTAMPTZ DEFAULT NOW()
//             )
//         `;

//         const createIndexes = `
//             CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
//             CREATE INDEX IF NOT EXISTS idx_users_dep_id ON users(dep_id);
//             CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
//         `;

//         await db.query(createUsers);
//         console.log("Users table connected successfully");
//         await db.query(createIndexes);
//         console.log("Index for users created");
//     } catch (err) {
//         console.error("Error creating users table", err);
//     } finally {
//         db.release();
//         // await pool.end();
//     }
// }

// createUsers();
// //  timestamptz -> timestampt with time zone. no need for sepearate time zone related logic. 