import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const getDailyQuest = async (questId: string) => {
    try {
        const response = await api.get(`/quest/${questId}`);
        console.log(response.status);
        return response.data;
    } catch (error) {
        console.error("Error getting daily quest", error);
        return error;
    }
}

export const claimQuest = async (username: string, questId: string) => {
    try {
        const response = await api.post(`/quest/claim`, {
            username,
            questId
        });
        console.log(response.status);
        return response.data;
    } catch (error) {
        console.error("Error claiming quest", error);
        return error;
    }
}
