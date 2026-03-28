import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Lock, Unlock } from "lucide-react";

interface App {
  id: number;
  name: string;
  icon: string;
  locked: boolean;
  category: string;
}

interface AppLockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialApps: App[];
  onSave: (apps: App[]) => void;
}

export default function AppLockManagementModal({
  isOpen,
  onClose,
  initialApps,
  onSave,
}: AppLockManagementModalProps) {
  const [apps, setApps] = useState(initialApps);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleApp = (id: number) => {
    setApps(apps.map((app) => (app.id === id ? { ...app, locked: !app.locked } : app)));
  };

  const handleSave = () => {
    onSave(apps);
    onClose();
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lockedCount = apps.filter((app) => app.locked).length;

  const categories = Array.from(new Set(apps.map((app) => app.category)));

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
            className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Manage Locked Apps
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {lockedCount} {lockedCount === 1 ? "app" : "apps"} will be locked
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Apps List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {categories.map((category) => {
                const categoryApps = filteredApps.filter(
                  (app) => app.category === category
                );
                if (categoryApps.length === 0) return null;

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryApps.map((app) => (
                        <motion.div
                          key={app.id}
                          layout
                          className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-300 transition-colors"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                            {app.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {app.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {app.locked ? (
                                <>
                                  <Lock className="w-3 h-3 text-red-600" />
                                  <span className="text-xs text-red-600 font-medium">
                                    Will be locked
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Not locked
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleApp(app.id)}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              app.locked ? "bg-red-600" : "bg-gray-300"
                            }`}
                          >
                            <motion.div
                              animate={{ x: app.locked ? 20 : 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredApps.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No apps found
                  </h3>
                  <p className="text-gray-600">
                    Try searching for a different app name
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> Locked apps will be inaccessible when you
                  have assignments due today. Take a break to unlock them
                  temporarily.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
