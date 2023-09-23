import { Request, Response, NextFunction } from 'express';
import { pick } from 'lodash';

export const filterMiddleWare =
  <Type>(filterKeys: Array<keyof Type>) =>
  (req: Request, res: Response, next: NextFunction) => {
  req.body = pick(req.body, filterKeys)
  next()
}