export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className={`${sizes[size]} border-4 border-[#27EA60] border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}
