import { Leave } from "../@types/models";
import Department from "../models/Department.model";
import User from "../models/User.model";
import ErrorHandler from "../utils/errorHandler";

export const updateAvailableLeaves = async (leave: Leave, userId: string) => {
  const { leaveType, leaveCategory, startDate, endDate } = leave;
  const leaveDurration = endDate.getTime() - startDate.getTime();
  const user = await User.findById(userId);

  if (leaveType === "Unpaid") {
    return;
  }

  if (!user) {
    throw new ErrorHandler(
      "Can't Update User Available Leaves, User Not Found",
      404
    );
  }

  if (leaveCategory === "Leave") {
    const leaveDurationINHours = leaveDurration / (1000 * 60 * 60) / 8;

    const targetedLeave =
      leaveType === "Annual" ? "availableAnnualLeaves" : "availableSickLeaves";
    user[targetedLeave] -= leaveDurationINHours;
    await user.save();
  } else {
    const leaveDurationInDays = calculateLeaveDuration(startDate, endDate);
    const targetedLeave =
      leaveType === "Annual" ? "availableAnnualLeaves" : "availableSickLeaves";
    user[targetedLeave] -= leaveDurationInDays;
    await user.save();
  }
};

export const calculateLeaveDuration = (startDate: Date, endDate: Date) => {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let duration = 0;
  const holidays = [5, 6]; // Friday and Saturday
  while (start < end) {
    const dayOfWeek = start.getDay();

    if (!holidays.includes(dayOfWeek)) {
      duration++;
    }

    start.setDate(start.getDate() + 1);
  }

  return duration;
};

export const getManagerAction = async (user: User)  =>  {
  // If it's only an employee
  if (!user.roles.includes("manager" || !user.roles.includes("admin"))) {
    return user.department ? "Pending" : "Skipped";
  } else if (user.roles.includes("manager") && !user.roles.includes("admin")) {
    const department = await Department.findById(user.department);
    if (!department) {
      return "Skipped";
    }
    // if its the manager of the department skip it else return pending
    return department.manager.toString() === user._id.toString()
      ? "Skipped"
      : "Pending";
  } else {
    return "Skipped";
  }
};
