import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/src/assets/notfound.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "auto 100%",
        backgroundColor: "#B9F6E9",
      }}
    >
      <button
        onClick={() => navigate("/")}
        className="absolute flex items-center gap-2 bg-white/90 px-6 py-3 rounded-xl shadow-lg"
      >
        <Home size={18} />
        Go Home
      </button>
    </div>
  );
}
