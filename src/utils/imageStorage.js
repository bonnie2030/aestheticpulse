import {
  uploadImageToCloudinary,
  uploadImagesToCloudinary,
} from "./cloudinaryUpload";
import { toDataURL } from "./helpers";

export async function uploadImage(file) {
  try {
    const url = await uploadImageToCloudinary(file);
    return url;
  } catch (e) {
    throw e;
  }
}

export async function uploadImages(files) {
  return uploadImagesToCloudinary(files);
}

//import helper function to convert to base64 url from helpers.js
export async function convertToBase64(file){
  return await toDataURL(file);
}