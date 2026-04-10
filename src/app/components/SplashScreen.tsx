import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, Sparkles } from "lucide-react";
import { Preferences } from "@capacitor/preferences";

export default function SplashScreen() {
  const navigate = useNavigate();

useEffect(() => {
  const timer = setTimeout(async () => {
    const { value: hasLoggedInBefore } = await Preferences.get({ key: "has_logged_in" });
    const { value: token } = await Preferences.get({ key: "study_first_token" });

    console.log("has_logged_in:", hasLoggedInBefore);
    console.log("token:", token);

    if (hasLoggedInBefore && token) {
      navigate("/dashboard", { replace: true });
    } else if (hasLoggedInBefore) {
      navigate("/auth", { replace: true });
    } else {
      navigate("/welcome", { replace: true });
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1B1B1B]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-[#F5C842]/20 rounded-full blur-3xl scale-150" />
          <div className="relative bg-white rounded-3xl p-6 shadow-2xl shadow-[#F5C842]/20">
            <BookOpen className="w-20 h-20 text-[#1B1B1B]" strokeWidth={2} />
          </div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-[#F5C842] fill-[#F5C842]" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col items-center gap-2"
        >
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Study First
          </h1>
          <p className="text-gray-400 text-lg">Focus. Achieve. Succeed.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-[#F5C842] rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}