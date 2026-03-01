import { api } from "@/lib/api";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";

export interface AuthResponse {
    user: User | null;
    token: string | null;
}

/**
 * Helper to process session and sync with backend.
 */
const handleSession = async (session: any): Promise<AuthResponse> => {
    localStorage.setItem("access_token", session.access_token);

    // 1. Sync is now handled server-side during proxy login/signup.
    // We just return the session data here.

    // 2. Fetch full user profile from Backend
    try {
        const response = await api.get("/users/me", {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });
        const backendUser = response.data;

        const mappedUser: User = {
            id: backendUser.id,
            email: backendUser.email,
            name: backendUser.name,
            role: backendUser.role,
            avatarUrl: backendUser.avatarUrl,
        };

        localStorage.setItem("user", JSON.stringify(mappedUser));
        return { user: mappedUser, token: session.access_token };

    } catch (err) {
        console.error("Failed to fetch user profile from backend. Using session fallback.", err);
        const user = session.user;
        const mappedUser: User = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name || user.email!.split('@')[0],
            role: user.user_metadata.role || "MEMBER",
            avatarUrl: user.user_metadata.avatar_url,
        };
        localStorage.setItem("user", JSON.stringify(mappedUser));
        return { user: mappedUser, token: session.access_token };
    }
};

/**
 * Authentication Service.
 * Proxied through Backend APIs.
 */
export const authService = {
    /**
     * Login with email and password via Backend.
     */
    login: async (params: { email: string; password: string }): Promise<AuthResponse> => {
        try {
            const response = await api.post("/auth/login", {
                email: params.email,
                password: params.password,
            });

            console.log(` Auth Service Login Response: ${JSON.stringify(response)}`);

            const { session, user } = response.data;

            if (session) {
                await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                });
                return handleSession(session);
            }

            return { user: null, token: null };
        } catch (error: any) {
            console.log(` Auth Service Login Error: ${JSON.stringify(error)}`);
            console.error("Login Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign up a new user via Backend.
     */
    signup: async (params: { email: string; password: string; name: string; phoneNumber: string; countryCode: string }): Promise<AuthResponse> => {
        const fullPhoneNumber = `${params.countryCode}${params.phoneNumber}`;

        try {
            const response = await api.post("/auth/signup", {
                email: params.email,
                password: params.password,
                name: params.name,
                phoneNumber: fullPhoneNumber,
            });

            const { session, user } = response.data;

            if (session) {
                await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                });
                return handleSession(session);
            }

            return { user: null, token: null };
        } catch (error: any) {
            console.error("Signup Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Sign out.
     */
    logout: async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Supabase signOut error:", error);
        } finally {
            if (typeof window !== "undefined") {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                // Use replace to avoid back-navigation to protected routes
                window.location.replace("/login");
            }
        }
    },

    /**
     * Manually triggers a synchronization of the user's profile.
     * Useful as a fallback if webhooks are delayed.
     */
    manualSync: async (): Promise<User | null> => {
        try {
            const response = await api.post("/auth/sync/manual");
            if (response.data.success) {
                const updatedUser: User = response.data.data;
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
            }
            return null;
        } catch (error: any) {
            console.error("Manual Sync Error:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get current session/user.
     */
    getSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Supabase session error:", error);
                return null;
            }

            if (session) {
                const user = session.user;

                // Try to get synced data from localStorage first
                if (typeof window !== "undefined") {
                    const localUserJson = localStorage.getItem("user");
                    if (localUserJson) {
                        try {
                            const localUser = JSON.parse(localUserJson);
                            if (localUser.id === user.id) {
                                localStorage.setItem("access_token", session.access_token);
                                return localUser;
                            }
                        } catch (e) {
                            console.error("Error parsing local user data:", e);
                        }
                    }
                }

                // Fallback to session metadata if no synced data exists
                const mappedUser: User = {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata.name || user.email!.split('@')[0],
                    role: user.user_metadata.role || "MEMBER",
                    avatarUrl: user.user_metadata.avatar_url,
                };

                if (typeof window !== "undefined") {
                    localStorage.setItem("access_token", session.access_token);
                }

                return mappedUser;
            }

            // No Supabase session, clear stale local data
            if (typeof window !== "undefined") {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
            }
            return null;
        } catch (err) {
            console.error("Unexpected session check failure:", err);
            return null;
        }
    }
};
