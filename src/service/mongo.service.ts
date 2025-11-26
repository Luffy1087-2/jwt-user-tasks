import { MongoConnectionString } from "../config/mongo.config.js";
import { MongoClient } from 'mongodb';

export default new (class MongoService {
  private static client: MongoClient;

  constructor() {
    if (MongoService.client) throw new TypeError('client is already an instance');
    MongoService.client = new MongoClient(MongoConnectionString);
  }

  public getCollection(collectionName: string) {
    const db = MongoService.client.db();
    const collection = db.collection(collectionName);

    return collection;
  }
});