import express from 'express';
import cors from 'cors';
import passport from 'passport';
import './config/passport.js';

import authRoutes from './routes/auth.routes.js';
import vehiculosRoutes from './routes/vehiculos.routes.js';
import conductoresRoutes from './routes/conductores.routes.js';
import viajesRoutes from './routes/viajes.routes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/vehiculos', vehiculosRoutes);
app.use('/conductores', conductoresRoutes);
app.use('/viajes', viajesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
