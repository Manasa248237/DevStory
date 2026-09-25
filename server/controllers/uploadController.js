import { uploadBufferToCloudinary } from "../config/cloudinary.js";

/**
 * @route   POST /api/upload
 * @desc    Upload an image to Cloudinary
 * @access  Private (Authenticated users only)
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Please attach an image file.",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Upload to Cloudinary using in-memory stream
    const uploadResult = await uploadBufferToCloudinary(buffer, {
      mimeType: mimetype,
      originalName: originalname,
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: uploadResult.secure_url || uploadResult.url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes || size,
      originalName: originalname,
    });
  } catch (error) {
    console.error("Image upload controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while uploading image.",
    });
  }
};
