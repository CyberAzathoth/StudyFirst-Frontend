import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Lock, TrendingUp, Trophy, ChevronRight, ChevronLeft } from "lucide-react";

const slides = [
  {
    icon: BookOpen,
    title: "Stay Focused on What Matters",
    description: "Sync your Google Classroom assignments and focus on today's tasks without distractions.",
  },
  {
    icon: Lock,
    title: "Smart App Blocking",
    description: "Lock distracting apps until your assignments are complete. Take controlled breaks when needed.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor your weekly assignments and completion rates with detailed insights.",
  },
  {
    icon: Trophy,
    title: "Build Study Streaks",
    description: "Earn rewards and maintain daily streaks to build lasting study habits.",
  },
];

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#1B1B1B]">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#F5C842]/20 rounded-full blur-3xl scale-150" />
              <div className="relative bg-white rounded-3xl p-8 mb-8 shadow-2xl shadow-[#F5C842]/20">
                <Icon className="w-24 h-24 text-[#1B1B1B]" strokeWidth={1.5} />
              </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              {slide.title}
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-12 space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-[#F5C842]"
                  : "w-2 bg-gray-600"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {currentSlide > 0 && (
            <button
              onClick={prevSlide}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-700 text-gray-300 font-semibold transition-all hover:bg-gray-800/50"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}
          
          <button
            onClick={nextSlide}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#F5C842] text-[#1B1B1B] rounded-2xl font-semibold shadow-lg shadow-[#F5C842]/30 transition-all hover:shadow-xl hover:shadow-[#F5C842]/40 hover:bg-[#F5C842]/90"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => navigate("/auth")}
          className="w-full text-gray-500 font-medium py-2 hover:text-gray-400"
        >
          Skip
        </button>
      </div>
    </div>
  );
}