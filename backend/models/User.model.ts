import mongoose from "mongoose";
import Joi from "joi";
import bcrypt from "bcrypt";
import ErrorHandler from "../utils/errorHandler";
import { User, UserModel } from "../@types/models";
import jwt, { Secret } from "jsonwebtoken";
const userSchema = new mongoose.Schema<User, UserModel>(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    jobTitle: {
      type: String,
      required: true,
      max: 50,
    },
    salary: {
      type: Number,
      default: 0,
    },
    startData: {
      type: Date,
      default: new Date(),
    },
    address: {
      type: String,
      max: 50,
    },
    phoneNumber: {
      type: String,
      max: 20,
    },
    roles: {
      type: [String],
      enum: ["user", "admin", "manager"],
      default: ["user"],
    },
    profilePicture: {
      type: {
        url: {
          type: String,
        },
        publicId: {
          type: String,
        },
      },
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    availableSickLeaves: {
      type: Number,
      default: 14,
    },
    availableAnnualLeaves: {
      type: Number,
      default: 14,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorHandler("Invalid Credintials", 400);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ErrorHandler("Invalid Credintials", 400);
  }

  return user;
};

userSchema.methods.generateAuthToken = function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET_KEY as Secret,
    {
      expiresIn: "30m",
    }
  );
  const refreshToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_REFRESH_SECRET_KEY as Secret,
    {
      expiresIn: "30d",
    }
  );
  return {
    accessToken,
    refreshToken,
  };
};



const User = mongoose.model<User, UserModel>("User", userSchema);

export function validateCreateUser(obj: any) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().max(50).required().email(),
    password: Joi.string().min(6).required(),
    jobTitle: Joi.string().max(50).required(),
    salary: Joi.number(),
    startData: Joi.date(),
    address: Joi.string().max(50),
    phoneNumber: Joi.string().max(20),
    department: Joi.string(),
  });
  return schema.validate(obj);
}

export function validateLoginUser(obj: any) {
  const schema = Joi.object({
    email: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(obj);
}

export function validateUpdateOwnProfile(obj: any) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20),
    password: Joi.string().min(6),
    address: Joi.string().max(50),
    phoneNumber: Joi.string().max(20),
  });
  return schema.validate(obj);
}

export function validateUpdateUser(obj: any) {
    const schema = Joi.object({
        jobTitle: Joi.string().max(50),
        salary: Joi.number(),
        startData: Joi.date(),
        department: Joi.string(),
    });
    return schema.validate(obj);
}
export default User;
