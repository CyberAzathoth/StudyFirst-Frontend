import { Outlet } from "react-router";
import { BreakTimerProvider } from "../../context/BreakTimerContext";

export default function Root() {
  return (
    <BreakTimerProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Outlet />
      </div>
    </BreakTimerProvider>
  );
}