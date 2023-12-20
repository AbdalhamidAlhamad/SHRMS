import express from "express";
import connectToDB from "./config/db";
import dotenv from "dotenv";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/user.router";
import employeeRouter from "./routes/employee.router";
import departmentRouter from "./routes/department.router";
import leaveRouter from "./routes/leave.router";

connectToDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter, employeeRouter, departmentRouter, leaveRouter);

app.use(ErrorMiddleware);
export default app;
