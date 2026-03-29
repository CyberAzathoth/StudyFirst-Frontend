import { motion } from "motion/react";
import { TrendingUp, Flame, Trophy, Target, Calendar, Award } from "lucide-react";
import BottomNav from "./BottomNav";
import { useState, useEffect } from "react";
import AchievementDetailModal from "./AchievementDetailModal";
import AllAchievementsModal from "./AllAchievementsModal";

const API = "https://studyfirstapi-production.up.railway.app";

const achievements = [
  {
    id: 1,
    title: "7 Day Streak",
    icon: "🔥",
    unlocked: false,
    color: "from-orange-500 to-red-500",
    description: "Maintain a 7-day streak of completing at least one assignment every day.",
    requirement: "Complete at least one assignment for 7 consecutive days.",
    unlockedDate: "",
  },
  {
    id: 2,
    title: "Early Bird",
    icon: "🌅",
    unlocked: false,
    color: "from-yellow-500 to-orange-500",
    description: "Complete an assignment before 8:00 AM.",
    requirement: "Complete any assignment before 8:00 AM.",
    unlockedDate: "",
  },
  {
    id: 3,
    title: "Perfect Week",
    icon: "⭐",
    unlocked: false,
    color: "from-purple-500 to-pink-500",
    description: "Complete all assignments for an entire week without missing any.",
    requirement: "Complete 100% of your assignments for 7 consecutive days.",
  },
  {
    id: 4,
    title: "Speed Demon",
    icon: "⚡",
    unlocked: false,
    color: "from-blue-500 to-cyan-500",
    description: "Complete 5 assignments in a single day.",
    requirement: "Complete 5 or more assignments in one day.",
    unlockedDate: "",
  },
  {
    id: 5,
    title: "30 Day Warrior",
    icon: "🏆",
    unlocked: false,
    color: "from-green-500 to-emerald-500",
    description: "Maintain a 30-day streak of completing assignments.",
    requirement: "Complete at least one assignment for 30 consecutive days.",
  },
  {
    id: 6,
    title: "Focus Master",
    icon: "🎯",
    unlocked: false,
    color: "from-indigo-500 to-purple-500",
    description: "Complete 100 total assignments using Study First.",
    requirement: "Complete a total of 100 assignments.",
  },
];

export default function ProgressScreen() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  type WeekDay = { day: string; completed: number; total: number; percentage: number };
  const [weeklyProgress, setWeeklyProgress] = useState<WeekDay[]>([]);
  const [dynamicAchievements, setDynamicAchievements] = useState(achievements);
  const [selectedAchievement, setSelectedAchievement] = useState<typeof achievements[0] | null>(null);
  const [showAchievementDetail, setShowAchievementDetail] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const token = localStorage.getItem("study_first_token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    try {
      // Fetch streak
      const streakRes = await fetch(`${API}/streaks/current`, { headers: authHeaders });
      if (streakRes.ok) {
        const streakData = await streakRes.json();
        setCurrentStreak(streakData.currentStreak || 0);
        setLongestStreak(streakData.longestStreak || 0);

        // Update achievements based on real streak
        setDynamicAchievements(prev => prev.map(a => {
          if (a.id === 1) return { ...a, unlocked: streakData.currentStreak >= 7 };
          if (a.id === 5) return { ...a, unlocked: streakData.currentStreak >= 30 };
          return a;
        }));
      }

      // Fetch weekly tasks
      const tasksRes = await fetch(`${API}/tasks/week`, { headers: authHeaders });
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();

        // Count total completed
        const completed = tasks.filter((t: any) => t.isCompleted).length;
        setTotalCompleted(completed);

        // Update Focus Master achievement
        setDynamicAchievements(prev => prev.map(a => {
          if (a.id === 6) return { ...a, unlocked: completed >= 100 };
          return a;
        }));

        // Build weekly progress from tasks
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const weekData = days.map((day, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - today.getDay() + i);
          const dayTasks = tasks.filter((t: any) => {
            const d = new Date(t.dueDate);
            return (
              d.getFullYear() === date.getFullYear() &&
              d.getMonth() === date.getMonth() &&
              d.getDate() === date.getDate()
            );
          });
          const completedDay = dayTasks.filter((t: any) => t.isCompleted).length;
          const total = dayTasks.length;
          return {
            day,
            completed: completedDay,
            total,
            percentage: total > 0 ? Math.round((completedDay / total) * 100) : 0,
          };
        });
        setWeeklyProgress(weekData);

        // Speed Demon: 5 completed today
        const todayTasks = tasks.filter((t: any) => {
          const d = new Date(t.dueDate);
          return d.toDateString() === today.toDateString() && t.isCompleted;
        });
        setDynamicAchievements(prev => prev.map(a => {
          if (a.id === 4) return { ...a, unlocked: todayTasks.length >= 5 };
          return a;
        }));
      }
    } catch (e) {
      console.error("Failed to fetch progress data", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const weekCompletionRate = weeklyProgress.length > 0
  ? Math.round(
      weeklyProgress.reduce((sum: number, d: WeekDay) => sum + d.percentage, 0) / weeklyProgress.length
    )
  : 0;

  const openAchievementDetail = (achievement: typeof achievements[0]) => {
    setSelectedAchievement(achievement);
    setShowAchievementDetail(true);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-[#1B1B1B] px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#F5C842]/20 backdrop-blur-sm rounded-2xl p-3">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Progress</h1>
              <p className="text-gray-400">Your Stats & Achievements</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Current Streak</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{currentStreak}</div>
              <div className="text-xs text-gray-500">days</div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalCompleted}</div>
              <div className="text-xs text-gray-500">tasks this week</div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">This Week</h2>
            <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">
                {weekCompletionRate}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {weeklyProgress.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Loading weekly data...</div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-40">
                {weeklyProgress.map((day: WeekDay, index: number) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end h-32">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${day.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`w-full rounded-t-lg ${
                          day.percentage === 100
                            ? "bg-gradient-to-t from-green-400 to-green-500"
                            : day.percentage >= 70
                            ? "bg-gradient-to-t from-blue-400 to-blue-500"
                            : day.percentage > 0
                            ? "bg-gradient-to-t from-gray-300 to-gray-400"
                            : "bg-gray-100"
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{day.day}</div>
                      <div className="text-xs text-gray-500">
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
            </div>
            <button
              className="px-4 py-2 text-sm font-semibold text-[#1B1B1B] bg-[#F5C842] rounded-lg hover:bg-[#F5C842]/90 transition-all shadow-sm"
              onClick={() => setShowAllAchievements(true)}
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {dynamicAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                whileTap={{ scale: achievement.unlocked ? 0.95 : 1 }}
                onClick={() => openAchievementDetail(achievement)}
                className={`relative rounded-2xl p-4 shadow-sm cursor-pointer ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${achievement.color}`
                    : "bg-gray-200"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`text-4xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                    {achievement.icon}
                  </div>
                  <span className={`text-xs font-medium text-center ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                    {achievement.title}
                  </span>
                </div>
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl backdrop-blur-sm">
                    <div className="text-white text-2xl">🔒</div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="px-6 pb-6 space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Insights</h2>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">
                  {currentStreak > 0 ? `${currentStreak} day streak! 🔥` : "Start your streak today!"}
                </h3>
                <p className="text-sm text-blue-100">
                  {currentStreak >= 7
                    ? "Amazing! You've unlocked the 7 Day Streak achievement!"
                    : currentStreak > 0
                    ? `${7 - currentStreak} more days to unlock the 7 Day Streak achievement!`
                    : "Complete a task today to start your streak!"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <Target className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Longest streak</h3>
                <p className="text-sm text-purple-100">
                  Your best streak is {longestStreak} day{longestStreak !== 1 ? "s" : ""}. Keep pushing to beat your record!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activePage="progress" />
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={showAchievementDetail}
        onClose={() => setShowAchievementDetail(false)}
      />
      <AllAchievementsModal
        achievements={dynamicAchievements}
        isOpen={showAllAchievements}
        onClose={() => setShowAllAchievements(false)}
        onAchievementClick={(achievement) => {
          setShowAllAchievements(false);
          openAchievementDetail(achievement);
        }}
      />
    </div>
  );
}