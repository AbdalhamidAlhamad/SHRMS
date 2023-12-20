import Department from "../models/Department.model";
import User from "../models/User.model"
import ErrorHandler from "../utils/errorHandler";

export const handleNewManager = async (newManagerId: string, oldManagerId: string, departmentId : String) => {
    const newManager = await User.findById(newManagerId);
    const oldManager = await User.findById(oldManagerId);

    if (!newManager) {
        throw new ErrorHandler("New manager not found",404);
    }

    if(!newManager.roles.includes("manager")){
        newManager.roles.push("manager");
    }

    await newManager.save();

    if (oldManager) {
        const departments = await Department.find({manager: oldManagerId, _id: {$ne: departmentId}});
        if (departments.length === 0) {
            const newRoles  = oldManager.roles.filter(role => role !== "manager") as [string];
            oldManager.roles = newRoles;
            await oldManager.save();
        }
        
    }
}

export const handleManagerAfterDeletion = async (managerId: string, departmentId :String) => {
    const manager = await User.findById(managerId);
    if (manager) {
        const departments = await Department.find({manager: managerId, _id: {$ne: departmentId}});
        if (departments.length === 0) {
            const newRoles  = manager.roles.filter(role => role !== "manager") as [string];
            manager.roles = newRoles;
            await manager.save();
        }
        
    }
}