import jwt from 'jsonwebtoken';
import type { Response, Request, NextFunction } from 'express';
import { EnvVars } from '../core/env-vars.core.js';

const login = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userName, pw } = req.body;
    if (!userName) return res.status(400).json({ message: 'userName is not set' });
    if (!pw) return res.status(400).json({ message: 'password is not set' });
    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export function UserAlreadyAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers['authorization'];
    const token = auth?.startsWith('Bearer ') && auth.split(' ')[1];
    if (!token || !token.trim().length) return login(req, res, next);
    const user = jwt.verify(token, EnvVars.jwtAccessToken)
    if (user) return res.status(200).json({ message: 'User already authenticated' });
    login(req, res, next);
  } catch {
    login(req, res, next);
  }
}