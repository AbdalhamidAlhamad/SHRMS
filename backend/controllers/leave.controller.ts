import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import Leave, { validateCreateLeave } from "../models/Leave.model";
import ErrorHandler from "../utils/errorHandler";
import User from "../models/User.model";
import {
  getManagerAction,
  updateAvailableLeaves,
} from "../services/leave.service";
import Department from "../models/Department.model";

/*****************************************************
 * @desc    Create new leave
 * @route   POST /api/leaves
 * @access  Private (Logged in user)
 * @method  POST
 *****************************************************
 */

export const createLeaveCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateCreateLeave(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    const isAdmin = req.user?.roles.includes("admin");
    const managerAction = await getManagerAction(req.user);
    const leave = await Leave.create({
      ...req.body,
      employeeId: req.user?._id,
      managerAction: managerAction,
      hrAction: isAdmin ? "Approved" : "Pending",
    });

    if (isAdmin) {
      await updateAvailableLeaves(leave, req.user?._id.toString());
    }

    res.status(201).json({
      status: "success",
      leave,
    });
  }
);

/*****************************************************
 * @desc    Get All leave
 * @route   Get /api/leaves
 * @access  Private (Admin, Manager)
 * @method  GET
 *****************************************************
 */

export const getAllLeaveCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const LIMIT = 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * LIMIT;
    const total = await Leave.countDocuments();
    const totalPages = Math.ceil(total / LIMIT);
    const leaves = await Leave.find({})
      .skip(skip)
      .limit(LIMIT)
      .populate("employeeId", "name email");

    res.status(200).json({
      status: "success",
      leaves,
      totalPages,
    });
  }
);

/*****************************************************
 * @desc    Get own leaves
 * @route   Get /api/leaves/own
 * @access  Private (Logged in user)
 * @method  GET
 *****************************************************
 */

export const getOwnLeaveCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const LIMIT = 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * LIMIT;
    const total = await Leave.countDocuments();
    const totalPages = Math.ceil(total / LIMIT);
    const leaves = await Leave.find({ employeeId: req.user?._id })
      .skip(skip)
      .limit(LIMIT)
      .populate("employeeId", "name email");

    res.status(200).json({
      status: "success",
      leaves,
      totalPages,
    });
  }
);

/*****************************************************
 * @desc    get leave by id
 * @route   Get /api/leave/:id
 * @access  Private (Logged in user)
 * @method  GET
 *****************************************************
 */

export const getLeaveByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const leave = await Leave.findById(req.params.id).populate(
      "employeeId",
      "name email"
    );
    if (!leave) {
      return next(new ErrorHandler("Leave not found", 404));
    }
    res.status(200).json({
      status: "success",
      leave,
    });
  }
);

/*****************************************************
 * @desc    withdraw leave by id
 * @route   PATCH /api/leave/withdraw/:id
 * @access  Private (Logged in user)
 * @method  PATCH
 *****************************************************
 */

export const withdrawLeaveCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return next(new ErrorHandler("Leave not found", 404));
    }
    if (leave.employeeId.toString() !== req.user?._id.toString()) {
      return next(
        new ErrorHandler("You are not authorized to withdraw this leave", 403)
      );
    }
    if (leave.isWithdrwan) {
      return next(new ErrorHandler("Leave already withdrawn", 400));
    }
    leave.isWithdrwan = true;
    await leave.save();
    res.status(200).json({
      status: "success",
      message: "Leave withdrawn successfully",
    });
  }
);

/*****************************************************
 * @desc    review leave for manager
 * @route   PATCH /api/leave/manager/review/:id
 * @access  Private (only manager)
 * @method  PATCH
 *****************************************************
 */

export const reviewLeaveByManagerCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return next(new ErrorHandler("Leave not found", 404));
    }
    if (leave.managerAction !== "Pending") {
      return next(new ErrorHandler("Leave already reviewed", 400));
    }

    const employee = await User.findById(leave.employeeId);
    const department = await Department.findById(employee?.department);
    if (
      !department ||
      department.manager.toString() !== req.user?._id.toString()
    ) {
      return next(
        new ErrorHandler("You are not authorized to review this leave", 403)
      );
    } else {
      const allowedActions = ["Approved", "Rejected", "Skipped"];
      if (!allowedActions.includes(req.body.action)) {
        return next(
          new ErrorHandler(
            `Action must be one of the following: ${allowedActions.join(", ")}`,
            400
          )
        );
      }
      leave.managerAction = req.body.action;
      await leave.save();
      res.status(200).json({
        status: "success",
        message: "Leave reviewed successfully",
      });
    }
  }
);

/*****************************************************
 * @desc    review leave for hr (admin)
 * @route   PATCH /api/leave/hr/review/:id/
 * @access  Private (only admin)
 * @method  PATCH
 *****************************************************
 */

export const reviewLeaveByHrCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return next(new ErrorHandler("Leave not found", 404));
    }
    if (leave.hrAction !== "Pending") {
      return next(new ErrorHandler("Leave already reviewed", 400));
    }

    const allowedActions = ["Approved", "Rejected"];
    if (!allowedActions.includes(req.body.action)) {
      return next(
        new ErrorHandler(
          `Action must be one of the following: ${allowedActions.join(", ")}`,
          400
        )
      );
    }
    leave.hrAction = req.body.action;
    await leave.save();
    if (leave.hrAction === "Approved") {
      await updateAvailableLeaves(leave, leave.employeeId.toString());
    }

    res.status(200).json({
      status: "success",
      message: "Leave reviewed successfully",
    });

    // @TODO send email to employee
  }
);
