import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getMarketData = async (ticker: string, end_date: string, date_range: number) => {
    try {
        const response = await api.get(`/marketdata/${ticker}`, {
            params: {
                end_date,
                date_range,
            },
        });
        console.log(response.status)
        return response.data;
    } catch (error) {
        console.error("Error getting stock ticker data", error);
        return error;
    }
};