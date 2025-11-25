import dotenv from 'dotenv';
import { MongoConnectionString } from "../config/mongo.config.js";
import { MongoClient } from 'mongodb';

dotenv.config();
export class MongoService {
  private static client: MongoClient;

  constructor() {
    this.AssertEnvVars();
    if (MongoService.client) throw new TypeError('client is already an instance');
    MongoService.client = new MongoClient(MongoConnectionString);
  }

  public async connect() {
    await MongoService.client.connect();
  }

  public getCollection(collectionName: string) {
    const db = MongoService.client.db();
    const collection = db.collection(collectionName);

    return collection;
  }

  private AssertEnvVars() {
    if (!process.env.JWT_ACCESS_TOKEN) throw new TypeError('JWT_ACCESS_TOKEN must be defined');
    if (!process.env.JWT_REFRESH_TOKEN) throw new TypeError('JWT_REFRESH_TOKEN must be defined');
  }
}