import { Router } from "express";
import { autherizedRoles, isAutherized } from "../middlewares/auth";
import {
  createDepartmentCtrl,
  deleteDepartmentByIdCtrl,
  getAllDepartmentsCtrl,
  getDepartmentByIdCtrl,
  updateDepartmentCtrl,
} from "../controllers/department.controller";

const departmentRouter = Router();

departmentRouter.get(
  "/departments",
  isAutherized,
  autherizedRoles("admin"),
  getAllDepartmentsCtrl
);

departmentRouter.get(
  "/departments/:id",
  isAutherized,
  autherizedRoles("admin"),
  getDepartmentByIdCtrl
);

departmentRouter.post(
  "/departments",
  isAutherized,
  autherizedRoles("admin"),
  createDepartmentCtrl
);

departmentRouter.patch(
  "/departments/:id",
  isAutherized,
  autherizedRoles("admin"),
  updateDepartmentCtrl
);

departmentRouter.delete(
  "/departments/:id",
  isAutherized,
  autherizedRoles("admin"),
  deleteDepartmentByIdCtrl
);

export default departmentRouter;
