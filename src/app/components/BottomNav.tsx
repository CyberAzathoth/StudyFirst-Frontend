import { useNavigate } from "react-router";
import { Home, ListTodo, TrendingUp, Settings } from "lucide-react";

interface BottomNavProps {
  activePage: "home" | "assignments" | "progress" | "settings";
}

export default function BottomNav({ activePage }: BottomNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    { id: "assignments", icon: ListTodo, label: "Assignments", path: "/assignments" },
    { id: "progress", icon: TrendingUp, label: "Progress", path: "/progress" },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "bg-[#F5C842]/20 text-[#1B1B1B]"
                  : "text-gray-500 hover:text-[#1B1B1B]"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "stroke-[#1B1B1B] stroke-[2.5]" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}