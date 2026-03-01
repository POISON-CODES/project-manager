import { api } from "@/lib/api";
import { Project, Task, UserStory, ProjectStage } from "@/types";

export const projectService = {
    /**
     * Get all projects.
     */
    getProjects: async (): Promise<Project[]> => {
        const response = await api.get<{ data: Project[] }>("/projects");
        return response.data.data;
    },

    /**
     * Get all unclaimed projects (The Queue).
     */
    getQueue: async (): Promise<Project[]> => {
        const response = await api.get<{ data: Project[] }>("/projects?unclaimedOnly=true");
        return response.data.data;
    },

    /**
     * Get a specific project by ID.
     */
    getProjectById: async (id: string): Promise<Project> => {
        const response = await api.get<{ data: Project }>(`/projects/${id}`);
        return response.data.data;
    },

    /**
     * Get the project hierarchy for timeline views.
     */
    getTimeline: async (userIds?: string[]): Promise<Project[]> => {
        const query = userIds ? `?userIds=${userIds.join(",")}` : "";
        const response = await api.get<{ data: Project[] }>(`/projects/timeline${query}`);
        return response.data.data;
    },

    /**
     * Update project stage.
     */
    updateProjectStage: async (id: string, stageId: string): Promise<Project> => {
        const response = await api.patch<{ data: Project }>(`/projects/${id}/stage`, { stageId });
        return response.data.data;
    },

    /**
     * Get all organizational project stages.
     */
    getStages: async (): Promise<ProjectStage[]> => {
        const response = await api.get<{ data: ProjectStage[] }>("/stages");
        return response.data.data;
    },

    /**
     * Create a new project (Intake Submission).
     */
    createProject: async (data: {
        name: string;
        description: string;
        formTemplateId: string;
        formData: any;
        deadline?: string;
    }): Promise<Project> => {
        const response = await api.post<{ data: Project }>("/projects", data);
        return response.data.data;
    },

    /**
     * Claim a project (Assign to self).
     */
    claimProject: async (id: string): Promise<Project> => {
        const response = await api.patch<{ data: Project }>(`/projects/${id}/claim`);
        return response.data.data;
    },

    /**
     * Upload a document to the backend storage bridge.
     */
    uploadDocument: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post<{ data: string }>("/projects/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data.data;
    }
};

export const taskService = {
    /**
     * Get all tasks, optionally filtered.
     */
    getTasks: async (filters?: { status?: string, userIds?: string[] }): Promise<Task[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.userIds) params.append("userIds", filters.userIds.join(","));

        const response = await api.get<{ data: Task[] }>(`/tasks?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get task details by ID.
     */
    getTaskById: async (id: string): Promise<Task> => {
        const response = await api.get<{ data: Task }>(`/tasks/${id}`);
        return response.data.data;
    }
};
export const storyService = {
    /**
     * Get all user stories.
     */
    getStories: async (): Promise<UserStory[]> => {
        const response = await api.get<{ data: UserStory[] }>("/user-stories");
        return response.data.data;
    },

    /**
     * Get user story by ID.
     */
    getStoryById: async (id: string): Promise<UserStory> => {
        const response = await api.get<{ data: UserStory }>(`/user-stories/${id}`);
        return response.data.data;
    }
};
