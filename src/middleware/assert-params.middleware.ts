import type { Response, Request, NextFunction } from 'express';

export function AssertBodyParameters(req: Request, res: Response, next: NextFunction) {
  try {
    const { userName, pw } = req.body;
    if (!userName) return res.status(400).json({ message: 'userName is not set' });
    if (!pw) return res.status(400).json({ message: 'password is not set' });
    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}