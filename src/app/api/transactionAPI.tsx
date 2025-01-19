import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getTransactionHistory = async (username: string) => {
    try {
        const response = await api.get(`/users/${username}/transactions`);
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error getting transaction history", error);
        return error;
    }
};

export const buyStock = async (username: string, stockTicker: string, date: string, quantity: number) => {
    try {
        const response = await api.post(`/users/${username}/buy`, {
            stockTicker,
            quantity,
          });
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error buying stock", error);
        return error;
  }
};

export const sellStock = async (username: string, stockTicker: string, date: string, quantity: number) => {
    try {
        const response = await api.post(`/users/${username}/sell`, {
            stockTicker,
            quantity,
          });
        return response.data;
    } catch (error) {
        console.error("Error selling stock", error);
        return error;
    }
};