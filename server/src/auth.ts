import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { pool } from '@config/database.config.js';
import crypto from 'crypto';
import env from '@config/env.config.js';

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
    console.log("Req body: ", req.body);
    // console.log("req params: ", req.params);

    try {
        const { name, email, newPassword, confirmPassword } = req.body;
        
        if(!name) return res.status(400).json({ message: "Name is required" });
        if(!email) return res.status(400).json({ message: "Email is required" });
        if(!newPassword) return res.status(400).json({ message: "Password is required" });
    
        if(newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: "false", 
                message: "Password doesn't match" 
            });
        }

        const users = 'SELECT id FROM users WHERE email=$1';
        const usersByEmail = await pool.query(users, [email]);
        
        if(usersByEmail.rows.length > 0) {
            return res.status(409).json({ 
                success: "false", 
                message: "User with this message already exists" 
            });
        };


        const hashedPass = await bcrypt.hash(newPassword, 12);
        const id = crypto.randomUUID();

        const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1 LIMIT 1", ['EMPLOYEE']);

        if(roleRes.rows.length === 0) {
            return res.status(500).json({ message: 'default role missing'});
        }

        const role_id = roleRes.rows[0].id;
        await pool.query(`
                INSERT INTO users ( id, name, email, password, role_id )
                VALUES ($1, $2, $3, $4, $5)
            `, [id, name, email, hashedPass, role_id]
            );

            const token = jwt.sign(
                { id, email, } as JwtPayload,
                env.JWT_SECRET as string,
                {
                    expiresIn: env.JWT_EXPIRES_IN as any,
                    algorithm: 'HS256'
                }
            );

            const refreshToken = jwt.sign(
                { id, email, } as JwtPayload,
                env.JWT_REFRESH_SECRET as string,
                {
                    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
                    algorithm: 'HS256'
                }
            );

            res.cookie(
                'accessToken',
                token, 
                {
                    httpOnly: true,
                    sameSite: env.NODE_ENV === 'development' ? 'none': 'lax',
                    maxAge: 1000 * 60 * 15
                }
            )

            res.cookie(
                'refreshToken',
                refreshToken,
                {
                    httpOnly: true,
                    sameSite: env.NODE_ENV === 'development' ? 'none': 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 7
                }
            )

        const result = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
        const user = result.rows[0];

        if (!user) {
            return res.status(500).json({ message: "Registration failed" });
        }

        const { password, ...safeUser } = user; 
        return res.status(201).json({
            success: true,
            data: {
                user: safeUser
            }, 
            message: "Registration successful"
        });
    } catch(err) {
        console.error("Error registering: ", err);  
        return res.status(500).json({ message: "Internal Server Error (register)"})
    }
});

// router.post("/login", (req: Request, res: Response) => {
//     console.log("Req body: ", req.body);
//     console.log("req params: ", req.params);

    
// });

export default router;