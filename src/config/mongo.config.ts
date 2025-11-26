import { EnvVars } from "../core/env-vars.core.js";

export const MongoConnectionString = `mongodb://${EnvVars.mongoInitDbRootUserName}:${EnvVars.mongoInitDbRootPassword}@${EnvVars.mongoServiceName}:27017/${EnvVars.mongoInitDbDatabase}?authSource=admin`;
export const MongoUsersCollection = 'users';
export const MongoTasksCollection = 'tasks';