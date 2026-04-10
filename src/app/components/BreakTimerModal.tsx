import { motion, AnimatePresence } from "motion/react";
import { X, Coffee, Clock, Gift, Timer, AlertCircle } from "lucide-react";
import { useBreakTimer } from "../../context/BreakTimerContext";


interface BreakTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentJustCompleted?: boolean;
}

export default function BreakTimerModal({
  isOpen,
  onClose,
  assignmentJustCompleted = false,
}: BreakTimerModalProps) {
  const {
    isActive,
    timeRemaining,
    dailyBreakRemaining,
    dailyBreakUsed,
    canTakeBreak,
    getMinutesUntilNextBreak,
    startBreak,
    cancelBreak,
    formatTime,
    formatDailyTime,
    showCooldownResetModal,
  setShowCooldownResetModal,
  } = useBreakTimer();

  const maxDailyBreak = 120;
  const canBreak = canTakeBreak(assignmentJustCompleted);

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
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Take a Break</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
{showCooldownResetModal && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 mb-4 text-white"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Coffee className="w-6 h-6 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Break cooldown reset! ☕</h4>
          <p className="text-sm text-white/90">
            You can take a break now. Rest is part of the grind!
          </p>
        </div>
      </div>
      <button
        onClick={() => setShowCooldownResetModal(false)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
)}
            {!isActive ? (
              <>
                {/* Daily Break Tracker */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      <span className="font-semibold">Daily Break Time</span>
                    </div>
                    <span className="text-lg font-bold">
                      {formatDailyTime(dailyBreakRemaining)}
                    </span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(dailyBreakRemaining / maxDailyBreak) * 100}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <p className="text-xs text-white/80 mt-2">
                    {dailyBreakUsed > 0
                      ? `${formatDailyTime(dailyBreakUsed)} used today`
                      : "Full 2 hours available"}
                  </p>
                </div>

                {/* Bonus break badge */}
                {assignmentJustCompleted && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gradient-to-r from-[#F5C842] to-yellow-500 rounded-2xl p-4 mb-6 text-[#1B1B1B]"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-8 h-8" />
                      <div>
                        <h4 className="font-bold text-lg">Bonus Break! 🎉</h4>
                        <p className="text-sm">
                          Assignment completed! Take an instant break without waiting.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Interval Warning */}
                {!canBreak && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-900 mb-1">
                          Break Interval Required
                        </h4>
                        <p className="text-sm text-orange-800">
                          You can take your next break in{" "}
                          <span className="font-bold">
                            {formatDailyTime(getMinutesUntilNextBreak())}
                          </span>.
                        </p>
                        <p className="text-xs text-orange-700 mt-2">
                          💡 Complete an assignment to unlock an instant break!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <Coffee className="w-14 h-14 text-orange-500" />
                </div>

                <p className="text-gray-600 text-center mb-6">
                  Choose how long you need. Apps will unlock temporarily.
                </p>
{dailyBreakRemaining === 0 && (
  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 text-center">
    <p className="font-semibold text-red-700">Daily break limit reached</p>
    <p className="text-sm text-red-600 mt-1">You've used all 2 hours. Resets tomorrow!</p>
  </div>
)}
                <div className="space-y-3">
                  <button
                    onClick={() => startBreak(15)}
                    disabled={!canBreak || dailyBreakRemaining < 15}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    15 Minutes
                  </button>
                  <button
                    onClick={() => startBreak(30)}
                    disabled={!canBreak || dailyBreakRemaining < 30}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    30 Minutes
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  {canBreak
                    ? "You'll receive a notification when your break is ending"
                    : "Complete an assignment or wait for the interval to pass"}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center mb-6">
                  <Clock className="w-16 h-16 text-blue-500 mb-4" />
                  <div className="text-6xl font-bold text-gray-900 mb-2">
                    {timeRemaining !== null ? formatTime(timeRemaining) : "0:00"}
                  </div>
                  <p className="text-gray-600">Break time remaining</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-blue-900 text-center">
                    Apps are temporarily unlocked. Get back to studying when you're ready!
                  </p>
                </div>

                <button
                  onClick={cancelBreak}
                  className="w-full px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-300 transition-all"
                >
                  End Break Early
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}