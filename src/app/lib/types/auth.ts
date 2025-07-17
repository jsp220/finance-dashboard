import { User } from "@/src/app/lib/types/user";

export interface JWTPayload extends User {
    iat: number;
    exp: number;
}

export interface LoginResponse {
    message: string;
    user: User;
    token: string;
}
