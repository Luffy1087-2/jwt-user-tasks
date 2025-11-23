import dotenv from 'dotenv';
import {Router} from 'express';
import {MongoClient} from 'mongodb';
import { MongoConnectionString, MongoUsersCollection } from './consts.mongo.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
if (!process.env.JWT_ACCESS_TOKEN || !process.env.JWT_REFRESH_TOKEN) throw new TypeError('JWT_ACCESS_TOKEN/JWT_REFRESH_TOKEN must be defined');
const router = Router();
const client = new MongoClient(MongoConnectionString);
await client.connect();
const db = client.db();

router.post('/login', (req, res) => {

});

router.post('/register', async (req, res) => {
  try {
    const { userName, pw } = req.body;
    if (!userName) return res.status(400).json({ message: 'userName is not set'});
    if (!pw) return res.status(400).json({message:'password is not set'});
    const users = db.collection(MongoUsersCollection);
    const user = await users.findOne({ userName });
    if (user) return res.status(403).json({message:'user already present'});
    const hashedPw = await bcrypt.hash(pw, 10);
    const dbDoc = await users.insertOne({userName, pw: hashedPw});
    if (!dbDoc.acknowledged) return res.status(403).json({message:'error while inserting document'});
    const token = jwt.sign({userName}, process.env.JWT_ACCESS_TOKEN ?? '', {expiresIn: '1h'});
    res.status(201).json({token});
  } catch (e: any) {
    res.status(500).json({message:e.message});
  }
});

router.get('/getTask', (req, res) => {

});

export default router;