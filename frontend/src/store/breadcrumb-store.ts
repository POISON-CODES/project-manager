import { create } from 'zustand';

interface BreadcrumbState {
    labels: Record<string, string>;
    setLabel: (segment: string, label: string) => void;
    clearLabels: () => void;
}

/**
 * Global store to manage custom breadcrumb labels.
 * Useful for dynamic routes where we want to show entity names instead of IDs.
 */
export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
    labels: {},
    setLabel: (segment, label) =>
        set((state) => ({
            labels: { ...state.labels, [segment]: label }
        })),
    clearLabels: () => set({ labels: {} }),
}));
