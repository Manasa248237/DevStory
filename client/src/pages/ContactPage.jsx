import React, { useState, useEffect } from "react";
import {
  Mail,
  Clock,
  Code2,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  User,
  Tag,
  MessageSquare,
} from "lucide-react";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import SpotlightCard from "../components/ui/SpotlightCard.jsx";
import GridPattern from "../components/ui/GridPattern.jsx";
import { contactApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import useDocumentMeta from "../hooks/useDocumentMeta.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { user } = useAuth();

  useDocumentMeta({
    title: "Contact DevStory",
    description: "Get in touch with the DevStory engineering and editorial team for collaborations, feedback, or inquiries.",
    type: "website",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  // Pre-fill user name and email if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedSubject = formData.subject.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName) {
      newErrors.name = "Name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Name must be at least 2 characters long.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Name cannot exceed 100 characters.";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (trimmedEmail.length > 255) {
      newErrors.email = "Email address is too long.";
    }

    if (!trimmedSubject) {
      newErrors.subject = "Subject is required.";
    } else if (trimmedSubject.length < 2) {
      newErrors.subject = "Subject must be at least 2 characters long.";
    } else if (trimmedSubject.length > 200) {
      newErrors.subject = "Subject cannot exceed 200 characters.";
    }

    if (!trimmedMessage) {
      newErrors.message = "Message is required.";
    } else if (trimmedMessage.length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    } else if (trimmedMessage.length > 5000) {
      newErrors.message = "Message cannot exceed 5000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const response = await contactApi.submit(payload);

      if (response && response.success) {
        setSubmitSuccess(true);
        setSuccessInfo(response.data || null);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        setSubmitError(response?.message || "Something went wrong while submitting your message.");
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      setSubmitError(err.message || "Unable to send message. Please check your network connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSuccess = () => {
    setSubmitSuccess(false);
    setSuccessInfo(null);
    setSubmitError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Page Header */}
      <div className="relative text-center space-y-4 pt-2">
        <GridPattern className="opacity-60" />
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Mail className="w-3.5 h-3.5" />
          Get in Touch
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact the Engineering Team
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Have feedback on an article, want to propose a guest editorial, or discuss modern software architecture? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Information
            </h3>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 shadow-xs">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Editorial & Support</div>
                  <a href="mailto:contact@devstory.local" className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">
                    contact@devstory.local
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Response Time</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">Usually within 24–48 business hours</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 shrink-0 shadow-xs">
                  <Code2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Open Collaboration</div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">Articles, Tutorials & Code Reviews</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your messages are stored securely in MongoDB Atlas and reviewed directly by the DevStory engineering team.
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Send a Message
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                <span className="text-rose-500 font-bold">*</span> Required fields
              </span>
            </div>

            {/* Error Message Alert */}
            {submitError && (
              <ErrorMessage
                title="Submission Failed"
                message={submitError}
              />
            )}

            {/* Success Feedback Card */}
            {submitSuccess ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 space-y-4 animate-fadeIn">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      Message Received!
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      Thank you for contacting us{successInfo?.name ? `, ${successInfo.name}` : ""}. Your message regarding <strong>"{successInfo?.subject || "your inquiry"}"</strong> has been delivered directly to our engineering inbox.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetSuccess}
                    className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Send Another Message</span>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ada Lovelace"
                    icon={<User className="w-4 h-4" />}
                    error={errors.name}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    label="Email Address"
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ada@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    error={errors.email}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <Input
                  label="Subject"
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Question about Distributed Caching guide"
                  icon={<Tag className="w-4 h-4" />}
                  error={errors.subject}
                  required
                  disabled={isSubmitting}
                />

                {/* Message Textarea */}
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="contact-message"
                      className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {formData.message.length} / 5000
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here (min 10 characters)..."
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-100 dark:disabled:bg-slate-800 ${
                      errors.message
                        ? "border-rose-300 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20"
                        : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-400 dark:hover:border-slate-600 shadow-xs"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[160px] gap-2 shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
