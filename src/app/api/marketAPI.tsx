import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getMarketData = async (ticker: string, currentDate: string, dateRange: string) => {
    try {
        const response = await api.get(`/marketdata/${ticker}`, {
            params: {
                currentDate,
                dateRange,
            },
        });
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error getting stock ticker data", error);
        return error;
    }
};