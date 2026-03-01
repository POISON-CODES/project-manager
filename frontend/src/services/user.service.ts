import { api } from "@/lib/api";
import { User, Activity } from "@/types";

export interface UpdateProfileParams {
    name?: string;
    avatarUrl?: string;
}

export const userService = {
    /**
     * Get the current user's profile from the backend.
     */
    getMe: async (): Promise<User> => {
        const response = await api.get<User>("/users/me");
        return response.data;
    },

    /**
     * Get all users in the workspace.
     */
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<{ data: User[] }>("/users");
        return response.data.data;
    },

    /**
     * Update the current user's profile.
     */
    updateProfile: async (params: UpdateProfileParams): Promise<User> => {
        const response = await api.patch<User>("/users/me/profile", params);
        return response.data;
    },

    /**
     * Get all users with detailed stats for management.
     */
    getManagementUsers: async (): Promise<any[]> => {
        const response = await api.get<{ data: any[] }>("/users/management");
        return response.data.data;
    },

    /**
     * Update a user's role (Admin only).
     */
    updateUserRole: async (userId: string, role: string): Promise<any> => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data;
    },

    /**
     * Update user status (Admin only).
     */
    updateUserStatus: async (userId: string, status: string): Promise<any> => {
        const response = await api.patch(`/users/${userId}/status`, { status });
        return response.data;
    },

    getActivity: async (userId?: string): Promise<Activity[]> => {
        const query = userId ? `?userId=${userId}` : "";
        const response = await api.get<{ data: Activity[] }>(`/users/activity${query}`);
        return response.data.data;
    },

    /**
     * Get detailed stats for a specific user.
     */
    getUserStats: async (userId: string): Promise<any> => {
        const response = await api.get<{ success: boolean; data: any }>(`/users/${userId}/stats`);
        return response.data.data;
    },

    /**
     * Create/Invite a new user (Admin only).
     */
    createUser: async (data: any): Promise<any> => {
        const response = await api.post("/users", data);
        return response.data;
    }
};
