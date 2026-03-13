import type { Pool } from "pg";

export class BaseRepository<T> {

    protected tableName: string;
    protected db: Pool;

    constructor (tableName: string, db: Pool) {
        this.tableName = tableName;
        this.db = db;
    }

    async create(data: Partial<T>): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);

        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

        // await this.db.query('BEFGIN')
        const query = `
            INSERT INTO ${this.tableName} (${keys.join(", ")})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0];
    };

    async findOne(field: string, value: any) : Promise<T | null> {

        const query = `SELECT * FROM ${this.tableName} WHERE ${field}=$1 `;

        const result = await this.db.query(query, [value]);
        return result.rows[0] || null;
    };

    async findByEmail(email: string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE email=$1`;
        const result = await this.db.query(query, [email]);
        return result.rows[0] || null;
    }   

    async findById(id: string): Promise<T | null> {
        const query = `SELECT * FROM ${this.tableName} WHERE id=$1`;
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    } 

    async checkExisting(email: string): Promise<Boolean> {
        const result = await this.db.query( `SELECT * FROM users WHERE email=$1`, [email]);
        return result.rows.length > 0;
    }
    
}