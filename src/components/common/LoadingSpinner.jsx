export default function LoadingSpinner({
  size = "md",
  /** Full-screen overlay — avoid for Suspense; use for rare blocking gates only */
  fullscreen = false,
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const spinner = (
    <div
      className={`${sizes[size] || sizes.md} border-4 border-[#27EA60] border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex min-h-[240px] w-full items-center justify-center py-10">
      {spinner}
    </div>
  );
}
