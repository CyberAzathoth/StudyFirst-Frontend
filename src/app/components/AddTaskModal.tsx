import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: { title: string; dueDate: Date; dueTime: string }) => void;
}

export default function AddTaskModal({ isOpen, onClose, onAddTask }: AddTaskModalProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dueTime, setDueTime] = useState("23:59");
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle,
        dueDate: selectedDate,
        dueTime: dueTime,
      });
      // Reset form
      setNewTaskTitle("");
      setSelectedDate(new Date());
      setDueTime("23:59");
      setShowCalendar(false);
      onClose();
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, tomorrow)) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#1B1B1B]/60 backdrop-blur-sm flex items-end z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full bg-white rounded-t-[2rem] shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#1B1B1B] tracking-tight">Add Task</h3>
                  <p className="text-sm text-gray-500 mt-1">Create a new manual task</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Task Title */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#1B1B1B] mb-3">
                  Task Description
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Complete Math Assignment"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[#1B1B1B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5C842]/30 focus:border-[#F5C842] focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              {/* Due Date Selector */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-[#1B1B1B] mb-3">
                  Due Date
                </label>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-100 hover:border-gray-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5C842]/20 rounded-lg flex items-center justify-center group-hover:bg-[#F5C842]/30 transition-colors">
                      <CalendarIcon className="w-5 h-5 text-[#F5C842]" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[#1B1B1B]">
                        {formatDate(selectedDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showCalendar ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Calendar */}
                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6">
                          <button
                            onClick={previousMonth}
                            className="w-9 h-9 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-[#1B1B1B]" />
                          </button>
                          <h4 className="font-bold text-[#1B1B1B] text-base">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </h4>
                          <button
                            onClick={nextMonth}
                            className="w-9 h-9 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-[#1B1B1B]" />
                          </button>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {weekDays.map((day) => (
                            <div
                              key={day}
                              className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                          {getDaysInMonth(currentMonth).map((date, index) => {
                            if (!date) {
                              return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const isSelected = isSameDay(date, selectedDate);
                            const isTodayDate = isToday(date);
                            const isPast = isPastDate(date);

                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedDate(date);
                                  setShowCalendar(false);
                                }}
                                disabled={isPast}
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                  isSelected
                                    ? "bg-[#F5C842] text-[#1B1B1B] shadow-md shadow-[#F5C842]/30"
                                    : isTodayDate
                                    ? "bg-[#F5C842]/20 text-[#1B1B1B] border border-[#F5C842]/40"
                                    : isPast
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "hover:bg-gray-100 text-[#1B1B1B]"
                                }`}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Due Time */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1B1B1B] mb-3">
                  Due Time
                </label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#F5C842]/20 rounded-lg flex items-center justify-center pointer-events-none">
                    <Clock className="w-5 h-5 text-[#F5C842]" />
                  </div>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full pl-20 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[#1B1B1B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5C842]/30 focus:border-[#F5C842] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#F5C842]/10 border border-[#F5C842]/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-[#F5C842] rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-[#1B1B1B] text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-[#1B1B1B] leading-relaxed">
                    Manual tasks can be marked as complete within the app. Choose a due date to stay organized.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white border border-gray-200 text-[#1B1B1B] rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 px-6 py-4 bg-[#F5C842] text-[#1B1B1B] rounded-xl font-semibold shadow-lg shadow-[#F5C842]/30 hover:shadow-xl hover:shadow-[#F5C842]/40 hover:bg-[#F5C842]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Add Task
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}