import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file uploaded successfully
    fs.unlinkSync(localFilePath);
    // console.log("File uploaded successfully", response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // this will just unlink the file path prom the local server not delete just unlink
    return null;
  }
};

const getPublicIdFromUrl = (imageUrl) => {
  // .../upload/v1234567890/folder/filename.ext → folder/filename
  const uploadSegment = imageUrl.split("/upload/")[1];
  if (!uploadSegment) return null;

  const withoutVersion = uploadSegment.replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return null;

    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) return null;

    // destroy does not support resource_type: "auto"
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return response;
  } catch (error) {
    throw new ApiError(
      500,
      `Something went wrong while deleting file from cloudinary with url: ${imageUrl}`
    );
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
