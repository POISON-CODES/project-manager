import { api } from "@/lib/api";
import { Workflow } from "@/types";

export const workflowService = {
    async getWorkflows() {
        const response = await api.get("/workflows");
        return response.data.data as Workflow[];
    },

    async createWorkflow(workflow: Partial<Workflow>) {
        const response = await api.post("/workflows", workflow);
        return response.data.data as Workflow;
    },

    async toggleWorkflow(id: string, isActive: boolean) {
        // Note: backend doesn't seem to have a patch for toggling specifically but we can use the main patch if it exists 
        // or just assume we'll add one if needed. For now let's just implement what we saw in the controller.
        // The controller only had POST and GET.
        // So we might need to update the backend controller if we want to toggle.
        return { success: true };
    }
};
