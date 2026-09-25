import Contact from "../models/Contact.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    let { name, email, subject, message } = req.body || {};

    // 1. Validate required fields existence
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // 2. Sanitize and trim
    name = name.trim();
    email = email.trim().toLowerCase();
    subject = subject.trim();
    message = message.trim();

    // 3. Length & format validations
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (subject.length < 2 || subject.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject must be between 2 and 200 characters.",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long.",
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 5000 characters.",
      });
    }

    // Optional user attachment if authenticated
    const userId = req.user ? (req.user._id || req.user.id) : null;

    // 4. Save to MongoDB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      status: "unread",
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been received.",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all contact messages (Admin)
 * @route   GET /api/contact
 * @access  Private/Admin
 */
export const getContactMessages = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && ["unread", "read", "archived", "replied"].includes(status)) {
      query.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [messages, total, unreadCount] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("user", "name email role")
        .lean(),
      Contact.countDocuments(query),
      Contact.countDocuments({ status: "unread" }),
    ]);

    return res.status(200).json({
      success: true,
      count: messages.length,
      total,
      unreadCount,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single contact message by ID (Admin)
 * @route   GET /api/contact/:id
 * @access  Private/Admin
 */
export const getContactMessageById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("user", "name email role")
      .lean();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact message status (Admin)
 * @route   PATCH /api/contact/:id/status
 * @access  Private/Admin
 */
export const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !["unread", "read", "archived", "replied"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values: unread, read, archived, replied.",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Message status updated to ${status}.`,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact message (Admin)
 * @route   DELETE /api/contact/:id
 * @access  Private/Admin
 */
export const deleteContactMessage = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
