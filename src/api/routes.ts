import dotenv from 'dotenv';
import { Router } from 'express';
import { MongoService } from '../service/mongo.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoTasksCollection, MongoUsersCollection } from '../config/mongo.config.js';
import { AssertBodyParameters } from '../middleware/assert-params.middleware.js';
import { UserAlreadyAuthenticated } from '../middleware/user-already-authenticated.middleware.js';
import { VerifyAuthentication } from '../middleware/verify-authentication.middleware.js';
import { ObjectId } from 'mongodb';

dotenv.config();
const router = Router();
const db = new MongoService();

router.post('/login', UserAlreadyAuthenticated, async (req, res) => {
  const { userName, pw } = req.body;
  const users = db.getCollection(MongoUsersCollection);
  const user = await users.findOne({ userName });
  if (!user || !bcrypt.compareSync(pw, user.pw)) return res.status(403).json({ message: 'login failed' });
  const token = jwt.sign({ userName, sub: user._id }, process.env.JWT_ACCESS_TOKEN ?? '', { expiresIn: '1h' });
  res.status(201).json({ token });
});

router.post('/register', AssertBodyParameters, async (req, res) => {
  try {
    const { userName, pw } = req.body;
    const users = db.getCollection(MongoUsersCollection);
    const user = await users.findOne({ userName });
    if (user) return res.status(403).json({ message: 'user already present' });
    const hashedPw = await bcrypt.hash(pw, 10);
    const dbDoc = await users.insertOne({ userName, pw: hashedPw });
    if (!dbDoc.acknowledged) return res.status(403).json({ message: 'error while inserting document' });
    const token = jwt.sign({ userName, sub: dbDoc.insertedId }, process.env.JWT_ACCESS_TOKEN ?? '', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/createTask', VerifyAuthentication, async (req, res) => {
  const { sub: userId } = (req as any).user;
  const { name, description } = req.body;
  if (!name || typeof name !== 'string') return res.status(400).json({ message: 'name should be a valid string' });
  if (!description || typeof name !== 'string') return res.status(400).json({ message: 'description should be a valid string' });
  const tasks = db.getCollection(MongoTasksCollection);
  const data = { userId: new ObjectId(userId), name, description, status: 0 };
  await tasks.insertOne(data);
  res.status(201).json(data);
});

router.get('/getTasks', VerifyAuthentication, async (req, res) => {
  const { sub: userId } = (req as any).user;
  const tasks = db.getCollection(MongoTasksCollection);
  const doc = await tasks.find({ userId: new ObjectId(userId) }).toArray();
  res.status(200).json(doc);
});

router.delete('/deleteTask', VerifyAuthentication, async (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ message: 'taskId cannot be null' });
  const tasks = db.getCollection(MongoTasksCollection);
  const taskById = await tasks.findOne({ _id: new ObjectId(taskId) });
  if (!taskById) return res.status(404).json({ message: 'task not found' });
  await tasks.deleteOne({ _id: new ObjectId(taskId) });
  res.status(200).json({ message: 'task deleted' });
});

router.put('/changeTask', VerifyAuthentication, async (req, res) => {
  const { taskId, name, description, status } = req.body;
  if (!taskId) return res.status(400).json({ message: 'taskId cannot be null' });
  if (name && typeof name !== 'string') return res.status(400).json({ message: 'name should be a valid string' });
  if (description && typeof description !== 'string') return res.status(400).json({ message: 'description should be a valid string' });
  if (status !== 0 && status !== 1) return res.status(400).json({ message: 'status should be 0 (pregress) or 1 (done)' });
  const tasks = db.getCollection(MongoTasksCollection);
  const taskById = await tasks.findOne({ _id: new ObjectId(taskId) });
  if (!taskById) return res.status(404).json({ message: 'task not found' });
  const data: any = { status };
  if (name) data.name = name;
  if (description) data.description = description;
  await tasks.updateOne({ _id: new ObjectId(taskId) }, { $set: data });
  res.status(200).json({ message: 'task updated' });
});

export default router;