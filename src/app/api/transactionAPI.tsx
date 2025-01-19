import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getTransactionHistory = async (id: string) => {
    try {
        const response = await api.get(`/users/${id}/transactions`);
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error getting transaction history", error);
        return error;
    }
};

export const buyStock = async (id: string, ticker: string, date: string, quantity: number) => {
    try {
        const response = await api.post(`/users/${id}/buy`, {
            ticker,
            date,
            quantity,
          });
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error buying stock", error);
        return error;
  }
};

export const sellStock = async (id: string, ticker: string, date: string, quantity: number) => {
    try {
        const response = await api.post(`/users/${id}/sell`, {
            ticker,
            date,
            quantity,
          });
        return response.data;
    } catch (error) {
        console.error("Error selling stock", error);
        return error;
    }
};