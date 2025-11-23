import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import type { Response, Request, NextFunction } from 'express';

dotenv.config();
export function UserAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    const decoded = jwt.verify(token ?? '', process.env.JWT_ACCESS_TOKEN??'');
    (req as any).user = decoded;
    next();
  } catch (e: any) {
    res.status(403).json({message: 'User not authenticated'});
  }
}