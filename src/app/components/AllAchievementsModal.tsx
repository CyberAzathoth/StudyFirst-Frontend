import { motion, AnimatePresence } from "motion/react";
import { X, Award, Lock } from "lucide-react";

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

interface AllAchievementsModalProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  onAchievementClick: (achievement: Achievement) => void;
}

export default function AllAchievementsModal({
  achievements,
  isOpen,
  onClose,
  onAchievementClick,
}: AllAchievementsModalProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#1B1B1B] px-6 pt-6 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#F5C842]/20 backdrop-blur-sm rounded-2xl p-2">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">All Achievements</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 flex items-center justify-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Progress:</span>
                <span className="text-lg font-bold text-[#F5C842]">
                  {unlockedCount}/{totalCount}
                </span>
                <div className="flex-1 ml-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#F5C842] to-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onAchievementClick(achievement)}
                    className={`relative rounded-2xl p-5 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color}`
                        : "bg-gray-100"
                    }`}
                  >
                    {!achievement.unlocked && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
                          <Lock className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-4">
                      <div
                        className={`text-5xl ${
                          achievement.unlocked ? "" : "grayscale opacity-50"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-bold mb-1 ${
  achievement.unlocked ? "text-gray-900" : "text-gray-900"
}`}
                        >
                          {achievement.title}
                        </h3>
                        <p
                          className={`text-sm mb-2 ${
  achievement.unlocked ? "text-gray-700" : "text-gray-600"
}`}
                        >
                          {achievement.description}
                        </p>
                        <div
                          className={`text-xs font-medium ${
  achievement.unlocked ? "text-gray-600" : "text-gray-500"
}`}

                        >
                          {achievement.unlocked
                            ? `Unlocked: ${achievement.unlockedDate}`
                            : `Requirement: ${achievement.requirement}`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
