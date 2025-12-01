import test, { describe } from 'node:test';
import assert from 'node:assert';
import { UserAlreadyAuthenticated } from '../../src/middleware/user-already-authenticated.middleware.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';

describe('middleware: user already authenticated', () => {
  test('should call login if token is missing', async () => {
    const req = { headers: {}, body: { userName: 'test', pw: 'test' } };
    const res = {
      status: sinon.stub().returns({
        json: sinon.stub(),
      }),
    };
    const next = sinon.stub();
    await UserAlreadyAuthenticated(req as Request, res as unknown as Response, next as NextFunction);
    assert(next.calledOnce);
  });

  test('should return 200 if token is valid', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'User already authenticated' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    const verifyStub = sinon.stub(jwt, 'verify').returns({} as any);
    await UserAlreadyAuthenticated(req as Request, res as Response, next as NextFunction);
    verifyStub.restore();
  });

  test('should call login if token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalid-token' }, body: { userName: 'test', pw: 'test' } };
    const res = {
      status: sinon.stub().returns({
        json: sinon.stub(),
      }),
    };
    const next = sinon.stub();
    const verifyStub = sinon.stub(jwt, 'verify').throws(new Error('invalid token'));
    await UserAlreadyAuthenticated(req as Request, res as unknown as Response, next as NextFunction);
    assert(next.calledOnce);
    verifyStub.restore();
  });
});