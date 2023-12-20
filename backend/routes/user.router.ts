import { Router } from "express";
import {
  createUserCtrl,
  loginUserCtrl,
  refreshTokenCtrl,
} from "../controllers/user.controller";
const userRouter = Router();

userRouter.post("/users", createUserCtrl);

userRouter.post("/auth/login", loginUserCtrl);

userRouter.post("/auth/refresh-token", refreshTokenCtrl);

export default userRouter;
