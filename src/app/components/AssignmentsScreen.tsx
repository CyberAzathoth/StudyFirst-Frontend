import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import BottomNav from "./BottomNav";
import AssignmentDetailModal from "./AssignmentDetailModal";
import { Preferences } from "@capacitor/preferences";


const API = "https://studyfirstapi-production.up.railway.app";

interface Assignment {
  id: number;
  title: string;
  class: string;
  dueTime: string;
  completed: boolean;
  source: string;
  description?: string;
  dueDate: Date;
  courseId?: string;
  classroomId?: string;
  classroomUrl?: string;
}

interface DayGroup {
  date: string;
  day: string;
  dateObj: Date;
  assignments: Assignment[];
}

export default function AssignmentsScreen() {
  const [weekData, setWeekData] = useState<DayGroup[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [loading, setLoading] = useState(true);

const fetchWeekTasks = async () => {
  const { value: token } = await Preferences.get({ key: "study_first_token" });
  try {
    const res = await fetch(`${API}/tasks/week`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.log("tasks/week failed with status:", res.status);
      return;
    }
    const tasks = await res.json();

      // Build 7-day grid starting from today
      const today = new Date();
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
      });

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const grouped: DayGroup[] = days.map((date, i) => {
        const dayTasks = tasks.filter((t: any) => {
  const taskDate = new Date(t.dueDate);
  return (
    taskDate.getFullYear() === date.getFullYear() &&
    taskDate.getMonth() === date.getMonth() &&
    taskDate.getDate() === date.getDate()
  );
});

        return {
          date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
          day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayNames[date.getDay()],
          dateObj: date,
          assignments: dayTasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  class: t.description?.split(":")[0] || "Task",
  dueTime: new Date(t.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  completed: t.isCompleted,
  source: t.isFromClassroom ? "google-classroom" : "manual",
  description: t.description,
  dueDate: new Date(t.dueDate),
  // Add these:
  courseId: t.courseId,
  classroomId: t.classroomId,
classroomUrl: t.courseId && t.classroomId
  ? `https://classroom.google.com/c/${btoa(t.courseId)}/a/${btoa(t.classroomId)}/details`
  : "https://classroom.google.com",
})),
        };
      });

      setWeekData(grouped);

      // Default to today's index if today has tasks, else keep 0
      const todayIndex = grouped.findIndex(d =>
        d.dateObj.toDateString() === today.toDateString()
      );
      setSelectedDay(todayIndex >= 0 ? todayIndex : 0);
    } catch (e) {
      console.error("Failed to fetch week tasks", e);
    } finally {
      setLoading(false);
    }
  };

const completeTask = async (id: number) => {
  const alreadyDone = weekData.some(d =>
    d.assignments.some(a => a.id === id && a.completed)
  );
  if (alreadyDone) return;

  const { value: token } = await Preferences.get({ key: "study_first_token" });
  try {
    await fetch(`${API}/tasks/${id}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setWeekData(prev => prev.map(day => ({
      ...day,
      assignments: day.assignments.map(a =>
        a.id === id ? { ...a, completed: true } : a
      ),
    })));

    // Check achievements after completion
    await fetch(`${API}/achievements/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

  } catch (e) {
    console.error("Failed to complete task", e);
  }
}; 

useEffect(() => {
  const init = async () => {
    const { value: token } = await Preferences.get({ key: "study_first_token" });
    if (token) fetchWeekTasks();
  };
  init();
}, []);

  const totalAssignments = weekData.reduce((acc, d) => acc + d.assignments.length, 0);
  const completedAssignments = weekData.reduce(
    (acc, d) => acc + d.assignments.filter(a => a.completed).length, 0
  );

  const currentDay = weekData[selectedDay];

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-[#1B1B1B] px-6 pt-12 pb-8 rounded-b-[3rem] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#F5C842]/20 backdrop-blur-sm rounded-2xl p-3">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Assignments</h1>
              <p className="text-gray-400">Weekly Overview</p>
            </div>
          </div>

          {/* Week Stats */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1B1B1B]">This Week</h3>
              <span className="text-[#F5C842] font-bold">
                {completedAssignments}/{totalAssignments}
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: totalAssignments > 0
                    ? `${(completedAssignments / totalAssignments) * 100}%`
                    : "0%",
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-y-0 left-0 bg-[#F5C842] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Day Selector */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading assignments...</div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1 overflow-x-auto">
                  <div className="flex gap-2">
                    {weekData.map((day, index) => {
                      const hasAssignments = day.assignments.length > 0;
                      const isSelected = selectedDay === index;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDay(index)}
                          className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all ${
                            isSelected
                              ? "bg-[#F5C842] text-[#1B1B1B] shadow-lg"
                              : hasAssignments
                              ? "bg-white text-[#1B1B1B] border-2 border-gray-200"
                              : "bg-white text-gray-400 border-2 border-gray-200"
                          }`}
                        >
                          <span className="text-xs font-medium">
                            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][day.dateObj.getDay()]}
                          </span>
                          <span className="text-lg font-bold">{day.dateObj.getDate()}</span>
                          {hasAssignments && !isSelected && (
                            <div className="w-1.5 h-1.5 bg-[#F5C842] rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(Math.min(weekData.length - 1, selectedDay + 1))}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Selected Day */}
              {currentDay && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{currentDay.day}</h2>
                    <span className="text-sm text-gray-500">{currentDay.date}</span>
                  </div>

                  {currentDay.assignments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No assignments due</h3>
                      <p className="text-gray-600">Enjoy your free day or get ahead on future work!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentDay.assignments.map((assignment) => (
                        <motion.div
                          key={assignment.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowAssignmentDetail(true);
                          }}
                          className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer transition-all ${
                            assignment.completed
                              ? "border-green-200 bg-green-50/50"
                              : "border-transparent hover:shadow-lg hover:border-purple-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!assignment.completed && assignment.source !== "google-classroom") 
                                completeTask(assignment.id);
                              }}
                              className="mt-1"
                            >
                              {assignment.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-300" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${assignment.completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                                {assignment.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">{assignment.class}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {assignment.dueTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AssignmentDetailModal
        assignment={selectedAssignment}
        isOpen={showAssignmentDetail}
        onClose={() => setShowAssignmentDetail(false)}
      />

      <BottomNav activePage="assignments" />
    </div>
  );
}