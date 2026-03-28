import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, LogOut, X } from "lucide-react";

interface SignOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SignOutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 px-6 py-8 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign Out?</h2>
              <p className="text-red-50">
                Are you sure you want to sign out of Study First?
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-orange-900">
                  <strong>⚠️ Note:</strong> You'll need to sign in again with your
                  Google Classroom account to continue using the app.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onConfirm}
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Yes, Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
