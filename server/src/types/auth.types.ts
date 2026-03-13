
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role_id: string;
  dep_id?: string | null;
  is_active: boolean;
  address?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  auth_provider: 'local' | 'GOOGLE';
  google_id?: string | null;
  email_verified: boolean;
  email_verified_at?: Date | null;
  failed_login_attempts: number;
  locked_until?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface registerUserDTO {
    name: string;
    email: string;
    newPassword: string;
    confirmPassword: string;
}

export type UserWithoutPassword = Omit<User, 'password'>;
export type PublicUser = Omit<User, 'password' | 'failed_login_attempts' | 'locked_until' | 'google_id'>

export interface TokenPayload  {
    id: string;
    email: string;
    role_id: string;
};

export interface RefreshTokenPayload {
    id: string;
    token_id: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    user: PublicUser;
    tokens: Tokens;
}

export interface deviceMetadata {
    ip?: string | undefined;
    user_agent?: string | undefined;
}