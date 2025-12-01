import test, { describe } from 'node:test';
import assert from 'node:assert';
import { IsRefreshTokenInWhiteList } from '../../src/middleware/refresh-token-in-whitelist.middleware.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import db from '../../src/service/mongo.service.js';

describe('middleware: refresh token is white list', () => {
  test('should return 403 if refresh token is missing', async () => {
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
    await IsRefreshTokenInWhiteList(req as Request, res as Response, next as NextFunction);
  });

  test('should return 403 if refresh token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 403);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'refresh token expired' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    const verifyStub = sinon.stub(jwt, 'verify').throws(new Error('invalid token'));
    await IsRefreshTokenInWhiteList(req as Request, res as Response, next as NextFunction);
    verifyStub.restore();
  });

  test('should return 403 if refresh token is not in database', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 403);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'refresh token expired' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    const verifyStub = sinon.stub(jwt, 'verify').returns({} as any);
    const getCollectionStub = sinon.stub(db, 'getCollection').returns({
      findOne: async () => null,
    } as any);
    await IsRefreshTokenInWhiteList(req as Request, res as Response, next as NextFunction);
    verifyStub.restore();
    getCollectionStub.restore();
  });

  test('should call next() if refresh token is valid', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {
      status: () => {
        assert.fail('status() should not be called');
      },
    };
    const next = () => {
      assert.ok(true);
    };
    const verifyStub = sinon.stub(jwt, 'verify').returns({} as any);
    const getCollectionStub = sinon.stub(db, 'getCollection').returns({
      findOne: async () => ({ refreshToken: 'valid-token' }),
    } as any);
    await IsRefreshTokenInWhiteList(req as Request, res as unknown as Response, next as NextFunction);
    verifyStub.restore();
    getCollectionStub.restore();
  });
});