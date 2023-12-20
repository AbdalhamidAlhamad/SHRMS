import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User, {
  validateCreateUser,
  validateLoginUser,
} from "../models/User.model";
import ErrorHandler from "../utils/errorHandler";
import { Secret } from "jsonwebtoken";
import jwt from "jsonwebtoken";

/*****************************************************
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 * @method  POST
 *****************************************************
 */
export const createUserCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateCreateUser(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    const user = await User.create(req.body);
    res.status(201).json({
      status: "success",
      user,
    });
  }
);

/*****************************************************
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  PUBLIC
 * @method  POST
 *****************************************************
 */
export const loginUserCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const { accessToken, refreshToken } = user.generateAuthToken();
    res.status(200).json({
      status: "success",
      user,
      accessToken,
      refreshToken,
    });
  }
);

/*****************************************************
 * @desc    Refresh Token
 * @route   POST /api/auth/refresh-token
 * @access  PUBLIC
 * @method  POST
 *****************************************************
 */

export const refreshTokenCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new ErrorHandler("Please provide a refresh token", 400));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY as Secret
    );
    if (!decoded || typeof decoded !== "object") {
      return next(new ErrorHandler("Invalid refresh token", 400));
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const { accessToken, refreshToken: newRefreshToken } =
      user.generateAuthToken();
    res.status(200).json({
      status: "success",
      user,
      accessToken,
      refreshToken: newRefreshToken,
    });
  }
);
