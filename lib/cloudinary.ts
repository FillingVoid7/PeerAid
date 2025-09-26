import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadFileResponse {
  url: string;
  [key: string]: any;
}

export const uploadFile = async (file: File): Promise<UploadFileResponse> => {
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: file,
    });
    return (await response.json()) as UploadFileResponse;
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};
