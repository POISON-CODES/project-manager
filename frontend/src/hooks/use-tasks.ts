import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Task, UserStory } from "@/types";

/**
 * Hook to fetch tasks for a specific user story.
 * 
 * @param storyId - The parent user story ID.
 */
export function useTasks(storyId: string) {
    return useQuery<Task[]>({
        queryKey: ["tasks", { storyId }],
        queryFn: async () => {
            const response = await api.get(`/tasks`, { params: { storyId } });
            return response.data.data;
        },
        enabled: !!storyId,
    });
}

/**
 * Hook to update a task status.
 * Handles the completion logic: 
 * "IF last task in story marked DONE -> Prompt to close Story"
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
            const response = await api.patch(`/tasks/${id}`, data);
            return response.data.data;
        },
        onSuccess: (updatedTask) => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["stories", updatedTask.storyId] });
        },
    });
}

/**
 * Hook to resolve a dependency (Unhalt).
 */
export function useResolveDependency() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dependencyId: string) => {
            const response = await api.post(`/dependencies/${dependencyId}/resolve`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });
}
