import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { supabase } from "./supabase";

/**
 * Base API URL from environment variables.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Core Axios instance for the application.
 */
export const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

/**
 * Request Interceptor
 * Adds the Authorization header using Supabase session.
 */
api.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles global error responses.
 */
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const status = error.response?.status;
        const message = (error.response?.data as any)?.message;

        if (status === 401) {
            const isAuthPage = typeof window !== "undefined" &&
                (window.location.pathname === "/login" || window.location.pathname === "/signup");

            if (!isAuthPage) {
                console.error("Auth Failure:", message);

                // IMPORTANT: Check if we have a valid session in Supabase before kicking to login
                const { data } = await supabase.auth.getSession();

                if (data.session) {
                    console.warn("Backend 401 but Supabase session exists. This likely indicates a 'SUPABASE_JWT_SECRET' mismatch in backend .env.");
                    // Don't redirect if we have a session - return the error for the component to handle
                    return Promise.reject(error);
                }

                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    window.location.href = `/login?error=${encodeURIComponent(message || "Session expired")}`;
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
