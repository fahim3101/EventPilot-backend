import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so that any rejected promise is passed to
 * next(err) instead of crashing the process with an unhandled rejection.
 * (This is the exact bug class that used to crash the Lifeline/DriveFleet
 * Express servers -- wrap every async route with this.)
 */
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
