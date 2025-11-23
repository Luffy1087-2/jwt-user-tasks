import dotenv from 'dotenv';

dotenv.config();
export const MongoConnectionString = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;
export const MongoUsersCollection = 'users';
export const MongoTasksCollection = 'task';