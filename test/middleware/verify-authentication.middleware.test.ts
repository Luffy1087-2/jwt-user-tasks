import test, { describe } from 'node:test';
import assert from 'node:assert';
import { VerifyAuthentication } from '../../src/middleware/verify-authentication.middleware.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';

describe('middleware: verify authentication', () => {
  test('should return 403 if token is missing', async () => {
    const req = { headers: {} };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 403);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'invalid refresh token' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    await VerifyAuthentication(req as Request, res as Response, next as NextFunction);
  });

  test('should return 403 if token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 403);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'User not authenticated' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    const verifyStub = sinon.stub(jwt, 'verify').throws(new Error('invalid token'));
    await VerifyAuthentication(req as Request, res as Response, next as NextFunction);
    verifyStub.restore();
  });

  test('should set user in req and call next if token is valid', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {};
    const next = sinon.stub();
    const user = { id: 1, name: 'John Doe' };
    const verifyStub = sinon.stub(jwt, 'verify').returns(user as any);
    await VerifyAuthentication(req as Request, res as Response, next as NextFunction);
    assert.strictEqual((req as any).user, user);
    assert(next.calledOnce);
    verifyStub.restore();
  });
});