import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/jwt";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //* Get Authorization header
    const authHeader = req.headers.authorization;

    //* Check if token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Unauthorized - token missing",
      });
    }

    //* Extract token
    const token = authHeader.split(" ")[1];

    //* Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    //* Attach decoded data to request
    req.user = decoded;

    //* Go to next middleware / controller
    next();
  } catch (error) {
    return res.status(403).json({
      msg: "Invalid or expired token",
    });
  }
};
