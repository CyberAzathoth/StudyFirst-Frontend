import { motion, AnimatePresence } from "motion/react";
import { X, Clock, BookOpen, ExternalLink, FileText } from "lucide-react";
import { Browser } from "@capacitor/browser";

interface AssignmentDetailModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Assignment {
  id: number;
  title: string;
  class: string;
  dueTime: string;
  completed: boolean;
  source: string;
  description?: string;
  attachments?: string[];
  points?: number;
  classroomUrl?: string; // add this
}

export default function AssignmentDetailModal({
  assignment,
  isOpen,
  onClose,
}: AssignmentDetailModalProps) {
  if (!assignment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg">
                    {assignment.class}
                  </span>
                  {assignment.points && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                      {assignment.points} points
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {assignment.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Due {assignment.dueTime}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Badge */}
              {assignment.completed && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Completed</h3>
                    <p className="text-sm text-green-700">
                      Great job! This assignment has been turned in.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Instructions</h3>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {assignment.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">Attachments</h3>
                  </div>
                  <div className="space-y-2">
                    {assignment.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-purple-300 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-gray-900">
                          {attachment}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Classroom Link */}
              {assignment.source === "google-classroom" && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    View and submit this assignment in Google Classroom for full access to materials and submission options.
                  </p>
                  <button 
onClick={async () => {
  const url = assignment.classroomUrl || "https://classroom.google.com";
  await Browser.open({ url });
}}
  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
  Open in Google Classroom
  <ExternalLink className="w-4 h-4" />
</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
