import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { registerPlugin } from "@capacitor/core";

const AppLock = registerPlugin<any>("AppLock");

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
}

const BreakTimerContext = createContext<BreakTimerContextType | null>(null);

export function BreakTimerProvider({ children }: { children: ReactNode }) {
  const maxDailyBreak = 120;
  const breakIntervalRequired = 90;

  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

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

  useEffect(() => {
    localStorage.setItem("break_daily_used", dailyBreakUsed.toString());
    localStorage.setItem("break_daily_date", new Date().toDateString());
  }, [dailyBreakUsed]);

  useEffect(() => {
    if (lastBreakEndTime !== null) {
      localStorage.setItem("break_last_end_time", lastBreakEndTime.toString());
    }
  }, [lastBreakEndTime]);

  // The timer that persists across page navigation
  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeRemaining !== null && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((t) => (t !== null ? t - 1 : null));
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      setLastBreakEndTime(Date.now());
      try { AppLock.resumeLocking(); } catch (e) {}
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeRemaining]);

  const canTakeBreakByInterval = () => {
    if (!lastBreakEndTime) return true;
    const now = Date.now();
    const minutesSinceLastBreak = (now - lastBreakEndTime) / 1000 / 60;
    return minutesSinceLastBreak >= breakIntervalRequired;
  };

  const getMinutesUntilNextBreak = () => {
    if (!lastBreakEndTime) return 0;
    const now = Date.now();
    const minutesSinceLastBreak = (now - lastBreakEndTime) / 1000 / 60;
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
    try { await AppLock.pauseLocking(); } catch (e) {}
    setSelectedDuration(minutes);
    setTimeRemaining(minutes * 60);
    setIsActive(true);
    setDailyBreakUsed((prev) => prev + minutes);
  };

  const cancelBreak = async () => {
    if (selectedDuration && timeRemaining) {
      const unusedMinutes = Math.ceil(timeRemaining / 60);
      setDailyBreakUsed((prev) => Math.max(0, prev - unusedMinutes));
    }
    try { await AppLock.resumeLocking(); } catch (e) {}
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
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <BreakTimerContext.Provider value={{
      isActive, timeRemaining, selectedDuration,
      dailyBreakUsed, dailyBreakRemaining, lastBreakEndTime,
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