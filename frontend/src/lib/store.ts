import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface definition for the UI Store state.
 */
interface UIState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}

/**
 * Global UI Store using Zustand.
 * Manages transient UI state like Sidebar visibility.
 * Persists to localStorage to remember user preference.
 */
export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true, // Default to open
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
        }),
        {
            name: "ui-storage", // local storage key
        }
    )
);
