import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, resourceType = "image") => { 
  try{
     if(!localFilePath) return null;
     
     const absolutePath = path.resolve(localFilePath);
     
     if (!fs.existsSync(absolutePath)) {
       console.error("File does not exist:", absolutePath);
       return null;
     }

     const uploadOptions = {
       resource_type: resourceType,
       use_filename: true,
       unique_filename: false,
       overwrite: true,
       timeout: 600000, // 10 minutes timeout for large files
     };

     let response;
     if (resourceType === "video") {
       uploadOptions.chunk_size = 50000000; // 50MB chunks to significantly speed up uploads
       response = await new Promise((resolve, reject) => {
         cloudinary.uploader.upload_large(absolutePath, uploadOptions, (error, result) => {
           if (error) reject(error);
           else resolve(result);
         });
       });
     } else {
       response = await new Promise((resolve, reject) => {
         cloudinary.uploader.upload(absolutePath, uploadOptions, (error, result) => {
           if (error) reject(error);
           else resolve(result);
         });
       });
     }
     
     console.log("Upload successful:", response.secure_url);
     
     if (fs.existsSync(absolutePath)) {
       fs.unlinkSync(absolutePath);
     }
     return response;
  }
  catch(error){
    console.error("Cloudinary upload error:", error.message);
    console.error("Error code:", error.http_code);
    console.error("Error:", JSON.stringify(error, null, 2));
    
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
}

const uploadVideoOnCloudinary = async (localFilePath) => {
  return uploadOnCloudinary(localFilePath, "video");
}

const uploadImageOnCloudinary = async (localFilePath) => {
  return uploadOnCloudinary(localFilePath, "image");
}

export { uploadOnCloudinary, uploadVideoOnCloudinary, uploadImageOnCloudinary };