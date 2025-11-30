import type { Response, Request, NextFunction } from 'express';
import { isInWhiteList } from '../service/jwt.service.js';

export async function IsRefreshTokenInWhiteList(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers['authorization'];
    const refreshToken = auth?.startsWith('Bearer ') && auth.split(' ')[1];
    if (!refreshToken || !refreshToken.trim().length) return res.status(403).json({ message: 'invalid refresh token' });
    const isOk = await isInWhiteList(refreshToken as string);
    if (!isOk) return res.status(403).json({ message: 'refresh token expired' });
    next();
  } catch (e: any) {
    res.status(403).json({ message: 'refresh token expired' });
  }
}