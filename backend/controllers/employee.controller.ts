import expressAsyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User, {
  validateUpdateOwnProfile,
  validateUpdateUser,
} from "../models/User.model";
import ErrorHandler from "../utils/errorHandler";
import path from "path";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary";
import { unlinkSync } from "fs";

/*****************************************************
 * @desc    Get all employees
 * @route   GET /api/employees
 * @access  Private/Admin
 * @method  GET
 *****************************************************
 */
export const getAllEmployeesCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const LIMIT = 10;
    const { page } = req.query;
    const pageNumber = Number(page) || 1;
    const skip = (pageNumber - 1) * LIMIT;
    const total = await User.countDocuments();
    const pages = Math.ceil(total / LIMIT);

    const employees = await User.find().skip(skip).limit(LIMIT);
    res.status(200).json({
      status: "success",
      employees,
      pages,
    });
  }
);

/*****************************************************
 * @desc    Get employee by id
 * @route   GET /api/employees/:id
 * @access  Private (Logged in user)
 * @method  GET
 *****************************************************
 */

export const getEmployeeByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }
    res.status(200).json({
      status: "success",
      employee,
    });
  }
);

/*****************************************************
 * @desc    Delete employee by id
 * @route   DELETE /api/employees/:id
 * @access  Private/Admin
 * @method  Delete
 *****************************************************
 */

export const deleteEmployeeByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return next(new ErrorHandler("Employee not found", 404));
    }
    res.status(200).json({
      status: "success",
      employee,
    });
  }
);

/*****************************************************
 * @desc    Update own profile
 * @route   PATCH /api/emplyees/own
 * @access  Private (Logged in user)
 * @method  PATCH
 *****************************************************
 */

export const updateOwnProfileCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateUpdateOwnProfile(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    const employee = await User.findByIdAndUpdate(req.user?._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      employee,
    });
  }
);

/*****************************************************
 * @desc    Update employee by id
 * @route   PATCH /api/emplyees/:id
 * @access  Private/Admin
 * @method  PATCH
 *****************************************************
 */

export const updateEmployeeByIdCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }

    const employee = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      employee,
    });
  }
);

/*****************************************************
 * @desc    Upload profile picture
 * @route   POST /api/emplyees/profile-picture
 * @access  Private (Logged in user)
 * @method  POST
 *****************************************************
 */

export const uploadProfilePictureCtrl = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new ErrorHandler("Please upload a file", 400));
    }
    const imagePath = path.join(
      __dirname,
      `../public/images/${req.file.filename}`
    );
    const result = await uploadToCloudinary(imagePath);
    if (!result) {
      return next(new ErrorHandler("Something went wrong", 500));
    }

    if (req.user?.profilePicture?.publicId) {
      await deleteFromCloudinary(req.user?.profilePicture?.publicId);
    }

    req.user!.profilePicture = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await req.user?.save();

    res.status(200).json({
      status: "success",
      profilePicture: req.user?.profilePicture,
    });

    // Delete image from server
    unlinkSync(imagePath);
  }
);
