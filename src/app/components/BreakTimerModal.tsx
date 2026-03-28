import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Coffee, Clock, Gift, Timer, AlertCircle } from "lucide-react";

interface BreakTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentJustCompleted?: boolean; // New prop to track if assignment was just completed
}

export default function BreakTimerModal({
  isOpen,
  onClose,
  assignmentJustCompleted = false,
}: BreakTimerModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  // Daily break tracking (max 2 hours = 120 minutes)
  const [dailyBreakUsed, setDailyBreakUsed] = useState(0); // in minutes
  const maxDailyBreak = 120; // 2 hours in minutes
  
  // Interval tracking (1.5 hours = 90 minutes between breaks)
  const [lastBreakEndTime, setLastBreakEndTime] = useState<number | null>(null);
  const breakIntervalRequired = 90; // 90 minutes (1 hour 30 minutes)
  
  // Check if enough time has passed since last break
  const canTakeBreakByInterval = () => {
    if (!lastBreakEndTime) return true; // First break of the day
    const now = Date.now();
    const minutesSinceLastBreak = (now - lastBreakEndTime) / 1000 / 60;
    return minutesSinceLastBreak >= breakIntervalRequired;
  };

  // Calculate time until next break is allowed
  const getMinutesUntilNextBreak = () => {
    if (!lastBreakEndTime) return 0;
    const now = Date.now();
    const minutesSinceLastBreak = (now - lastBreakEndTime) / 1000 / 60;
    const remaining = breakIntervalRequired - minutesSinceLastBreak;
    return Math.max(0, Math.ceil(remaining));
  };

  const canTakeBreak = assignmentJustCompleted || canTakeBreakByInterval();
  const dailyBreakRemaining = maxDailyBreak - dailyBreakUsed;

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeRemaining !== null && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((time) => (time !== null ? time - 1 : null));
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      setLastBreakEndTime(Date.now());
      // Break ended
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const startBreak = (minutes: number) => {
    // Check if user has enough daily break time remaining
    if (dailyBreakRemaining < minutes) {
      alert(`You only have ${dailyBreakRemaining} minutes of break time left today.`);
      return;
    }

    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setIsActive(true);
    setDailyBreakUsed((prev) => prev + minutes);
  };

  const cancelBreak = () => {
    // Return unused break time
    if (selectedDuration && timeRemaining) {
      const unusedMinutes = Math.ceil(timeRemaining / 60);
      setDailyBreakUsed((prev) => Math.max(0, prev - unusedMinutes));
    }
    
    setIsActive(false);
    setTimeRemaining(null);
    setSelectedDuration(null);
    setLastBreakEndTime(Date.now());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDailyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Take a Break</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

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

                {/* Reward Badge if assignment completed */}
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
                {!canTakeBreak && !assignmentJustCompleted && (
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
                          </span>
                          .
                        </p>
                        <p className="text-xs text-orange-700 mt-2">
                          ��� Complete an assignment to unlock an instant break!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <Coffee className="w-20 h-20 text-orange-500" />
                </div>

                <p className="text-gray-600 text-center mb-6">
                  Choose how long you need. Apps will unlock temporarily.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => startBreak(15)}
                    disabled={!canTakeBreak || dailyBreakRemaining < 15}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    15 Minutes
                  </button>
                  <button
                    onClick={() => startBreak(30)}
                    disabled={!canTakeBreak || dailyBreakRemaining < 30}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    30 Minutes
                  </button>
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  {canTakeBreak
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