import bcryp from 'bcrypt';

export const hashPassword = async (password: string)  => {
    return await bcryp.hash(password, 12);
}

export const comparePassword = async (password: string, dbPass: string) => {
    return await bcryp.compare(password, dbPass);
}