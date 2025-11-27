# jwt-user-tasks
### Requirements
- docker >= 4.52.0
- nodejs >= v22.19.0
- typescript >= 5.9.3
### Configuration for Jwt Authentication
First, you should create a **JWT_ACCESS_TOKEN** used for verifying the authentication

Here's how to do.

Open the terminal and type `node`, then type the following command:
```javascript
require('crypto').randomBytes(64).toString('hex')
```
This will generate a string similar to "756fab306138c484a6feb69ad47d764f3ae078db3dc7c8df6eceb930a29c319db87b3c887682eff770022bbc734e2231afdd715ecd6e4257e100ca82cdf926a9"

You should repeat the same thing for creating the env varible **JTW_REFRESH_TOKEN**

Once you did that, create a `.env` file with the already created tokens;
for example:
```text
JWT_ACCESS_TOKEN=756fab306138c484a6feb69ad47d764f3ae078db3dc7c8df6eceb930a29c319db87b3c887682eff770022bbc734e2231afdd715ecd6e4257e100ca8
JWT_REFRESH_TOKEN=8843600cb0ca21c91edea6bb8dcbee335f3ccde13ed0dca8e6f828c7dcff43f6b290564bc2e1fb1ee03d2969033fec844cc6b17aaaea9ed25358b084eead0995
```

### Configuration for MongoDb
Once you wrote the access-token keys in the `.env`, you should remember to set the mongodb configuration for db name, root user name and password.

The final example shuld be like this:
```text
ENV=prod
JWT_ACCESS_TOKEN=756fab306138c484a6feb69ad47d764f3ae078db3dc7c8df6eceb930a29c319db87b3c887682eff770022bbc734e2231afdd715ecd6e4257e100ca8
JWT_REFRESH_TOKEN=8843600cb0ca21c91edea6bb8dcbee335f3ccde13ed0dca8e6f828c7dcff43f6b290564bc2e1fb1ee03d2969033fec844cc6b17aaaea9ed25358b084eead0995
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=jwtUserTasks
MONGO_SERVICE_NAME=mongo
```

Please note: **MONGO_SERVICE_NAME** is the docker service name, default is `mongo`, **ENV** is `prod` meaning that the application will run in the docker context, else it may run in your local pc using eh command `npm run start:dev`

### Running the application

First, you need to build the images for **MongoDB** and the **application** once

```text
npm run docker:init
```

Once you do that, you can run the containers by typing the command:
```text
npm run docker:start
```

## How to test the application

 In the root project folder, there is a file called `jwt-user-tasks.postman_environment.json` containing all the requests for postman.

 You just need to import it for understanding every request a user can do.
