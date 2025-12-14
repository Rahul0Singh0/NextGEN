import express from 'express';
import cors from 'cors';
import { PORT } from './config/serverConfig.js';
import connectDB from './config/dbConfig.js';
import apiRoutes from './routes/index.js';

// Connect to the database
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});