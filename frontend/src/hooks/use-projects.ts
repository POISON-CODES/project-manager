import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/types";

/**
 * Hook to fetch all projects.
 * Supports caching and automatic refreshing.
 */
export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await api.get("/projects");
            return response.data.data;
        },
    });
}

/**
 * Hook to fetch a single project by ID.
 * 
 * @param id - The unique project identifier.
 */
export function useProject(id: string) {
    return useQuery<Project>({
        queryKey: ["projects", id],
        queryFn: async () => {
            const response = await api.get(`/projects/${id}`);
            return response.data.data;
        },
        enabled: !!id,
    });
}

/**
 * Hook to claim a project (Assignment to self).
 * As defined in PRD: "Event: Project Claimed -> Move to Stage: [Admin Selects Stage]"
 */
export function useClaimProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (projectId: string) => {
            const response = await api.post(`/projects/${projectId}/claim`);
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate projects cache to refresh the list
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}

/**
 * Hook to submit a new project request (Intake).
 */
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/projects", data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}
