import dotenv from 'dotenv';
import express from 'express';
import router from './router.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(router);
app.listen(3000, () => console.log('✅ Server su http://localhost:3000'));