// src/features/blogs/components/BlogShareModal.jsx
import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  MessageCircle,
  Send,
  Mail,
} from "lucide-react";

const BlogShareModal = ({
  isOpen,
  blog,
  onClose,
  onShare,
  loading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    blog?.canonicalUrl || `https://propenu.com/blogs/${blog?.slug || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDirectShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(blog?.title || "");

    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,

      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,

      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,

      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,

      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }

    onShare?.({
      id: blog?._id || blog?.id,
      platform,
      url: shareUrl,
    });
  };

  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center gap-2"> */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Share2 size={16} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-800">
              Share Blog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={17} />
          </button>
        </div>

        {/* Blog Title */}
        <p className="text-sm text-gray-500 line-clamp-2 border-l-2 border-emerald-400 pl-3">
          {blog?.title}
        </p>

        {/* Copy Link */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Share Link
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
            <Globe size={13} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 flex-1 truncate">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Social Share */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Share on Social
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <SocialBtn
              icon={<Twitter size={15} />}
              label="Twitter"
              color="bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100"
              onClick={() => handleDirectShare("twitter")}
            />
            <SocialBtn
              icon={<Linkedin size={15} />}
              label="LinkedIn"
              color="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
              onClick={() => handleDirectShare("linkedin")}
            />
            <SocialBtn
              icon={<Facebook size={15} />}
              label="Facebook"
              color="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
              onClick={() => handleDirectShare("facebook")}
            />
            <SocialBtn
              icon={<MessageCircle size={15} />}
              label="WhatsApp"
              color="bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
              onClick={() => handleDirectShare("whatsapp")}
            />
            <SocialBtn
              icon={<Send size={15} />}
              label="Telegram"
              color="bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100"
              onClick={() => handleDirectShare("telegram")}
            />
            <SocialBtn
              icon={<Mail size={15} />}
              label="Email"
              color="bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100"
              onClick={() => handleDirectShare("email")}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const SocialBtn = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${color}`}
  >
    {icon} {label}
  </button>
);

export default BlogShareModal;
