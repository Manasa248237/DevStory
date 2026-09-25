import User from "../models/User.js";
import Article from "../models/Article.js";

/**
 * @route   GET /api/users/profile
 * @desc    Get current authenticated user profile
 * @access  Private (Protected by JWT)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
    }

    // Retrieve published article count for the user
    const articlesCount = await Article.countDocuments({
      author: user._id,
      status: "published",
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.name, // alias for client compatibility
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        bio: user.bio || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        articlesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current authenticated user's permitted profile fields
 * @access  Private (Protected by JWT)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { name, username, bio, avatar, role, password, _id, id, email } = req.body;

    // 1. Validation for name/username
    const nameInput = name !== undefined ? name : username;
    if (nameInput !== undefined) {
      if (typeof nameInput !== "string" || nameInput.trim().length < 2 || nameInput.trim().length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be a string between 2 and 50 characters long.",
        });
      }
      user.name = nameInput.trim();
    }

    // 2. Validation for bio
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > 250) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 250 characters.",
        });
      }
      user.bio = bio.trim();
    }

    // 3. Validation for avatar URL
    if (avatar !== undefined) {
      if (typeof avatar !== "string") {
        return res.status(400).json({
          success: false,
          message: "Avatar must be a string URL.",
        });
      }

      const trimmedAvatar = avatar.trim();
      // Allow empty string to remove avatar, or valid HTTP/HTTPS URL
      if (trimmedAvatar && !/^https?:\/\/.+/i.test(trimmedAvatar)) {
        return res.status(400).json({
          success: false,
          message: "Avatar must be a valid HTTP or HTTPS URL.",
        });
      }
      user.avatar = trimmedAvatar;
    }

    // Security Notice: role, password, email, and ID modifications are strictly forbidden on this endpoint
    // Any passed values for role, password, or _id are ignored and remain unchanged.

    await user.save();

    // Retrieve published article count
    const articlesCount = await Article.countDocuments({
      author: user._id,
      status: "published",
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        username: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
        bio: user.bio || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        articlesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
