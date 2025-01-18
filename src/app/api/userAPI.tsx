import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

// Get user profile
export const getUserInfo = async (username: string) => {
    try {
        const response = await api.get(`/users/${username}`);
        console.log(response.status);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};