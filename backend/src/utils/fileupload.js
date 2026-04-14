import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer, resourceType = "image") => { 
  try {
     if(!fileBuffer) return null;

     const uploadOptions = {
       resource_type: resourceType,
       timeout: 600000, 
     };

     if (resourceType === "video") {
       uploadOptions.chunk_size = 50000000;
     }

     return await new Promise((resolve, reject) => {
       const uploadStream = cloudinary.uploader.upload_stream(
         uploadOptions,
         (error, result) => {
           if (error) {
             console.error("Cloudinary upload error inside stream:", error);
             reject(error);
           } else {
             console.log("Upload successful:", result.secure_url);
             resolve(result);
           }
         }
       );
       uploadStream.end(fileBuffer);
     });
  }
  catch(error){
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

const uploadVideoOnCloudinary = async (fileBuffer) => {
  return uploadOnCloudinary(fileBuffer, "video");
}

const uploadImageOnCloudinary = async (fileBuffer) => {
  return uploadOnCloudinary(fileBuffer, "image");
}

export { uploadOnCloudinary, uploadVideoOnCloudinary, uploadImageOnCloudinary };