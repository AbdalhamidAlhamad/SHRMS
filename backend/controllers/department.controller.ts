import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";
import Department, {
  validateCreateDepartment,
  validateUpdateDepartment,
} from "../models/Department.model";
import User from "../models/User.model";
import {
  handleManagerAfterDeletion,
  handleNewManager,
} from "../services/department.service";

/*****************************************************
 * @desc    Get all departments
 * @route   GET /api/departments
 * @access  Private/Admin
 * @method  GET
 *****************************************************
 */
export const getAllDepartmentsCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page } = req.query;
    const LIMIT = 10;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * LIMIT;
    const total = await Department.countDocuments();
    const pages = Math.ceil(total / LIMIT);
    const departments = await Department.find().skip(skip).limit(LIMIT);
    res.status(200).json({
      status: "success",
      departments,
      pages,
    });
  }
);

/*****************************************************
 * @desc    Get department by id
 * @route   GET /api/departments/:id
 * @access  Private/Admin
 * @method  GET
 *****************************************************
 */
export const getDepartmentByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(new ErrorHandler("Department not found", 404));
    }
    res.status(200).json({
      status: "success",
      department,
    });
  }
);

/*****************************************************
 * @desc    Create new department
 * @route   POST /api/departments
 * @access  Private/Admin
 * @method  POST
 *****************************************************
 */
export const createDepartmentCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateCreateDepartment(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    const user = await User.findById(req.body.manager);
    if (!user) {
      return next(new ErrorHandler("Manager not found", 404));
    }

    if (!user.roles.includes("manager")) {
      user.roles.push("manager");
    }

    const department = await Department.create(req.body);
    await user.save();
    res.status(201).json({
      status: "success",
      department,
    });
  }
);

/*****************************************************
 * @desc    Update department by id
 * @route   PATCH /api/departments/:id
 * @access  Private/Admin
 * @method  PATCH
 *****************************************************
 */
export const updateDepartmentCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateUpdateDepartment(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    const department = await Department.findById(req.params.id);

    if (!department) {
      return next(new ErrorHandler("Department not found", 404));
    }

    if (req.body.manager) {
      const user = await User.findById(req.body.manager);
      if (!user) {
        return next(new ErrorHandler("Manager not found", 404));
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (req.body.manager && req.body.manager != department.manager.toString()) {
      await handleNewManager(
        req.body.manager,
        department.manager.toString(),
        req.params.id
      );
    }

    res.status(200).json({
      status: "success",
      department: updatedDepartment,
    });
  }
);

/*****************************************************
 * @desc    Delete department by id
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 * @method  DELETE
 *****************************************************
 */
export const deleteDepartmentByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return next(new ErrorHandler("Department not found", 404));
    }

    await handleManagerAfterDeletion(
      department.manager.toString(),
      department._id.toString()
    );
    
    res.status(200).json({
      status: "success",
      department,
    });
  }
);
