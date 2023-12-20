import mongoose from "mongoose";
import { Leave } from "../@types/models";
import Joi, { func } from "joi";
const leaveSchema = new mongoose.Schema<Leave>({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["Annual", "Sick", "Unpaid"],
    required: true,
  },
  leaveCategory: {
    type: String,
    enum: ["Leave", "Vacation"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: Leave, value: Date): boolean {
        return this.startDate <= value;
      },
      message: "End date must be greater than or equal to start date",
    },
  },
  managerAction: {
    type: String,
    enum: ["Pending", "Skipped", "Approved", "Rejected"],
    default: "Pending",
  },
  hrAction: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  reason: {
    type: String,
    required: true,
  },
  isWithdrwan: {
    type: Boolean,
    default: false,
  },
});

export function validateCreateLeave(leave: Leave) {
    const schema = Joi.object({
        leaveType: Joi.string().valid("Annual", "Sick", "Unpaid").required(),
        leaveCategory: Joi.string().valid("Leave", "Vacation").required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        reason: Joi.string().required(),
    });
    
    return schema.validate(leave);
}


const Leave = mongoose.model<Leave>("Leave", leaveSchema);

export default Leave;