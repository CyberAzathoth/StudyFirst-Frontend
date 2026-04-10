import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Lock, Unlock, Loader } from "lucide-react";
import AppLock from "../../lib/applock";

interface App {
  packageName: string;
  appName: string;
  locked: boolean;
}

interface AppLockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppLockManagementModal({
  isOpen,
  onClose,
}: AppLockManagementModalProps) {
  const [apps, setApps] = useState<App[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

const fetchApps = async () => {
  setLoading(true);
  try {
    const [appsResult, stateResult] = await Promise.all([
      AppLock.getInstalledApps(),
      AppLock.getLockingState(),
    ]);

    const installedApps = appsResult.apps || [];
    const currentlyLocked: string[] = stateResult.lockedApps || [];

    setApps(
      installedApps.map((app: any) => ({
        packageName: app.packageName,
        appName: app.appName,
        locked: currentlyLocked.includes(app.packageName),
      }))
    );
  } catch (e: any) {
    console.error("Failed to load apps:", e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (isOpen) fetchApps();
  }, [isOpen]);

  const toggleApp = (packageName: string) => {
    setApps(apps.map((app) =>
      app.packageName === packageName ? { ...app, locked: !app.locked } : app
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const lockedPackages = apps.filter((a) => a.locked).map((a) => a.packageName);
      await AppLock.setLockedApps({ packages: lockedPackages });
    } catch (e) {
      console.error("Failed to save locked apps", e);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  const filteredApps = apps.filter((app) =>
    app.appName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lockedCount = apps.filter((a) => a.locked).length;

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
                  <h2 className="text-2xl font-bold text-gray-900">Manage Locked Apps</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {lockedCount} {lockedCount === 1 ? "app" : "apps"} will be locked
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#F5C842] transition-all"
                />
              </div>
            </div>

            {/* Apps List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader className="w-8 h-8 text-[#F5C842] animate-spin" />
                  <p className="text-gray-500">Loading installed apps...</p>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No apps found</h3>
                  <p className="text-gray-600">Try searching for a different app name</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredApps.map((app) => (
                    <motion.div
                      key={app.packageName}
                      layout
                      className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-[#F5C842]/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center text-xl font-bold text-gray-600">
                        {app.appName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{app.appName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {app.locked ? (
                            <>
                              <Lock className="w-3 h-3 text-red-600" />
                              <span className="text-xs text-red-600 font-medium">Will be locked</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Not locked</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleApp(app.packageName)}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          app.locked ? "bg-red-500" : "bg-gray-300"
                        }`}
                      >
                        <motion.div
                          animate={{ x: app.locked ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-4">
                <p className="text-sm text-yellow-900">
                  <strong>💡 Tip:</strong> Locked apps will be blocked when you have tasks due today. Take a break to unlock them temporarily.
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-6 py-4 bg-[#F5C842] text-[#1B1B1B] rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}