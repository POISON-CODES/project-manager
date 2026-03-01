import { api } from "@/lib/api";
import { FormTemplate } from "@/types";

export const formService = {
    async getForms() {
        const response = await api.get("/forms");
        return response.data.data as FormTemplate[];
    },

    async getForm(id: string) {
        const response = await api.get(`/forms/${id}`);
        return response.data.data as FormTemplate;
    },

    async submitResponse(formId: string, data: any) {
        // Note: Backend doesn't seem to have a response submission endpoint yet?
        return { success: true };
    },

    async createForm(data: any) {
        const response = await api.post("/forms", data);
        return response.data;
    },

    async updateForm(id: string, data: any) {
        const response = await api.patch(`/forms/${id}`, data);
        return response.data;
    },

    async getSubmissions(formId: string) {
        const response = await api.get(`/projects?formTemplateId=${formId}`);
        return response.data.data;
    }
};
