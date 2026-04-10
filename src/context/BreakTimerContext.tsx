import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AppLock from "../lib/applock";
import { notificationsService } from '../app/services/notifications.service';
import { Preferences } from "@capacitor/preferences";

interface BreakTimerContextType {
  isActive: boolean;
  timeRemaining: number | null;
  selectedDuration: number | null;
  dailyBreakUsed: number;
  dailyBreakRemaining: number;
  lastBreakEndTime: number | null;
  canTakeBreak: (assignmentJustCompleted: boolean) => boolean;
  getMinutesUntilNextBreak: () => number;
  startBreak: (minutes: number) => Promise<void>;
  cancelBreak: () => Promise<void>;
  formatTime: (seconds: number) => string;
  formatDailyTime: (minutes: number) => string;
  hasTodayTasks: boolean;
setHasTodayTasks: (value: boolean) => void;
showCooldownResetModal: boolean;
setShowCooldownResetModal: (value: boolean) => void;
}

const BreakTimerContext = createContext<BreakTimerContextType | null>(null);

export function BreakTimerProvider({ children }: { children: ReactNode }) {
  const maxDailyBreak = 120;
  const breakIntervalRequired = 90;
  const [hasTodayTasks, setHasTodayTasks] = useState(false);
  const [showCooldownResetModal, setShowCooldownResetModal] = useState(false);
  // Restore timer state from localStorage on mount
  const [selectedDuration, setSelectedDuration] = useState<number | null>(() => {
    const saved = localStorage.getItem("break_selected_duration");
    return saved ? parseInt(saved) : null;
  });

  const [breakStartTime, setBreakStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("break_start_time");
    return saved ? parseInt(saved) : null;
  });

  const [isActive, setIsActive] = useState<boolean>(() => {
    const savedStart = localStorage.getItem("break_start_time");
    const savedDuration = localStorage.getItem("break_selected_duration");
    if (!savedStart || !savedDuration) return false;
    const elapsed = (Date.now() - parseInt(savedStart)) / 1000;
    const totalSeconds = parseInt(savedDuration) * 60;
    return elapsed < totalSeconds;
  });

  const [timeRemaining, setTimeRemaining] = useState<number | null>(() => {
    const savedStart = localStorage.getItem("break_start_time");
    const savedDuration = localStorage.getItem("break_selected_duration");
    if (!savedStart || !savedDuration) return null;
    const elapsed = Math.floor((Date.now() - parseInt(savedStart)) / 1000);
    const totalSeconds = parseInt(savedDuration) * 60;
    const remaining = totalSeconds - elapsed;
    return remaining > 0 ? remaining : null;
  });

  const [dailyBreakUsed, setDailyBreakUsed] = useState<number>(() => {
    const saved = localStorage.getItem("break_daily_used");
    const savedDate = localStorage.getItem("break_daily_date");
    const today = new Date().toDateString();
    if (savedDate !== today) {
      localStorage.setItem("break_daily_date", today);
      localStorage.setItem("break_daily_used", "0");
      return 0;
    }
    return saved ? parseInt(saved) : 0;
  });

  const [lastBreakEndTime, setLastBreakEndTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("break_last_end_time");
    return saved ? parseInt(saved) : null;
  });

  // Persist daily used
  useEffect(() => {
    localStorage.setItem("break_daily_used", dailyBreakUsed.toString());
    localStorage.setItem("break_daily_date", new Date().toDateString());
  }, [dailyBreakUsed]);

  // Persist last break end time
  useEffect(() => {
    if (lastBreakEndTime !== null) {
      localStorage.setItem("break_last_end_time", lastBreakEndTime.toString());
    }
  }, [lastBreakEndTime]);

  useEffect(() => {
  if (!lastBreakEndTime || !hasTodayTasks) return;
const msUntilReset = (lastBreakEndTime + 90 * 60 * 1000) - Date.now();
  if (msUntilReset <= 0) return;
  const timeout = window.setTimeout(async () => {
  const { value: remindersEnabled } = await Preferences.get({ key: "break_reminders_enabled" });
  if (remindersEnabled !== "false") {
    setShowCooldownResetModal(true);
  }
}, msUntilReset);
  return () => clearTimeout(timeout);
}, [lastBreakEndTime, hasTodayTasks]);

  // Timer tick — uses real clock diff to stay accurate across navigation
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && breakStartTime !== null && selectedDuration !== null) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - breakStartTime) / 1000);
        const totalSeconds = selectedDuration * 60;
        const remaining = totalSeconds - elapsed;
        if (remaining <= 0) {
  setTimeRemaining(0);
  setIsActive(false);
  const endTime = Date.now();
  setLastBreakEndTime(endTime);
  localStorage.removeItem("break_start_time");
  localStorage.removeItem("break_selected_duration");
  if (hasTodayTasks) {
    (async () => { try { await AppLock.resumeLocking(); } catch (e) {} })();
    (async () => {
      const nextCooldownReset = new Date(endTime + 90 * 60 * 1000);
      await notificationsService.scheduleBreakReminders(nextCooldownReset);
    })();
  }
  clearInterval(interval);
} else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, breakStartTime, selectedDuration, hasTodayTasks]);

  const canTakeBreakByInterval = () => {
    if (!lastBreakEndTime) return true;
    const minutesSinceLastBreak = (Date.now() - lastBreakEndTime) / 1000 / 60;
    return minutesSinceLastBreak >= breakIntervalRequired;
  };

  const getMinutesUntilNextBreak = () => {
    if (!lastBreakEndTime) return 0;
    const minutesSinceLastBreak = (Date.now() - lastBreakEndTime) / 1000 / 60;
    return Math.max(0, Math.ceil(breakIntervalRequired - minutesSinceLastBreak));
  };

  const canTakeBreak = (assignmentJustCompleted: boolean) =>
    assignmentJustCompleted || canTakeBreakByInterval();

  const dailyBreakRemaining = maxDailyBreak - dailyBreakUsed;

  const startBreak = async (minutes: number) => {
  if (dailyBreakRemaining < minutes) {
    alert(`You only have ${dailyBreakRemaining} minutes of break time left today.`);
    return;
  }
  await notificationsService.cancelBreakReminders();
  setShowCooldownResetModal(false);
  const now = Date.now();
    try { await AppLock.pauseLocking(); } catch (e) {}
    setSelectedDuration(minutes);
    setBreakStartTime(now);
    setTimeRemaining(minutes * 60);
    setIsActive(true);
    setDailyBreakUsed((prev) => prev + minutes);
    // Persist to localStorage so navigation doesn't reset it
    localStorage.setItem("break_start_time", now.toString());
    localStorage.setItem("break_selected_duration", minutes.toString());
  };

  const cancelBreak = async () => {
    await notificationsService.cancelBreakReminders();
if (hasTodayTasks) {
  const nextCooldownReset = new Date(Date.now() + 90 * 60 * 1000);
  await notificationsService.scheduleBreakReminders(nextCooldownReset);
}
  if (breakStartTime && selectedDuration) {
    const elapsed = Math.floor((Date.now() - breakStartTime) / 1000 / 60);
    const unusedMinutes = selectedDuration - elapsed;
    if (unusedMinutes > 0) {
      setDailyBreakUsed((prev) => Math.max(0, prev - unusedMinutes));
    }
  }
  // Only re-lock if there are tasks due today
  if (hasTodayTasks) {
    try { await AppLock.resumeLocking(); } catch (e) {}
  }
  setIsActive(false);
  setTimeRemaining(null);
  setSelectedDuration(null);
  setBreakStartTime(null);
  setLastBreakEndTime(Date.now());
  localStorage.removeItem("break_start_time");
  localStorage.removeItem("break_selected_duration");
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDailyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <BreakTimerContext.Provider value={{
      isActive, timeRemaining, selectedDuration,
      dailyBreakUsed, dailyBreakRemaining, lastBreakEndTime,
      showCooldownResetModal, setShowCooldownResetModal,
      hasTodayTasks, setHasTodayTasks,
      canTakeBreak, getMinutesUntilNextBreak,
      startBreak, cancelBreak, formatTime, formatDailyTime,
    }}>
      {children}
    </BreakTimerContext.Provider>
  );
}

export function useBreakTimer() {
  const ctx = useContext(BreakTimerContext);
  if (!ctx) throw new Error("useBreakTimer must be used within BreakTimerProvider");
  return ctx;
}