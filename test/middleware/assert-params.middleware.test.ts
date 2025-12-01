import test, { describe } from 'node:test';
import assert from 'node:assert';
import { AssertBodyParameters } from '../../src/middleware/assert-params.middleware.js';
import type { Request, Response, NextFunction } from 'express';

describe('middleware: AssertBodyParameters', () => {
  test('should return 400 if userName is missing', async () => {
    const req = { body: { pw: 'password' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 400);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'userName is not set' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    AssertBodyParameters(req as Request, res as Response, next as NextFunction);
  });

  test('should return 400 if password is missing', async () => {
    const req = { body: { userName: 'username' } };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 400);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'password is not set' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    AssertBodyParameters(req as Request, res as Response, next as NextFunction);
  });

  test('should call next() if userName and password are present', async () => {
    const req = { body: { userName: 'username', pw: 'password' } };
    const res = {
      status: () => {
        assert.fail('status() should not be called');
      },
    };
    const next = () => {
      assert.ok(true);
    };
    AssertBodyParameters(req as Request, res as unknown as Response, next as NextFunction);
  });

  test('should handle errors', async () => {
    const req = { body: null };
    const res = {
      status: (code: number) => {
        assert.strictEqual(code, 500);
        return {
          json: (data: any) => {
            assert.deepStrictEqual(data, { message: 'Cannot destructure property \'userName\' of \'req.body\' as it is null.' });
          },
        };
      },
    };
    const next = () => {
      assert.fail('next() should not be called');
    };
    AssertBodyParameters(req as Request, res as Response, next as NextFunction);
  });
});