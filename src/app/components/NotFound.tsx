import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        className="flex flex-col items-center text-center"
      >
        <div className="bg-red-100 rounded-full p-6 mb-6">
          <AlertCircle className="w-24 h-24 text-red-500" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-8 py-4 bg-[#F5C842] text-[#1B1B1B] rounded-2xl font-semibold shadow-lg shadow-[#F5C842]/30 transition-all hover:shadow-xl hover:shadow-[#F5C842]/40"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </motion.div>
    </div>
  );
}
