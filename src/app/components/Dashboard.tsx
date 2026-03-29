import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  Flame,
  Trophy,
  Clock,
  Plus,
} from "lucide-react";
import BottomNav from "./BottomNav";
import BreakTimerModal from "./BreakTimerModal";
import AssignmentDetailModal from "./AssignmentDetailModal";
import AddTaskModal from "./AddTaskModal";

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

const mockLockedApps = [
  { id: 1, name: "Instagram", icon: "📷", locked: true },
  { id: 2, name: "TikTok", icon: "🎵", locked: true },
  { id: 3, name: "YouTube", icon: "▶️", locked: true },
  { id: 4, name: "Twitter", icon: "🐦", locked: false },
];

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [lockedApps] = useState(mockLockedApps);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [assignmentJustCompleted, setAssignmentJustCompleted] = useState(false);

  const token = localStorage.getItem("study_first_token");
  const user = JSON.parse(localStorage.getItem("study_first_auth") || "{}");
  const googleAccessToken = localStorage.getItem("google_access_token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Fetch today's tasks from backend
  const fetchTasks = async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API}/tasks`, { 
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("study_first_token")}`
      } 
    });
    
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        class: t.description?.includes(":") ? t.description.split(":")[0] : "General",
        dueTime: new Date(t.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dueDate: new Date(t.dueDate),
        completed: t.isCompleted,
        source: t.isFromClassroom ? "google-classroom" : "manual",
        description: t.description,
      }));
      setAssignments(mapped);
    }
  } catch (e) {
    console.error("Dashboard fetch failed", e);
  } finally {
    setLoading(false);
  }
};

  // Sync Google Classroom
  const syncClassroom = async () => {
    if (!googleAccessToken) return;
    try {
      await fetch(`${API}/classroom/sync`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ accessToken: googleAccessToken }),
      });
      fetchTasks();
    } catch (e) {
      console.error("Classroom sync failed", e);
    }
  };

  // Fetch streak
  const fetchStreak = async () => {
    try {
      const res = await fetch(`${API}/streaks/current`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setStreak(data.currentStreak || 0);
      }
    } catch (e) {
      console.error("Failed to fetch streak", e);
    }
  };

  useEffect(() => {
    fetchTasks();
    syncClassroom();
    fetchStreak();
  }, []);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayAssignments = assignments.filter((a) => isToday(a.dueDate));
  const completedToday = todayAssignments.filter((a) => a.completed).length;
  const totalToday = todayAssignments.length;

const toggleAssignment = async (id: number) => {
    try {
      const res = await fetch(`${API}/tasks/${id}/complete`, {
        method: "PATCH",
        headers: authHeaders,
      });
      const data = await res.json();
      
      setAssignments(assignments.map((a) =>
        a.id === id ? { ...a, completed: true } : a
      ));
      setAssignmentJustCompleted(true);

      // If all tasks done, update streak
      if (data.allTasksDone) {
        await fetch(`${API}/streaks/update`, {
          method: "POST",
          headers: authHeaders,
        });
        fetchStreak();
      }
    } catch (e) {
      console.error("Failed to complete task", e);
    }
  };

  const addTask = async (task: { title: string; dueDate: Date; dueTime: string }) => {
    try {
      const dueDateTime = new Date(task.dueDate);
      const [hours, minutes] = task.dueTime.split(":");
      dueDateTime.setHours(parseInt(hours), parseInt(minutes));

      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: task.title,
          dueDate: dueDateTime.toISOString(),
        }),
      });
      const newTask = await res.json();
      setAssignments((prev) => [...prev, {
        id: newTask.id,
        title: newTask.title,
        class: "Manual Task",
        dueTime: task.dueTime,
        dueDate: new Date(newTask.dueDate),
        completed: false,
        source: "manual",
      }]);
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
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
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5C842] text-[#1B1B1B] rounded-xl font-medium hover:bg-[#F5C842]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
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

        {/* Locked Apps Section */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">App Lock Status</h2>
            <button
              onClick={() => setShowBreakModal(true)}
              className="px-4 py-2 bg-[#F5C842] text-[#1B1B1B] rounded-xl font-medium shadow-md shadow-[#F5C842]/30 hover:shadow-lg transition-all"
            >
              Take Break
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {lockedApps.map((app) => (
              <div
                key={app.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${
                  app.locked ? "border-red-200" : "border-green-200"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">{app.icon}</div>
                  <span className="font-medium text-gray-900 text-sm">{app.name}</span>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                    app.locked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {app.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span className="text-xs font-medium">{app.locked ? "Locked" : "Unlocked"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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