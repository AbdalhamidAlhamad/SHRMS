import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import User from "../models/User.model";
import ErrorHandler from "../utils/errorHandler";

export const isAutherized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const Bearertoken = req.header("Authorization");
  if (!Bearertoken) {
    return res
      .status(401)
      .json({ status: "fail", message: "Access denied. No token provided." });
  }

  try {
    const token = Bearertoken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as Secret);
    if (!decoded || typeof decoded !== "object") {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid token." });
    }
    const user = await User.findById(decoded._id);

    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid token." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: "Invalid token." });
  }
};

export const autherizedRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.user.roles;
    const isMatch = roles.some((role) => userRoles.includes(role));
    if (!isMatch) {
      return next(
        new ErrorHandler(
          `User role ${userRoles} is not autherized to access this route`,
          403
        )
      );
    }

    next();
  };
};
