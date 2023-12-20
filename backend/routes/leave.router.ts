import { Router } from "express";
import { autherizedRoles, isAutherized } from "../middlewares/auth";
import {
  createLeaveCtrl,
  getAllLeaveCtrl,
  getLeaveByIdCtrl,
  getOwnLeaveCtrl,
  reviewLeaveByHrCtrl,
  reviewLeaveByManagerCtrl,
  withdrawLeaveCtrl,
} from "../controllers/leave.controller";

const leaveRouter = Router();

leaveRouter.post("/leave", isAutherized, createLeaveCtrl);

leaveRouter.get(
  "/leave",
  isAutherized,
  autherizedRoles("admin", "manager"),
  getAllLeaveCtrl
);

leaveRouter.get("/leave/own", isAutherized, getOwnLeaveCtrl);

leaveRouter.get("/leave/:id", isAutherized, getLeaveByIdCtrl);

leaveRouter.patch(
  "/leave/hr/review/:id",
  isAutherized,
  autherizedRoles("admin"),
  reviewLeaveByHrCtrl
);

leaveRouter.patch(
  "/leave/manager/review/:id",
  isAutherized,
  autherizedRoles("manager"),
  reviewLeaveByManagerCtrl
);

leaveRouter.patch("/leave/withdraw/:id", isAutherized, withdrawLeaveCtrl);

export default leaveRouter;
