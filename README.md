# jwt-login
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
Once you wrote the access-token keys in the `.env`, you should remember to write the mongodb configuration for db name, root user name and password.

The final example shuld be like this:
```text
JWT_ACCESS_TOKEN=756fab306138c484a6feb69ad47d764f3ae078db3dc7c8df6eceb930a29c319db87b3c887682eff770022bbc734e2231afdd715ecd6e4257e100ca8
JWT_REFRESH_TOKEN=8843600cb0ca21c91edea6bb8dcbee335f3ccde13ed0dca8e6f828c7dcff43f6b290564bc2e1fb1ee03d2969033fec844cc6b17aaaea9ed25358b084eead0995
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=jwtUserTasks
```