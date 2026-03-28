import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2, Lock } from "lucide-react";

interface Achievement {
  id: number;
  title: string;
  icon: string;
  unlocked: boolean;
  color: string;
  description: string;
  requirement: string;
  unlockedDate?: string;
}

interface AchievementDetailModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementDetailModal({
  achievement,
  isOpen,
  onClose,
}: AchievementDetailModalProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Unlocked
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Locked
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div
                className={`w-28 h-28 rounded-3xl flex items-center justify-center mb-4 ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${achievement.color} shadow-xl`
                    : "bg-gray-200"
                }`}
              >
                <div
                  className={`text-6xl ${
                    achievement.unlocked ? "" : "grayscale opacity-50"
                  }`}
                >
                  {achievement.icon}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {achievement.title}
              </h2>
              {achievement.unlocked && achievement.unlockedDate && (
                <p className="text-sm text-gray-500">
                  Unlocked on {achievement.unlockedDate}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {achievement.description}
                </p>
              </div>

              <div
                className={`rounded-2xl p-4 ${
                  achievement.unlocked
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-purple-50 border-2 border-purple-200"
                }`}
              >
                <h3
                  className={`text-sm font-semibold mb-2 ${
                    achievement.unlocked ? "text-green-900" : "text-purple-900"
                  }`}
                >
                  {achievement.unlocked ? "How you unlocked it:" : "How to unlock:"}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    achievement.unlocked ? "text-green-700" : "text-purple-700"
                  }`}
                >
                  {achievement.requirement}
                </p>
              </div>

              {!achievement.unlocked && (
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-sm text-blue-900 text-center">
                    Keep studying to unlock this achievement! 💪
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
