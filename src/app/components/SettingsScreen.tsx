import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Smartphone,
  Calendar,
  LogOut,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import BottomNav from "./BottomNav";
import AppLock from "../../lib/applock";
import AppLockManagementModal from "./AppLockManagementModal";
import SignOutConfirmationModal from "./SignOutConfirmationModal";
import { Preferences } from "@capacitor/preferences";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { notificationsService } from '../services';

interface SettingsItem {
  icon: any;
  label: string;
  value: string | boolean;
  color: string;
  toggle?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  clickable?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);

  useEffect(() => {
    Preferences.get({ key: "notifications_enabled" }).then(({ value }) => {
      if (value !== null) setNotificationsEnabled(value === "true");
    });
    Preferences.get({ key: "break_reminders_enabled" }).then(({ value }) => {
      if (value !== null) setBreakReminders(value === "true");
    });
  }, []);

  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [lockedAppsCount, setLockedAppsCount] = useState(0);
  const [lastSynced, setLastSynced] = useState<string>("Never");
  const [user, setUser] = useState<any>({});

  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    Preferences.get({ key: "study_first_auth" }).then(({ value }) => {
      if (value) setUser(JSON.parse(value));
    });

    const loadLockedCount = async () => {
      const timer = setTimeout(() => setLockedAppsCount(0), 3000);
      try {
        const state = await Promise.race([
          AppLock.getLockingState(),
          new Promise((_, reject) => setTimeout(() => reject("timeout"), 2500))
        ]);
        clearTimeout(timer);
        setLockedAppsCount((state as any).lockedApps?.length ?? 0);
      } catch {
        clearTimeout(timer);
        setLockedAppsCount(0);
      }
    };
    loadLockedCount();

    Preferences.get({ key: "last_classroom_sync" }).then(({ value }) => {
      if (value) {
        const date = new Date(value);
        setLastSynced(
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
          ", " +
          date.toLocaleDateString([], { month: "short", day: "numeric" })
        );
      } else {
        setLastSynced("Never synced");
      }
    });
  }, []);

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "?";

  const handleSignOut = () => setShowSignOutModal(true);

 const confirmSignOut = async () => {
  setShowSignOutModal(false);

  // Initialize first to prevent NPE crash, then sign out
  try {
    await GoogleAuth.initialize({
      clientId: "551585504334-lj19g8dubm8hducajomkvomf8tte7a1a.apps.googleusercontent.com",
      scopes: ["profile", "email"],
      grantOfflineAccess: true,
    });
    await GoogleAuth.signOut();
  } catch (e) {
    console.warn("Google signOut ignored:", e);
  }

  await Promise.all([
    Preferences.remove({ key: "study_first_token" }),
    Preferences.remove({ key: "study_first_auth" }),
    Preferences.remove({ key: "current_user" }),
    Preferences.remove({ key: "has_logged_in" }),
  ]);

  navigate("/auth", { replace: true });
};

  const settingsSections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          value: user.name || "User",
          color: "text-blue-600",
          clickable: false,
        },
        {
          icon: BookOpen,
          label: "Google Classroom",
          value: "Connected",
          color: "text-green-600",
          clickable: false,
        },
        {
          icon: Calendar,
          label: "Last Synced",
          value: lastSynced,
          color: "text-purple-600",
          clickable: false,
        },
      ],
    },
    {
      title: "App Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          value: notificationsEnabled,
          toggle: true,
          onToggle: async () => {
            const newVal = !notificationsEnabled;
            setNotificationsEnabled(newVal);
            await Preferences.set({ key: "notifications_enabled", value: String(newVal) });
            if (!newVal) {
              await notificationsService.cancelDueTomorrowNotification();
              await notificationsService.cancelBreakReminders();
            }
          },
          color: "text-orange-600",
        },
        {
          icon: Bell,
          label: "Break Reminders",
          value: breakReminders,
          toggle: true,
          onToggle: async () => {
            const newVal = !breakReminders;
            setBreakReminders(newVal);
            await Preferences.set({ key: "break_reminders_enabled", value: String(newVal) });
            if (!newVal) await notificationsService.cancelBreakReminders();
          },
          color: "text-pink-600",
        },
      ],
    },
    {
      title: "App Lock",
      items: [
        {
          icon: Smartphone,
          label: "Locked Apps",
          value: lockedAppsCount === 0 ? "None selected" : `${lockedAppsCount} app${lockedAppsCount !== 1 ? "s" : ""}`,
          color: "text-red-600",
          onClick: () => setShowAppLockModal(true),
          clickable: true,
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-[#1B1B1B] px-6 pt-12 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#F5C842]/20 backdrop-blur-sm rounded-2xl p-3">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mx-6 mt-6 mb-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex-shrink-0 bg-[#F5C842] rounded-full flex items-center justify-center text-[#1B1B1B] text-xl font-bold overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#1B1B1B] truncate">{user.name || "User"}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h2 className="text-lg font-bold text-[#1B1B1B]">{section.title}</h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div key={itemIndex}>
                      <div
                        className={`flex items-center gap-4 p-4 transition-colors ${
                          item.clickable ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100" : "cursor-default"
                        }`}
                        onClick={item.clickable && item.onClick ? item.onClick : undefined}
                      >
                        <div className={item.color}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.label}</h3>
                          {!item.toggle && typeof item.value === "string" && (
                            <p className="text-sm text-gray-600">{item.value}</p>
                          )}
                        </div>
                        {item.toggle ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              item.onToggle?.();
                            }}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              item.value ? "bg-purple-600" : "bg-gray-300"
                            }`}
                          >
                            <motion.div
                              animate={{ x: item.value ? 20 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                            />
                          </button>
                        ) : item.clickable ? (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        ) : null}
                      </div>
                      {itemIndex < section.items.length - 1 && (
                        <div className="h-px bg-gray-100 mx-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sign Out */}
          <div className="space-y-3 pb-6">
            <h2 className="text-lg font-bold text-gray-900">Account Actions</h2>
            <button
              className="flex items-center gap-4 w-full p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 font-semibold hover:bg-red-100 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-6 h-6" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-gray-500">Study First v1.0.0</p>
        </div>
      </div>

      {showAppLockModal && (
        <AppLockManagementModal
          isOpen={showAppLockModal}
          onClose={() => {
            setShowAppLockModal(false);
            setTimeout(async () => {
              try {
                const state = await Promise.race([
                  AppLock.getLockingState(),
                  new Promise((_, reject) => setTimeout(() => reject(), 2000))
                ]);
                setLockedAppsCount((state as any).lockedApps?.length ?? 0);
              } catch {
                setLockedAppsCount(0);
              }
            }, 300);
          }}
        />
      )}

      <SignOutConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
      />

      <BottomNav activePage="settings" />
    </div>
  );
}