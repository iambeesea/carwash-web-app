import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_request: Request, response: Response) {
  response.status(404).json({ error: "Route not found." });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "Please check the submitted information.",
      fields: error.flatten().fieldErrors
    });
  }

  if (typeof error === "object" && error && "code" in error && error.code === 11000) {
    return response.status(409).json({ error: "This record already exists." });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  console.error(error);
  response.status(500).json({ error: message });
}
