import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Get user profile
export const getUserInfo = async (id: string) => {
    try {
        const response = await api.post(`/users/${id}`);
        console.log(response.status);
        return response.data;
    } catch (error) {
        console.error("Error adding/updating user profile:", error);
        return error;
    }
};

// Get user streak
export const getUserstreak = async (id: string) => {
    try {
        const response = await api.get(`/users/${id}/streak`);
        console.log(response.status);
        return response.data.current_streak;
    } catch (error) {
        console.error("Error fetching user streak:", error);
        throw error;
    }
};