import axios from "../config/axiosConfig"; 

export const aiResponse = async ({ prompt }) => {
    try {
        const response = await axios.post('/generate', { prompt });
        return response.data;
    } catch (error) {
        console.error('Error fetching message:', error);
        throw error; 
    }
}