import mongoose, { Document, Model } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  roles: [string];
  profilePicture: {
    url: string;
    publicId: string | null;
  };
  department: Department;
  jobTitle: string;
  salary: number;
  startData: Date;
  availableSickLeaves: number;
  availableAnnualLeaves: number;
  generateAuthToken: () => { accessToken: string; refreshToken: string };
}

export interface Department extends Document {
  name: string;
  manager: mongoose.Schema.Types.ObjectId;

}

export interface Leave extends Document {
  startDate: Date;
  endDate: Date;
  leaveType: string;
  leaveCategory: string;
  managerAction: string;
  hrAction: string;
  reason: string;
  employeeId: mongoose.Schema.Types.ObjectId;
  isWithdrwan: boolean;

}

export interface UserModel extends Model<User> {
  findByCredentials(email: string, password: string): Promise<User>;
}
