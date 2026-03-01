import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppFeature, FeatureState } from '@/types';

interface FeatureStoreState {
    features: FeatureState[];
    toggleFeature: (id: AppFeature) => void;
    isFeatureEnabled: (id: AppFeature) => boolean;
}

const DEFAULT_FEATURES: FeatureState[] = [
    {
        id: "DASHBOARD",
        name: "Command Dashboard",
        description: "Primary overview of system health, project velocity, and recent activities.",
        enabled: true,
        icon: "LayoutDashboard"
    },
    {
        id: "CALENDAR",
        name: "Temporal Scheduler",
        description: "Visual calendar for project milestones, meetings, and individual availability.",
        enabled: true,
        icon: "Calendar"
    },
    {
        id: "PROJECTS",
        name: "Project Architect",
        description: "Full lifecycle management of project portfolios, from intake to execution.",
        enabled: true,
        icon: "FolderKanban"
    },
    {
        id: "TASKS",
        name: "Execution Board",
        description: "High-density task tracking with dependencies, priorities, and real-time status updates.",
        enabled: true,
        icon: "CheckSquare"
    },
    {
        id: "AUTOMATION",
        name: "NexusFlow Engine",
        description: "Visual workflow builder and automation rules for systemic scaling.",
        enabled: true,
        icon: "Workflow"
    },
    {
        id: "INTAKE",
        name: "Intake Systems",
        description: "Advanced request triage and automated project boarding infrastructure.",
        enabled: true,
        icon: "FilePlus"
    },
    {
        id: "ADMIN_CONTROLS",
        name: "System Controls",
        description: "Core administrative panel for user management and global configurations.",
        enabled: true,
        icon: "ShieldCheck"
    },
    {
        id: "GLOBAL_SEARCH",
        name: "Neural Search",
        description: "Context-aware global search across projects, tasks, and documentation.",
        enabled: true,
        icon: "Search"
    }
];

/**
 * Global Feature Flag Store.
 * Manages the activation state of core application modules.
 * Persists state in local storage for local-first reliability.
 */
export const useFeatureStore = create<FeatureStoreState>()(
    persist(
        (set, get) => ({
            features: DEFAULT_FEATURES,
            toggleFeature: (id) =>
                set((state) => ({
                    features: state.features.map((f) =>
                        f.id === id ? { ...f, enabled: !f.enabled } : f
                    ),
                })),
            isFeatureEnabled: (id) => {
                const feature = get().features.find(f => f.id === id);
                return feature ? feature.enabled : true;
            }
        }),
        {
            name: 'nexus-feature-flags',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Inject any missing default features into the persisted state
                    const state = persistedState as FeatureStoreState;
                    const existingIds = state.features.map(f => f.id);
                    const missingFeatures = DEFAULT_FEATURES.filter(f => !existingIds.includes(f.id));

                    if (missingFeatures.length > 0) {
                        return {
                            ...state,
                            features: [...state.features, ...missingFeatures]
                        };
                    }
                }
                return persistedState;
            }
        }
    )
);
