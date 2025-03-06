import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");
import dotenv from "dotenv";

dotenv.config();

interface RequestWithUserId extends Request {
  userId?: string;
}

export function verifyToken(
  req: RequestWithUserId, 
  res: Response, 
  next: NextFunction
): void {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
}