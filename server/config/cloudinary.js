import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks if Cloudinary credentials are fully configured
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload an in-memory buffer directly to Cloudinary via stream
 * (Avoids writing permanent or temporary files to the disk/filesystem)
 *
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @param {Object} options - Cloudinary upload options (folder, tags, etc.)
 * @returns {Promise<{ url: string, public_id: string, width?: number, height?: number, format?: string }>}
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      // In local dev or test environments when Cloudinary keys are not yet provided:
      // Return a simulated mock secure storage URL with base64 data to allow seamless testing
      const base64Data = buffer.toString("base64");
      const mimeType = options.mimeType || "image/jpeg";
      const simulatedUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/devstory_uploads/sample_image.webp`;
      const publicId = `devstory_uploads/img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      return resolve({
        url: simulatedUrl,
        secure_url: simulatedUrl,
        public_id: publicId,
        format: mimeType.split("/")[1] || "jpeg",
        bytes: buffer.length,
        isSimulated: true,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "devstory_articles",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || "Cloudinary image upload failed"));
        }
        resolve({
          url: result.secure_url || result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;
