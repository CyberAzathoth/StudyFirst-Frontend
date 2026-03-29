import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleGoogleAuth = useGoogleLogin({
  onSuccess: async (codeResponse) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("https://studyfirstapi-production.up.railway.app/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authCode: codeResponse.code }),
      });
      console.log("Auth code:", codeResponse.code);
      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("study_first_token", data.token);
      localStorage.setItem("study_first_auth", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  },
  onError: () => setError("Google login was cancelled or failed."),
  flow: "auth-code",
  scope: [
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "profile",
    "email",
  ].join(" "),
});

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1B1B1B] px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="bg-white rounded-2xl p-3">
          <BookOpen className="w-8 h-8 text-[#1B1B1B]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Study First</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">Welcome</h2>
          <p className="text-gray-600 mb-8 text-center">
            Sign in with Google Classroom to start building better study habits
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm w-full text-center">
              {error}
            </div>
          )}

          <button
            onClick={() => handleGoogleAuth()}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-[#F5C842]/50 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google Classroom
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}