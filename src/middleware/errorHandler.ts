import { Request, Response, NextFunction } from "express";

// 4-arg signature required for Express to treat this as an error handler.
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("API Error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Something went wrong on the server.",
  });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found." });
}
