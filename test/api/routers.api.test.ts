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
  let findStub: sinon.SinonStub;
  let updateOneStub: sinon.SinonStub;
  let insertOneStub: sinon.SinonStub;
  let deleteOneStub: sinon.SinonStub;
  const validRefreshToken = jwt.sign({ userName: 'test', sub: '123' }, EnvVars.jwtRefreshToken);

  beforeEach(() => {
    findOneStub = sinon.stub();
    findStub = sinon.stub();
    insertOneStub = sinon.stub();
    updateOneStub = sinon.stub();
    deleteOneStub = sinon.stub();
    sinon.stub(db, 'getCollection').returns({
      findOne: findOneStub,
      find: findStub,
      insertOne: insertOneStub,
      updateOne: updateOneStub,
      deleteOne: deleteOneStub
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

  it('createTask, task is added, status 201', async () => {
    insertOneStub.returns(Promise.resolve({ acknowledged: true }));
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    const response = await request(app)
      .post('/createTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ name: 'name', description: 'description' });

    assert.strictEqual(response.status, 201);
    assert.ok(!!insertOneStub.getCall(0));
    assert.equal('object', typeof insertOneStub.getCall(0).args[0]);
  });

  it('createTask, returns status code 400 and 500', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    let response = await request(app)
      .post('/createTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ name: '', description: 'description' });

    assert.strictEqual(response.status, 400);

    response = await request(app)
      .post('/createTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ name: 'name', description: '' });

    assert.strictEqual(response.status, 400);

    insertOneStub.throwsException('error');
    response = await request(app)
      .post('/createTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ name: 'name', description: 'description' });

    assert.strictEqual(response.status, 500);
  });

  it('getTasks, returns status code 200', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findStub.returns({ toArray: () => Promise.resolve([]) });
    const response = await request(app)
      .get('/getTasks')
      .set('Authorization', `Bearer ${validRefreshToken}`);

    assert.strictEqual(response.status, 200);
  });

  it('getTasks, returns status code 500', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findStub.throws('error');
    const response = await request(app)
      .get('/getTasks')
      .set('Authorization', `Bearer ${validRefreshToken}`);

    assert.strictEqual(response.status, 500);
  });

  it('deleteTask, returns status code 200', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    deleteOneStub.returns(void 0);
    const response = await request(app)
      .delete('/deleteTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439055' });

    assert.strictEqual(response.status, 200);
  });

  it('deleteTask, returns status code 500 and 400', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    deleteOneStub.throws('error');
    let response = await request(app)
      .delete('/deleteTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439055' });

    assert.strictEqual(response.status, 500);

    response = await request(app)
      .delete('/deleteTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '' });

    assert.strictEqual(response.status, 400);
  });

  it('updateTask, returns status code 200', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    updateOneStub.returns(void 0);
    const response = await request(app)
      .put('/updateTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 200);
  });

  it('updateTask, returns status code 400, 404 and 500', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    updateOneStub.returns(void 0);
    let response = await request(app)
      .put('/updateTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 400);

    response = await request(app)
      .put('/updateTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077' });

    assert.strictEqual(response.status, 400);

    findOneStub.returns(Promise.resolve(void 0));
    response = await request(app)
      .put('/updateTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 404);

    findOneStub.throws('error');
    response = await request(app)
      .put('/updateTask')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 500);
  });

  it('logout, returns status code 200', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    deleteOneStub.returns(void 0);
    const response = await request(app)
      .delete('/logout')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 200);
  });

  it('logout, returns status code 500', async () => {
    sinon.stub(jwt, 'verify').returns({ sub: '507f1f77bcf86cd799439011' } as any);
    findOneStub.returns(Promise.resolve({}));
    deleteOneStub.throws('error');
    const response = await request(app)
      .delete('/logout')
      .set('Authorization', `Bearer ${validRefreshToken}`)
      .send({ taskId: '507f1f77bcf86cd799439077', name: 'name', description: 'description', status: 0 });

    assert.strictEqual(response.status, 500);
  });
});