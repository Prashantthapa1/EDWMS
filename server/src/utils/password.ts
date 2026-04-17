import bcrypt from 'bcrypt';

export const hashPassword = async (password: string)  => {
    return await bcrypt.hash(password, 12);
}

export const comparePassword = async (password: string, dbPass: string) => {
    return await bcrypt.compare(password, dbPass);
}