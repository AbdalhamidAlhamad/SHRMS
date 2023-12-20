import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET_KEY
})



export const uploadToCloudinary = async (filePath: string) => {
    try {
        const data = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteFromCloudinary = async (imagePublicId: string) => {
    try {
        const data = await cloudinary.uploader.destroy(imagePublicId);
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const deleteManyFromCloudinary = async (imagePublicId: string[]) => {
    try {
        const data = await cloudinary.api.delete_resources(imagePublicId);
        return data;
    } catch (error) {
        console.log(error);
    }
};


