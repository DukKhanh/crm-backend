import express from 'express';
import cors from 'cors';


import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import taskRoutes from './routes/task.routes';
import profileRoutes from './routes/profile.routes';
import noteRoutes from './routes/note.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes', noteRoutes);

export default app;