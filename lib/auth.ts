import { BasicUser, UserSession } from "@/src/app/lib/types/user";

const SESSION_KEY = "userSession";

export const auth = {
    // Store user session after login
    login(user: { id: string; email: string; name: string }): void {
        const session: UserSession = {
            isLoggedIn: true,
            id: user.id,
            email: user.email,
            name: user.name,
            loginTime: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        try {
            const session = localStorage.getItem(SESSION_KEY);
            if (!session) return false;

            const parsed: UserSession = JSON.parse(session);
            return parsed.isLoggedIn === true && Boolean(parsed.id);
        } catch {
            return false;
        }
    },

    // Get current user session
    getSession(): UserSession | null {
        try {
            const session = localStorage.getItem(SESSION_KEY);
            return session ? JSON.parse(session) : null;
        } catch {
            return null;
        }
    },

    // Get just the user ID (for API calls)
    getUserId(): string | null {
        const session = this.getSession();
        return session?.id || null;
    },

    // Get user info for display
    getUser(): BasicUser | null {
        const session = this.getSession();
        if (!session) return null;

        return {
            id: session.id,
            email: session.email,
            name: session.name,
        };
    },

    // Logout and clear session
    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    },

    // Check if session is expired
    isSessionValid(): boolean {
        const session = this.getSession();
        if (!session) return false;

        // Optional: Check if session is too old (e.g., 24 hours)
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const isExpired = Date.now() - session.loginTime > maxAge;

        if (isExpired) {
            this.logout();
            return false;
        }

        return this.isAuthenticated();
    },
};
