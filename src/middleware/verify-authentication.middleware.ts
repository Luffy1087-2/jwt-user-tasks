import jwt from 'jsonwebtoken';
import type { Response, Request, NextFunction } from 'express';
import { EnvVars } from '../core/env-vars.core.js';

export function VerifyAuthentication(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers['authorization'];
    const token = auth?.startsWith('Bearer ') && auth.split(' ')[1];
    if (!token || !token.trim().length) return res.status(403).json({ message: 'User not authenticated' });
    const user = jwt.verify(token, EnvVars.jwtAccessToken);
    (req as any).user = user;
    next();
  } catch (e: any) {
    res.status(403).json({ message: 'User not authenticated' });
  }
}