import { JWTPayload } from "@/src/app/lib/types/auth";
import { User } from "@/src/app/lib/types/user";
import jwt from "jsonwebtoken";

const TOKEN_KEY = "authToken";

export const auth = {
    // Store user session after login
    login(token: string): void {
        // Add server-side check:
        if (typeof window === "undefined") return;

        localStorage.setItem(TOKEN_KEY, token);
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return false;

            const decoded = jwt.decode(token) as JWTPayload | null;
            if (!decoded || !decoded.id) return false;

            // Check expiration
            const now = Math.floor(Date.now() / 1000);
            if (!decoded.exp || decoded.exp < now) {
                this.logout();
                return false;
            }

            return true;
        } catch {
            this.logout();
            return false;
        }
    },

    // Get JWT token
    getToken(): string | null {
        // Add server-side check:
        if (typeof window === "undefined") return null;

        return localStorage.getItem(TOKEN_KEY);
    },

    // Get user info for display. Uses the token, which means it may be stale once users are able to update their profile.
    getUser(): User | null {
        const token = this.getToken();
        if (!token) return null;

        const decoded = jwt.decode(token) as JWTPayload | null;
        if (!decoded) return null;

        const { iat: _iat, exp: _exp, ...user } = decoded;

        return user;
    },

    // Get just the user ID (for API calls)
    getUserId(): string | null {
        return this.getUser()?.id || null;
    },

    // Logout and clear session
    logout(): void {
        // Add server-side check:
        if (typeof window === "undefined") return;

        localStorage.removeItem(TOKEN_KEY);
    },
};
