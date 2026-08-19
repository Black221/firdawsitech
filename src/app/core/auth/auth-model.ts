export interface UserCredentials {
    username: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    company?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}