import { Router } from "express";
import {
  deleteEmployeeByIdCtrl,
  getAllEmployeesCtrl,
  getEmployeeByIdCtrl,
  updateEmployeeByIdCtrl,
  updateOwnProfileCtrl,
  uploadProfilePictureCtrl,
} from "../controllers/employee.controller";
import { autherizedRoles, isAutherized } from "../middlewares/auth";
import photoUpload from "../middlewares/photo-upload";

const employeeRouter = Router();

employeeRouter.get(
  "/employees",
  isAutherized,
  autherizedRoles("admin"),
  getAllEmployeesCtrl
);

employeeRouter.get("/employees/:id", isAutherized, getEmployeeByIdCtrl);

employeeRouter.delete(
  "/employees/:id",
  isAutherized,
  autherizedRoles("admin"),
  deleteEmployeeByIdCtrl
);

employeeRouter.patch("/employees/own", isAutherized, updateOwnProfileCtrl);

employeeRouter.patch(
  "/employees/:id",
  isAutherized,
  autherizedRoles("admin"),
  updateEmployeeByIdCtrl
);

employeeRouter.post(
  "/employees/profile-picture",
  isAutherized,
  photoUpload.single("image"),
  uploadProfilePictureCtrl
);

export default employeeRouter;
