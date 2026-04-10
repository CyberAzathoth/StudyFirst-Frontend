import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Preferences } from "@capacitor/preferences";
import {
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  Clock,
  Plus,
  X,
} from "lucide-react";
import BottomNav from "./BottomNav";
import BreakTimerModal from "./BreakTimerModal";
import AssignmentDetailModal from "./AssignmentDetailModal";
import AddTaskModal from "./AddTaskModal";
import { useBreakTimer } from "../../context/BreakTimerContext";
import AppLock from "../../lib/applock";
import { notificationsService } from '../services';



const API = "https://studyfirstapi-production.up.railway.app";

interface Assignment {
  id: number;
  title: string;
  class: string;
  dueTime: string;
  dueDate: Date;
  completed: boolean;
  source: string;
  description?: string;
  points?: number;
  attachments?: string[];
}

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showBreakModal, setShowBreakModal] = useState(false);
const { isActive: breakIsActive, setHasTodayTasks, showCooldownResetModal, setShowCooldownResetModal } = useBreakTimer();  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [assignmentJustCompleted, setAssignmentJustCompleted] = useState(false);

const [token, setToken] = useState<string | null>(null);
const [user, setUser] = useState<any>({});


useEffect(() => {
  Preferences.get({ key: "study_first_token" }).then(({ value }) => {
    console.log("TOKEN LOADED:", value ? "exists" : "null");
    setToken(value);
  });
  Preferences.get({ key: "study_first_auth" }).then(({ value }) => {
    if (value) setUser(JSON.parse(value));
  });
}, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };


  // Fetch today's tasks from backend
const fetchTasks = async (currentToken: string, forceNotif = false) => {
  console.log("FETCHING TASKS...");
  setLoading(true);
  try {
    const res = await fetch(`${API}/tasks`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    });
    console.log("TASKS STATUS:", res.status);
    if (res.ok) {
      const data = await res.json();
      const tasks = Array.isArray(data) ? data : data.value || [];
      console.log("TASKS COUNT:", tasks.length);
      console.log("TASKS DATA:", JSON.stringify(tasks));// handle both formats
  const mapped = tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    class: t.description?.includes(":") ? t.description.split(":")[0] : "General",
    dueTime: new Date(t.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dueDate: new Date(t.dueDate),
    completed: t.isCompleted,
    source: t.isFromClassroom ? "google-classroom" : "manual",
    description: t.description,
    courseId: t.courseId,
    classroomId: t.classroomId,
  }));
  setAssignments(mapped);

  const weekRes = await fetch(`${API}/tasks/week`, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${currentToken}`,
  },
});
const weekTasks = weekRes.ok ? await weekRes.json() : tasks;

// Schedule due-tomorrow notification
const mappedForNotif = weekTasks.map((t: any) => ({
  id: String(t.id),
  userId: "",
  title: t.title,
  dueDate: t.dueDate,
  completed: t.isCompleted,
  source: t.isFromClassroom ? "google-classroom" : "manual",
  createdAt: "",
  updatedAt: "",
}));
forceNotif
  ? await notificationsService.forceReschedule(mappedForNotif)
  : await notificationsService.scheduleIfNeeded(mappedForNotif);

const incompleteTodayTasks = mapped.filter((a: any) => !a.completed && isToday(new Date(a.dueDate)));
if (incompleteTodayTasks.length > 0) {
  setHasTodayTasks(true);
  try { await AppLock.resumeLocking(); } catch (e) {}
} else {
  setHasTodayTasks(false);
  try { await AppLock.pauseLocking(); } catch (e) {}
}
    }
  } catch (e) {
    console.error("Dashboard fetch failed", e);
  } finally {
    setLoading(false);
  }
};

const syncClassroom = async (currentToken: string) => {
  try {
    await fetch(`${API}/classroom/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${currentToken}` },
    });
    await Preferences.set({ key: "last_classroom_sync", value: new Date().toISOString() }); // ADD THIS
    await fetchTasks(currentToken, true);
  } catch (e) {
    console.error("Classroom sync failed", e);
  }
};

const fetchStreak = async (currentToken: string) => {
  try {
    const res = await fetch(`${API}/streaks/current`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setStreak(data.currentStreak || 0);
    }
  } catch (e) {
    console.error("Failed to fetch streak", e);
  }
};


const hasSynced = useRef(false);

useEffect(() => {
  console.log("TOKEN STATE:", token);
  if (!token) return;
  const init = async () => {
    console.log("INIT RUNNING");
    fetch(`${API}/streaks/recalculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }).catch(() => {});

    await fetchTasks(token);
if (!hasSynced.current) {
  hasSynced.current = true;
  await syncClassroom(token);
}
await fetchStreak(token);
  };
  init();
}, [token]);


  const todayAssignments = assignments.filter((a) => isToday(a.dueDate));
  const completedToday = todayAssignments.filter((a) => a.completed).length;
  const totalToday = todayAssignments.length;

const toggleAssignment = async (id: number) => {
  if (!token) return;
  try {
    await fetch(`${API}/tasks/${id}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setAssignments(prev => prev.map((a) =>
      a.id === id ? { ...a, completed: true } : a
    ));
    setAssignmentJustCompleted(true);

    await fetch(`${API}/streaks/recalculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    await fetchStreak(token);

    await fetch(`${API}/achievements/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    // Re-check lock state after completing a task
    await fetchTasks(token);
  } catch (e) {
    console.error("Failed to complete task", e);
  }
};

const addTask = async (task: { title: string; dueDate: Date; dueTime: string }) => {
  if (!token) return;
  try {
    const dueDateTime = new Date(task.dueDate);
    const [hours, minutes] = task.dueTime.split(":");
    dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: task.title,
        // Just send local time as-is — backend stores it directly as UTC
        dueDate: dueDateTime.toISOString().replace("Z", ""),
      }),
    });

    await fetchTasks(token);
  } catch (e) {
    console.error("Failed to add task", e);
  }
};

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
  {showCooldownResetModal && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 mx-4 mt-14"
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 shadow-xl text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h4 className="font-bold text-sm">Break cooldown reset!</h4>
            <p className="text-xs text-white/90">You can take a break now. Rest is part of the grind!</p>
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
  <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-[#1B1B1B] px-6 pt-12 pb-8 rounded-b-[3rem] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Today's Focus</h1>
              <p className="text-gray-400">{today}</p>
            </div>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="bg-[#F5C842]/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2"
            >
              <Flame className="w-6 h-6 text-[#F5C842] fill-[#F5C842]" />
              <div className="text-white">
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-xs text-gray-400">day streak</div>
              </div>
            </motion.div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1B1B1B]">Today's Progress</h3>
              <span className="text-[#F5C842] font-bold">
                {completedToday}/{totalToday}
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: totalToday > 0 ? `${(completedToday / totalToday) * 100}%` : "0%" }}
                transition={{ duration: 0.5 }}
                className="absolute inset-y-0 left-0 bg-[#F5C842] rounded-full"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Trophy className="w-4 h-4 text-[#F5C842]" />
              <span className="text-sm text-gray-600">
                {loading ? "Loading tasks..." :
                  totalToday === 0 ? "No tasks due today" :
                  completedToday === totalToday ? "All done! Great work! 🎉" :
                  `${totalToday - completedToday} tasks remaining`}
              </span>
            </div>
          </div>
        </div>

        {/* Assignments Section */}
<div className="px-6 py-6 space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-[#1B1B1B]">Due Today</h2>
    <div className="flex items-center gap-2">
 <button
  onClick={() => setShowBreakModal(true)}
  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-all ${
    breakIsActive
      ? "bg-green-500 text-white"
      : "bg-[#1B1B1B] text-white"
  }`}
>
  {breakIsActive ? "On Break" : "Break"}
</button>
      <button
        onClick={() => setShowAddTask(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#F5C842] text-[#1B1B1B] rounded-xl font-medium hover:bg-[#F5C842]/90 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Task
      </button>    
    </div>
  </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading tasks...</div>
          ) : todayAssignments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tasks due today</div>
          ) : (
            <div className="space-y-3">
              {todayAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                    assignment.completed
                      ? "border-green-200 bg-green-50/50"
                      : "border-gray-100 hover:shadow-md hover:border-[#F5C842]/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                        onClick={() => toggleAssignment(assignment.id)}
                        disabled={assignment.completed || assignment.source === "google-classroom"}
                            className={
                            assignment.completed || assignment.source === "google-classroom" 
                            ? "cursor-not-allowed opacity-60 mt-1" 
                            : "cursor-pointer mt-1"
                            }
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
                      {assignment.source === "manual" && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                          Manual Task
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddTask && (
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            onAddTask={addTask}
          />
        )}
      </AnimatePresence>

      <BreakTimerModal
        isOpen={showBreakModal}
        onClose={() => {
          setShowBreakModal(false);
          setAssignmentJustCompleted(false);
        }}
        assignmentJustCompleted={assignmentJustCompleted}
      />

      <AssignmentDetailModal
        assignment={selectedAssignment}
        isOpen={showAssignmentDetail}
        onClose={() => setShowAssignmentDetail(false)}
      />

      <BottomNav activePage="home" />
    </div>
  );
}