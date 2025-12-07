import express from 'express';
import cors from 'cors';
import { PORT } from './config/serverConfig.js';
import connectDB from './config/dbConfig.js';

// Connect to the database
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("hello from backend");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});