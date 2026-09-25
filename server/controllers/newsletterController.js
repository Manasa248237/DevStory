import Subscriber from "../models/Subscriber.js";

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/**
 * @route   POST /api/newsletter/subscribe
 * @desc    Subscribe or resubscribe an email to the DevStory newsletter
 * @access  Public
 */
export const subscribe = async (req, res, next) => {
  try {
    const { email, source } = req.body || {};

    // 1. Validate email presence
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Validate email format
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // 3. Check for existing subscriber record
    const existingSubscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (existingSubscriber) {
      if (existingSubscriber.status === "active") {
        return res.status(200).json({
          success: true,
          isSubscribed: true,
          isDuplicate: true,
          message: "You are already subscribed to our newsletter.",
        });
      }

      // Existing subscriber is currently unsubscribed -> Reactivate subscription
      existingSubscriber.status = "active";
      existingSubscriber.subscribedAt = new Date();
      existingSubscriber.unsubscribedAt = null;
      if (source) existingSubscriber.source = source;

      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        isSubscribed: true,
        isResubscribed: true,
        message: "Welcome back! Your newsletter subscription has been reactivated.",
      });
    }

    // 4. Create new active subscriber
    try {
      await Subscriber.create({
        email: normalizedEmail,
        status: "active",
        subscribedAt: new Date(),
        source: source || "website_footer",
      });

      res.status(201).json({
        success: true,
        isSubscribed: true,
        message: "Thank you for subscribing to the DevStory newsletter!",
      });
    } catch (err) {
      // Handle MongoDB race condition duplicate key error (11000)
      if (err.code === 11000) {
        return res.status(200).json({
          success: true,
          isSubscribed: true,
          isDuplicate: true,
          message: "You are already subscribed to our newsletter.",
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/newsletter/unsubscribe
 * @desc    Unsubscribe an email from the DevStory newsletter
 * @access  Public
 */
export const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const subscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (!subscriber || subscriber.status === "unsubscribed") {
      return res.status(200).json({
        success: true,
        isSubscribed: false,
        message: "Email is not currently subscribed to the newsletter.",
      });
    }

    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      success: true,
      isSubscribed: false,
      message: "You have been successfully unsubscribed from the newsletter.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/newsletter/subscribers
 * @desc    Get all newsletter subscribers (Admin / Protected internal use)
 * @access  Private / Admin
 */
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    next(error);
  }
};
