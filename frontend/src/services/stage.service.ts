import { api } from "@/lib/api";

export const stageService = {
    async getStages() {
        const response = await api.get("/stages");
        return response.data.data;
    }
};
