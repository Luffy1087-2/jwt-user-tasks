import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import request from 'supertest';
import app from '../../src/server.js';
import db from '../../src/service/mongo.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Collection } from 'mongodb';
import { EnvVars } from '../../src/core/env-vars.core.js';

describe('routes', () => {
  let findOneStub: sinon.SinonStub;
  let updateOneStub: sinon.SinonStub;
  let insertOneStub: sinon.SinonStub;
  const validRefreshToken = jwt.sign({ userName: 'test', sub: '123' }, EnvVars.jwtRefreshToken);
  const invalidRefreshToken = 'invalid-token';

  beforeEach(() => {
    findOneStub = sinon.stub();
    insertOneStub = sinon.stub();
    updateOneStub = sinon.stub();
    sinon.stub(db, 'getCollection').returns({
      findOne: findOneStub,
      insertOne: insertOneStub,
      updateOne: updateOneStub,
    } as unknown as Collection);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should respond with 403 when credentials are wrong', async () => {
    const response = await request(app)
      .post('/login')
      .send({ userName: 'username', pw: 'password' });
    assert.strictEqual(response.status, 403);
  });

  it('should respond with 201 when credentials are correct', async () => {
    const user = { _id: 'userId', userName: 'username', pw: 'hashedPassword' };
    findOneStub.resolves(user);
    sinon.stub(bcrypt, 'compareSync').returns(true);
    sinon.stub(jwt, 'sign').returns('token' as any);
    sinon.stub(jwt, 'verify').returns({} as any);
    const response = await request(app)
      .post('/login')
      .send({ userName: 'username', pw: 'password' });
    assert.strictEqual(response.status, 201);
  });

  it('should respond with 500 when there is an error', async () => {
    findOneStub.rejects(new Error('error'));
    const response = await request(app)
      .post('/login')
      .send({ userName: 'username', pw: 'password' });
    assert.strictEqual(response.status, 500);
  });

  it('should return a new token if the refresh token is valid', async () => {
    sinon.stub(jwt, 'verify').returns({} as any);
    sinon.stub(jwt, 'sign').returns('newToken' as any);
    findOneStub.returns({});
    const response = await request(app)
      .post('/refreshToken')
      .set('Authorization', `Bearer ${validRefreshToken}`);

    assert.strictEqual(response.status, 201);
    assert.ok(response.body.token);
  });

  it('should return 403 if the refresh token is missing', async () => {
    const response = await request(app)
      .post('/refreshToken');

    assert.strictEqual(response.status, 403);
    assert.strictEqual(response.body.message, 'invalid refresh token');
  });

  it('should return 500 if there is an error during token verification', async () => {
    const errorMessage = 'token verification error';
    sinon.stub(jwt, 'verify').returns({} as any);
    sinon.stub(jwt, 'sign').throws(new Error(errorMessage));
    findOneStub.returns({});
    const response = await request(app)
      .post('/refreshToken')
      .set('Authorization', `Bearer ${validRefreshToken}`);

    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.message, errorMessage);
  });

  it('register, 403 when user is existing', async () => {
    findOneStub.withArgs({ userName: 'existingUser' }).returns({ userName: 'existingUser' });
    const response = await request(app)
      .post('/register')
      .send({ userName: 'existingUser', pw: 'pw' });

    assert.strictEqual(response.status, 403);
    assert.strictEqual(response.body.message, 'user already present');
  });

  it('register, user is registered', async () => {
    findOneStub.withArgs({ userName: 'existingUser' }).returns(null);
    insertOneStub.returns(Promise.resolve({ acknowledged: true }));
    updateOneStub.returns(Promise.resolve(1));
    sinon.stub(jwt, 'sign').returns('tokens' as any);
    sinon.stub(jwt, 'verify').returns('tokens' as any);
    const response = await request(app)
      .post('/register')
      .send({ userName: 'existingUser', pw: 'pw' });

    assert.strictEqual(response.status, 201);
  });
});