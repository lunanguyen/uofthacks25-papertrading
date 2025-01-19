import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const startSimulation = async (
  username: string,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await api.post("/simulation/start", {
      username,
      startDate,
      endDate,
    });
    console.log("Simulation started:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error starting simulation:", error);
    return error;
  }
};

export const skipTime = async (id: string, date: string) => {
    try {
      const response = await api.post("/simulation/skip", {
        id,
        date,
      });
      console.log("Time skipped:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error skipping time:", error);
      return error;
    }
};