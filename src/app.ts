import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import sequelize from './config/database';
import transactionRoutes from './routes/transactions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully");

    return sequelize.sync({ force: false });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
