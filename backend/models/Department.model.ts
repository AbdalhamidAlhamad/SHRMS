import mongoose from "mongoose";
import { Department } from "../@types/models";
import Joi from "joi";
const departmentSchema = new mongoose.Schema<Department>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      min: 3,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export function validateCreateDepartment(department: Department) {
  const schema = Joi.object({
    name: Joi.string().required(),
    manager: Joi.string().required(),
  });
  return schema.validate(department);
}

export function validateUpdateDepartment(department: Department) {
  const schema = Joi.object({
    name: Joi.string(),
    manager: Joi.string()
  });
  return schema.validate(department);
}

const Department = mongoose.model<Department>("Department", departmentSchema);

export default Department;
