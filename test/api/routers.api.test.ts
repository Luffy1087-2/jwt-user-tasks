import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import request from 'supertest';
import app from '../../src/server.js';
import db from '../../src/service/mongo.service.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Collection } from 'mongodb';

describe('route /login', () => {
  let findOneStub: sinon.SinonStub;
  let updateOneStub: sinon.SinonStub;
  let insertOneStub: sinon.SinonStub;

  beforeEach(() => {
    findOneStub = sinon.stub();
    sinon.stub(db, 'getCollection').returns({
      findOne: findOneStub,
      updateOne: findOneStub,
      insertOneStub: findOneStub
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
});