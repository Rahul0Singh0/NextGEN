import axios from "../config/axiosConfig"; 

export const pingMessage = async () => {
    try {
        const response = await axios.get('/message');
        return response.data;
    } catch (error) {
        console.error('Error fetching message:', error);
        throw error;
    }
}