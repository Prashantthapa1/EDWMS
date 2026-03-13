import type { PublicUser, User, UserDTO } from "src/types/auth.types.js";
import { BaseRepository } from "../BaseRepository.js";
import { pool } from "@config/database.config.js";
import { generateUUID } from "@utils/uuid.js";

class AuthRepository extends BaseRepository<User>{
    constructor() {
        super("users", pool);
    };

    async createUser(userDTO: UserDTO): Promise<PublicUser> {
        try {
            console.log("creating user")
            const rolesRes = await pool.query('SELECT id FROM roles WHERE name=$1', ['EMPLOYEE']);
            // console.log("Roles id metadata: ", rolesRes);

            if(rolesRes.rows.length ===  0) {
                throw new Error("Role id not found");
            }

            const role_id = rolesRes.rows[0].id;

            console.log("find role id to0", role_id);
            const id = generateUUID();
            console.log("created user id", id);
            const newUser = await this.create({
                id: id,
                name: userDTO.name,
                email: userDTO.email,
                password: userDTO.password,
                role_id: role_id
            });

            console.log("new User: ", newUser.id);
            console.log("new user email: ", newUser.email);
            console.log("pass", newUser.password);
            console.log("role id: ", newUser.role_id);

            console.log("safeuser", this.safeUser(newUser));
            return this.safeUser(newUser);
        } catch (err) {
            throw new Error(`Error registering user: ${err}`);
        }
    }

    async storeRefreshTokens(data: {
        id: string,
        user_id: string,
        token_hash: string,
        ip?: string | undefined,
        user_agent?: string | undefined
    }) {
        await pool.query(
            `INSERT INTO refresh_tokens (id, user_id, token_hash, ip_address, user_agent, created_at, expires_at)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '7 days')
            `,
            [data.id, data.user_id, data.token_hash, data.ip ?? null, data.user_agent ?? null]
        );
    } 

    async increaseFailedAttempt(user_id: string): Promise<number> {
        const result = await this.db.query(`
            UPDATE users 
                SET failed_login_attempts = failed_login_attempts + 1
                WHERE id = $1
                RETURNING failed_login_attempts`, 
                [user_id]
            );
        return result.rows[0].failed_login_attempts;
    };

    async resetFailedLoginAttempts(user_id: string): Promise<void> {
        await this.db.query(`UPDATE users 
            SET failed_login_attempts = 0
            WHERE id=$1
            `, [user_id]);
    }

    async lockUntil(user_id: string, min = 15): Promise<string> {
        const result = await this.db.query(`
            UPDATE users
             SET locked_until = NOW() + INTERVAL '${min} minutes', 
               failed_login_attempts = 0
             WHERE id = $1
            RETURNING locked_until
            `, [user_id]);
        return result.rows[0].locked_until;
    }

    async revokeRefreshToken(token_id: string): Promise<void> {
        await this.db.query(`UPDATE refresh_tokens  
             SET is_revoked = true, revoked_at = NOW() 
             WHERE id = $1
            `, [token_id]); 
    }

    async revokeAllRefreshToken(user_id: string): Promise<void> {
        await this.db.query(`
            UPDATE refresh_tokens 
             SET is_revoked = true, revoked_at = NOW()
             WHERE user_id = $1
            `, [user_id]);
    };

    async findRefreshToken(id: string) {
        const result = await this.db.query(
            `SELECT token_hash, is_revoked, created_at, expires_at, user_id FROM refresh_tokens WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    async userExist(email: string): Promise<Boolean> {
        return this.checkExisting(email);
    }

    // async lockUser(failed_attempt: number): Promise<> {
    //     const result = await this.db.query(`UPDATE users SET locked_until = NOW() + INITERVAL '15 min`, [failed_attempt]);
    // }

    private safeUser(user: User): PublicUser {
        console.log("Inside of safe user method");
        const { password, failed_login_attempts, locked_until, google_id, ...rest } = user;
        console.log("rest: ", rest);
        return rest as PublicUser;
    }
 
};

export const authRepository = new AuthRepository();