import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Smartphone,
  Calendar,
  LogOut,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import BottomNav from "./BottomNav";
import AppLockManagementModal from "./AppLockManagementModal";
import SignOutConfirmationModal from "./SignOutConfirmationModal";

interface SettingsItem {
  icon: any;
  label: string;
  value: string | boolean;
  color: string;
  toggle?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [installedApps, setInstalledApps] = useState([
    { id: 1, name: "Instagram", icon: "📷", locked: true, category: "Social Media" },
    { id: 2, name: "TikTok", icon: "🎵", locked: true, category: "Social Media" },
    { id: 3, name: "YouTube", icon: "▶️", locked: true, category: "Entertainment" },
    { id: 4, name: "Twitter", icon: "🐦", locked: true, category: "Social Media" },
    { id: 5, name: "Facebook", icon: "👥", locked: false, category: "Social Media" },
    { id: 6, name: "Snapchat", icon: "👻", locked: false, category: "Social Media" },
    { id: 7, name: "Netflix", icon: "🎬", locked: false, category: "Entertainment" },
    { id: 8, name: "Spotify", icon: "🎧", locked: false, category: "Entertainment" },
    { id: 9, name: "Reddit", icon: "🤖", locked: false, category: "Social Media" },
    { id: 10, name: "Discord", icon: "💬", locked: false, category: "Communication" },
    { id: 11, name: "Twitch", icon: "🎮", locked: false, category: "Entertainment" },
    { id: 12, name: "Pinterest", icon: "📌", locked: false, category: "Social Media" },
    { id: 13, name: "WhatsApp", icon: "📱", locked: false, category: "Communication" },
    { id: 14, name: "Telegram", icon: "✈️", locked: false, category: "Communication" },
    { id: 15, name: "Games", icon: "🎯", locked: false, category: "Entertainment" },
  ]);

  // Real user from localStorage
  const user = JSON.parse(localStorage.getItem("study_first_auth") || "{}");
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "?";

  const lockedAppsCount = installedApps.filter((app) => app.locked).length;

  const handleSaveApps = (updatedApps: typeof installedApps) => {
    setInstalledApps(updatedApps);
  };

  const navigate = useNavigate();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = () => {
    localStorage.clear();
    navigate("/auth");
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
        },
        {
          icon: BookOpen,
          label: "Google Classroom",
          value: "Connected",
          color: "text-green-600",
        },
        {
          icon: Calendar,
          label: "Sync Status",
          value: "Up to date",
          color: "text-purple-600",
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
          onToggle: () =>
            setNotificationsEnabled(!notificationsEnabled),
          color: "text-orange-600",
        },
        {
          icon: Bell,
          label: "Break Reminders",
          value: breakReminders,
          toggle: true,
          onToggle: () => setBreakReminders(!breakReminders),
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
          value: `${lockedAppsCount} apps`,
          color: "text-red-600",
          onClick: () => setShowAppLockModal(true),
        },
        {
          icon: Lock,
          label: "Break Duration",
          value: "15-30 min",
          color: "text-yellow-600",
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
              <h1 className="text-3xl font-bold text-white">
                Settings
              </h1>
              <p className="text-gray-400">
                Manage your preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mx-6 mt-6 mb-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F5C842] rounded-full flex items-center justify-center text-[#1B1B1B] text-2xl font-bold overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1B1B1B]">{user.name || "User"}</h3>
              <p className="text-gray-600">{user.email || ""}</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h2 className="text-lg font-bold text-[#1B1B1B]">
                {section.title}
              </h2>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div key={itemIndex}>
                      <div
                        className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                          item.onClick ? "cursor-pointer" : ""
                        }`}
                        onClick={item.onClick}
                      >
                        <div className={`${item.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.label}
                          </h3>
                          {!item.toggle &&
                            typeof item.value === "string" && (
                              <p className="text-sm text-gray-600">
                                {item.value}
                              </p>
                            )}
                        </div>
                        {item.toggle ? (
                          <button
                            onClick={item.onToggle}
                            className={`relative w-12 h-7 rounded-full transition-colors ${
                              item.value
                                ? "bg-purple-600"
                                : "bg-gray-300"
                            }`}
                          >
                            <motion.div
                              animate={{
                                x: item.value ? 20 : 0,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
                            />
                          </button>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
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

          {/* Danger Zone */}
          <div className="space-y-3 pb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Account Actions
            </h2>
            <button
              className="flex items-center gap-4 w-full p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 font-semibold hover:bg-red-100 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="w-6 h-6" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-gray-500">
            Study First v1.0.0
          </p>
        </div>
      </div>

      <AppLockManagementModal
        isOpen={showAppLockModal}
        onClose={() => setShowAppLockModal(false)}
      />

      <SignOutConfirmationModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
      />

      <BottomNav activePage="settings" />
    </div>
  );
}