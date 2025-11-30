import dotenv from 'dotenv';
import express from 'express';
import router from './api/routes.api.js';
import VerifyEnvVars from './core/env-vars.core.js';

dotenv.config();
VerifyEnvVars();
const app = express();
app.use(express.json());
app.use(router);

export default app;